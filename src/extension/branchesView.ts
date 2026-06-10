import * as vscode from "vscode";

import * as l10n from "@/l10n";

import { BranchDataService } from "./branchDataService";
import { BranchFilterStore } from "./branchFilterStore";
import { type BranchTreeLeaf, type BranchTreeNode, buildBranchTree } from "./branchTree";

/** A TreeItem backed by one node of the branch tree. Carries the node and its
 *  repo so commands invoked from the context menu have everything they need. */
class BranchItem extends vscode.TreeItem {
  constructor(
    public readonly node: BranchTreeNode,
    public readonly repo: string
  ) {
    super(
      node.name,
      node.type === "folder"
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );
    if (node.type === "folder") {
      // A stable id keeps expansion/selection across refreshes.
      this.id = repo + "::folder::" + node.path;
      this.contextValue = "branch-folder";
      this.iconPath = vscode.ThemeIcon.Folder;
    } else {
      this.id = repo + "::branch::" + node.branch;
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
      // No `command`: a left click selects (and filters); git operations are on
      // the right-click context menu.
    }
  }
}

class BranchesProvider implements vscode.TreeDataProvider<BranchItem> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<BranchItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private roots: BranchTreeNode[] = [];
  private repo: string | null = null;
  // Guards against an in-flight fetch being overwritten by a slower earlier one.
  private fetchId = 0;

  constructor(
    private readonly dataService: BranchDataService,
    private readonly resolveShowRemote: (repo: string) => boolean
  ) {}

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
    if (repo === null) {
      this.roots = [];
      this._onDidChangeTreeData.fire();
      return;
    }
    try {
      const { branches, head, isRepo } = await this.dataService.listBranches(
        repo,
        this.resolveShowRemote(repo)
      );
      if (id !== this.fetchId) return; // superseded by a newer fetch
      this.roots = isRepo ? buildBranchTree(branches, head) : [];
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
        : element.node.type === "folder"
          ? element.node.children
          : [];
    return nodes.map((node) => new BranchItem(node, this.repo!));
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
export function createBranchesView(deps: {
  dataService: BranchDataService;
  filterStore: BranchFilterStore;
  /** Resolve the "show remote branches" state for a repo (per-repo override or
   *  the global default). Re-read on every reload so the side-view's toggle
   *  takes effect immediately. */
  resolveShowRemote: (repo: string) => boolean;
}) {
  const provider = new BranchesProvider(deps.dataService, deps.resolveShowRemote);
  const treeView = vscode.window.createTreeView<BranchItem>("git-graph-alter.branches", {
    treeDataProvider: provider,
    canSelectMany: true,
    showCollapseAll: true
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
    dispose: (): void => {
      if (debounce !== undefined) clearTimeout(debounce);
      selectionSub.dispose();
      treeView.dispose();
      provider.dispose();
    }
  };
}
