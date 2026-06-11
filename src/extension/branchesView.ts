import * as vscode from "vscode";

import * as l10n from "@/l10n";

import { classifyInactive, relativeAge } from "./branchActivity";
import { BranchDataService } from "./branchDataService";
import { BranchFilterStore } from "./branchFilterStore";
import { type BranchTreeLeaf, type BranchTreeNode, buildGroupedBranchRoots } from "./branchTree";

/** Scheme of the opaque per-branch URIs given to inactive leaves so the
 *  FileDecorationProvider below can dim them. */
const INACTIVE_SCHEME = "gga-branch";

/** An opaque URI carrying the branch ref, used only to attach the "inactive"
 *  file decoration (dimmed label). */
function inactiveBranchUri(ref: string): vscode.Uri {
  return vscode.Uri.from({
    scheme: INACTIVE_SCHEME,
    authority: "inactive",
    path: "/" + encodeURIComponent(ref)
  });
}

/** A TreeItem backed by one node of the branch tree. Carries the node and its
 *  repo so commands invoked from the context menu have everything they need. */
class BranchItem extends vscode.TreeItem {
  constructor(
    public readonly node: BranchTreeNode,
    public readonly repo: string,
    selectionGen: number
  ) {
    super(
      node.type === "group" ? l10n.t("branchView.group." + node.kind) : node.name,
      node.type === "group"
        ? vscode.TreeItemCollapsibleState.Expanded
        : node.type === "folder"
          ? vscode.TreeItemCollapsibleState.Collapsed
          : vscode.TreeItemCollapsibleState.None
    );
    if (node.type === "group") {
      // A stable id keeps the user's collapse choice across refreshes. No icon:
      // the bare expanded label reads as a section heading.
      this.id = repo + "::group::" + node.kind;
      this.contextValue = "branch-group";
    } else if (node.type === "folder") {
      // A stable folder id keeps expansion across refreshes (and across the
      // "Show All" selection reset, which only re-keys leaves).
      this.id = repo + "::folder::" + node.path;
      this.contextValue = "branch-folder";
      this.iconPath = vscode.ThemeIcon.Folder;
    } else {
      // The selection generation is part of the leaf id so "Show All" can clear
      // the visual selection by bumping it: VSCode drops the selection of ids
      // that no longer exist. Within a generation the id is stable, so a normal
      // refresh (after a git op) preserves the selection.
      this.id = "branch::" + selectionGen + "::" + repo + "::" + node.branch;
      this.contextValue = node.isRemote
        ? "branch-remote"
        : node.isHead
          ? "branch-current"
          : "branch-local";
      this.iconPath = new vscode.ThemeIcon(
        node.isHead ? "check" : node.isRemote ? "cloud" : "git-branch"
      );
      if (node.isHead) this.description = l10n.t("branchView.current");
      this.tooltip = node.branch;
      if (node.isInactive) {
        // Dimmed via the FileDecorationProvider keyed on this scheme; the age
        // label hints how long the branch has been idle. (Inactive leaves are
        // never the head, so this never clobbers the "current" description.)
        this.resourceUri = inactiveBranchUri(node.branch);
        if (node.lastActivitySec !== undefined) {
          const age = relativeAge(node.lastActivitySec, Math.floor(Date.now() / 1000));
          this.description = l10n.t("branchView.age." + age.unit, age.value);
        }
      }
      // No `command`: a left click selects (and filters); git operations are on
      // the right-click context menu.
    }
  }
}

/** Shared dependencies of the side-view: data, the filter store (selection
 *  drives the graph; the current selection also exempts branches from inactive
 *  hiding), and the per-repo/config state resolvers — re-read on every reload
 *  so the title toggles and setting edits take effect immediately. */
type BranchesProviderDeps = {
  dataService: BranchDataService;
  filterStore: BranchFilterStore;
  /** The "show remote branches" state for a repo (per-repo override or the
   *  global default). */
  resolveShowRemote: (repo: string) => boolean;
  /** The "show inactive branches" state for a repo (per-repo override or the
   *  global default). */
  resolveShowInactive: (repo: string) => boolean;
  /** The inactivity threshold in days (`<= 0` disables the feature). */
  resolveInactiveThresholdDays: () => number;
  /** "Always show" name/glob patterns that exempt a branch from being hidden. */
  resolveExemptPatterns: () => string[];
};

class BranchesProvider implements vscode.TreeDataProvider<BranchItem> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<BranchItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private roots: BranchTreeNode[] = [];
  private repo: string | null = null;
  // Guards against an in-flight fetch being overwritten by a slower earlier one.
  private fetchId = 0;
  // Bumped by "Show All" to re-key leaf items and so clear the visual selection.
  private selectionGen = 0;

  constructor(private readonly deps: BranchesProviderDeps) {}

  getRepo(): string | null {
    return this.repo;
  }

  setRepo(repo: string | null): void {
    if (repo === this.repo) return;
    this.repo = repo;
    this.roots = [];
    void this.reload();
  }

  refresh(): void {
    void this.reload();
  }

  private async reload(): Promise<void> {
    const id = ++this.fetchId;
    const repo = this.repo;
    const showInactive = repo !== null && this.deps.resolveShowInactive(repo);
    // Keep the title toggles' icons in sync with the active repo's state.
    void vscode.commands.executeCommand(
      "setContext",
      "git-graph-alter.branchView.showingRemote",
      repo !== null && this.deps.resolveShowRemote(repo)
    );
    void vscode.commands.executeCommand(
      "setContext",
      "git-graph-alter.branchView.showingInactive",
      showInactive
    );
    if (repo === null) {
      this.roots = [];
      this._onDidChangeTreeData.fire();
      return;
    }
    try {
      const { branches, head, isRepo, branchDates } = await this.deps.dataService.listBranches(
        repo,
        this.deps.resolveShowRemote(repo)
      );
      if (id !== this.fetchId) return; // superseded by a newer fetch
      if (!isRepo) {
        this.roots = [];
      } else {
        // A branch is "inactive" when idle beyond the threshold and not exempt
        // (head / selected / always-show). When hidden we drop them before
        // building the tree (empty folders fall away with their leaves); when
        // shown we tag them so the view dims them. The selection used for
        // exemption is read here, so toggling to "hide" keeps a branch that was
        // selected while inactive ones were shown.
        const inactive = classifyInactive({
          branches,
          head,
          dates: branchDates,
          nowSec: Math.floor(Date.now() / 1000),
          thresholdDays: this.deps.resolveInactiveThresholdDays(),
          exemptPatterns: this.deps.resolveExemptPatterns(),
          selected: this.deps.filterStore.get(repo)
        });
        this.roots = showInactive
          ? buildGroupedBranchRoots(branches, head, { inactive, dates: branchDates })
          : buildGroupedBranchRoots(
              branches.filter((b) => !inactive.has(b)),
              head
            );
      }
    } catch {
      if (id !== this.fetchId) return;
      this.roots = [];
    }
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: BranchItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: BranchItem): BranchItem[] {
    if (this.repo === null) return [];
    const nodes =
      element === undefined
        ? this.roots
        : element.node.type === "folder" || element.node.type === "group"
          ? element.node.children
          : [];
    return nodes.map((node) => new BranchItem(node, this.repo!, this.selectionGen));
  }

  /** Clear the visual selection by re-keying leaf items (VSCode drops selection
   *  of ids that no longer exist); folder expansion is preserved. */
  clearSelection(): void {
    this.selectionGen++;
    this._onDidChangeTreeData.fire();
  }

  dispose(): void {
    this._onDidChangeTreeData.dispose();
  }
}

/** The selected leaf branches in a TreeView selection (folders ignored). */
function selectedBranchRefs(items: BranchItem[]): string[] {
  return items
    .filter((i): i is BranchItem & { node: BranchTreeLeaf } => i.node.type === "leaf")
    .map((i) => i.node.branch);
}

/** The branch a context-menu command operates on. */
export type BranchActionTarget = {
  repo: string;
  branch: string;
  isRemote: boolean;
  isCurrent: boolean;
};

/** Resolve the action target from a context-menu command argument (the clicked
 *  tree item), or null when it isn't a branch leaf (e.g. a folder). */
export function branchActionTarget(item: unknown): BranchActionTarget | null {
  if (item instanceof BranchItem && item.node.type === "leaf") {
    return {
      repo: item.repo,
      branch: item.node.branch,
      isRemote: item.node.isRemote,
      isCurrent: item.node.isHead
    };
  }
  return null;
}

export type BranchesView = ReturnType<typeof createBranchesView>;

/**
 * Create and wire the Branches side-view: a native multi-select TreeView whose
 * selection drives the per-repo branch filter (empty selection = show all). The
 * view follows whichever repo is active and re-reads its branches on demand.
 */
export function createBranchesView(deps: BranchesProviderDeps) {
  const provider = new BranchesProvider(deps);
  const treeView = vscode.window.createTreeView<BranchItem>("git-graph-alter.branches", {
    treeDataProvider: provider,
    canSelectMany: true,
    showCollapseAll: true
  });

  // Dims inactive branch leaves (which carry an `INACTIVE_SCHEME` resourceUri);
  // returns nothing for every other resource in the workbench.
  const inactiveDecoration: vscode.FileDecoration = {
    color: new vscode.ThemeColor("disabledForeground")
  };
  const decorationSub = vscode.window.registerFileDecorationProvider({
    provideFileDecoration: (uri) =>
      uri.scheme === INACTIVE_SCHEME ? inactiveDecoration : undefined
  });

  // Debounce so a rapid multi-select (Ctrl/Cmd-click several branches) coalesces
  // into a single graph reload rather than one per click.
  let debounce: ReturnType<typeof setTimeout> | undefined;
  // The repo whose selection we last observed: lets us tell a genuine user
  // "deselect all" (→ show all) apart from the empty selection VSCode emits when
  // the tree is rebuilt for a different repo (whose items have different ids).
  let lastSelectionRepo: string | null = null;
  const selectionSub = treeView.onDidChangeSelection((e) => {
    const repo = provider.getRepo();
    if (repo === null) return;
    const branches = selectedBranchRefs([...e.selection]);
    // Ignore the empty-selection event that follows a repo switch; honouring it
    // would clobber the new repo's filter with "show all".
    if (branches.length === 0 && repo !== lastSelectionRepo) {
      lastSelectionRepo = repo;
      return;
    }
    lastSelectionRepo = repo;
    if (debounce !== undefined) clearTimeout(debounce);
    debounce = setTimeout(() => deps.filterStore.set(repo, branches), 200);
  });

  return {
    setActiveRepo: (repo: string | null): void => {
      // Drop any pending write from the previous repo before switching.
      if (debounce !== undefined) {
        clearTimeout(debounce);
        debounce = undefined;
      }
      provider.setRepo(repo);
    },
    getActiveRepo: (): string | null => provider.getRepo(),
    refresh: (): void => provider.refresh(),
    clearSelection: (): void => provider.clearSelection(),
    dispose: (): void => {
      if (debounce !== undefined) clearTimeout(debounce);
      selectionSub.dispose();
      decorationSub.dispose();
      treeView.dispose();
      provider.dispose();
    }
  };
}
