import * as vscode from "vscode";

import { AvatarManager } from "./avatarManager";
import { createBranch } from "./backend/actions/branch";
import { resetToCommit } from "./backend/actions/commit";
import { fetchFromRemotes, fetchRemote, listRemoteNames } from "./backend/actions/fetch";
import {
  addRemote,
  getRemoteUrl,
  removeRemote,
  renameRemote,
  setRemoteUrl
} from "./backend/actions/remote";
import { getUserDetails, setUserDetails } from "./backend/actions/userDetails";
import { gitClientFactory } from "./backend/gitClient";
import { getCommitFileContent } from "./backend/queries/commitFileContent";
import { loadDanglingCommits, loadReflog } from "./backend/queries/loadReflog";
import { formatGitError } from "./backend/utils/gitError";
import { buildExtensionUri, getPathFromUri } from "./backend/utils/path";
import { repoContainingPath, resolveToKnownRepo } from "./backend/utils/repoMatch";
import { config } from "./config";
import { decodeDiffDocUri, DiffDocProvider } from "./diffDocProvider";
import { AskpassManager } from "./extension/askpass/askpassManager";
import { createLogger } from "./extension/logger";
import { registerMessageHandlers } from "./extension/messageHandler";
import { createRepoManager } from "./extension/repoManager";
import { createScmRepoTracker } from "./extension/scmRepoTracker";
import { WebviewBridge, webviewBridgeFactory } from "./extension/webviewBridge";
import { createWebviewPanel, WebviewPanel } from "./extension/webviewPanel";
import { createRepoSearch } from "./extension/workspaceSearch";
import { createRepoWatcher } from "./extension/workspaceWatcher";
import { ExtensionState } from "./extensionState";
import * as l10n from "./l10n";
import { initL10n } from "./l10n";
import { RepoFileWatcher } from "./repoFileWatcher";
import { StatusBarItem } from "./statusBarItem";

export function activate(context: vscode.ExtensionContext) {
  initL10n(context.extensionPath);
  const outputChannel = vscode.window.createOutputChannel(l10n.t("outputChannel.text"));
  const logger = createLogger(outputChannel);
  const extensionState = new ExtensionState(context);
  const avatarManager = new AvatarManager(config.gitPath, extensionState);
  const statusBarItem = new StatusBarItem(context, config);
  // Prompt for remote credentials when git asks: the askpass env is
  // passed only to this client's git children, never onto the shared host env.
  const askpassManager = new AskpassManager();
  context.subscriptions.push(askpassManager);
  const gitClient = gitClientFactory(
    extensionState.getLastActiveRepo() ?? "",
    config.gitPath(),
    logger.logCmd,
    askpassManager.getEnv()
  );
  const repoManager = createRepoManager(extensionState, statusBarItem, config);
  const repoSearch = createRepoSearch(repoManager, config);
  const repoWatcher = createRepoWatcher(repoManager, config, repoSearch);
  const scmRepoTracker = createScmRepoTracker();
  let currentPanel: WebviewPanel | undefined;
  let currentBridge: WebviewBridge | undefined;

  void (async () => {
    repoManager.removeReposNotInWorkspace();
    if (!(await repoManager.checkReposExist())) repoManager.sendRepos();
    await repoSearch.searchWorkspaceForRepos();
    repoWatcher.startWatching();
    logger.log(
      "Searched workspace for repositories (found " +
        Object.keys(repoManager.getRepos()).length +
        ")"
    );
  })();

  // Mirror VSCode's built-in git discovery into repoManager so the Graph webview
  // (which lives behind repoManager) can switch to any repo the user selects in the
  // Source Control view. We only ADD — never remove — to avoid stomping on repoManager's
  // own discovery.
  const mirrorBuiltinIntoRepoManager = () => {
    const existing = repoManager.getRepos();
    let changed = false;
    for (const repoPath of scmRepoTracker.getRepoPaths()) {
      if (!existing[repoPath]) {
        repoManager.addRepo(repoPath);
        changed = true;
      }
    }
    if (changed) repoManager.sendRepos();
  };
  context.subscriptions.push(scmRepoTracker.onDidChangeRepos(mirrorBuiltinIntoRepoManager));
  mirrorBuiltinIntoRepoManager();

  // Map raw repo paths (e.g. from the SC selection) to the repos repoManager knows, resolving
  // symlinks and dropping any it hasn't discovered.
  const toKnownRepos = (paths: string[]): string[] => {
    const known = Object.keys(repoManager.getRepos());
    return paths
      .map((p) => resolveToKnownRepo(p, known) ?? p)
      .filter((p) => repoManager.getRepos()[p] !== undefined);
  };

  // Open (or reveal) the Graph panel, optionally switching it to a specific repo.
  // `targetRepoPath` is the repo to focus: supplied by the plugin sidebar's repo
  // row and by the native SCM view's title icon (its SourceControl rootUri).
  // When given, the graph switches to that repo even if a panel is already open;
  // without it we fall back to the last active / active-editor repo.
  const openGraphView = async (targetRepoPath?: string) => {
    const activeEditor = vscode.window.activeTextEditor;
    const column = activeEditor?.viewColumn;

    // An explicit target (sidebar row / SCM icon) wins; map it through any
    // symlink to the matching known repo. Otherwise optionally open to the repo
    // containing the active editor's file.
    let repoToOpen =
      targetRepoPath !== undefined
        ? (resolveToKnownRepo(targetRepoPath, Object.keys(repoManager.getRepos())) ??
          targetRepoPath)
        : undefined;
    if (
      repoToOpen === undefined &&
      config.openToTheRepoOfActiveEditor() &&
      activeEditor !== undefined
    ) {
      const filePath = getPathFromUri(activeEditor.document.uri);
      const repo = repoContainingPath(filePath, Object.keys(repoManager.getRepos()));
      if (repo !== null) repoToOpen = repo;
    }
    // Persist first so a freshly-created panel reads the right repo during its
    // initial `loadRepos` handshake — avoids racing the webview boot.
    if (repoToOpen) extensionState.setLastActiveRepo(repoToOpen);

    const hadPanel = currentPanel !== undefined;
    if (currentPanel) {
      currentPanel.reveal(column);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "git-graph-alter",
        l10n.t("outputChannel.text"),
        column ?? vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: config.retainContextWhenHidden(),
          localResourceRoots: [
            buildExtensionUri(context.extensionPath, "media"),
            buildExtensionUri(context.extensionPath, "out")
          ]
        }
      );
      let bridge!: WebviewBridge;
      const repoFileWatcher = new RepoFileWatcher(() => {
        if (panel.visible) bridge.post({ command: "refresh" });
      });
      bridge = webviewBridgeFactory(panel.webview, repoFileWatcher);
      currentBridge = bridge;
      avatarManager.registerBridge(bridge.post.bind(bridge));
      const { onPanelShown } = registerMessageHandlers(bridge, {
        config,
        gitClient,
        repoManager,
        extensionState,
        avatarManager,
        repoFileWatcher
      });
      currentPanel = createWebviewPanel({
        panel,
        bridge,
        config,
        repoFileWatcher,
        extensionPath: context.extensionPath,
        extensionState,
        avatarManager,
        repoManager,
        onDispose: () => {
          currentPanel = undefined;
          currentBridge = undefined;
        },
        onPanelShown
      });
    }

    // For an explicit target on an already-open panel, `loadRepos` alone won't
    // switch (it keeps a still-valid current repo), so follow up with `setRepo`
    // which unconditionally swaps. A fresh panel picks up the repo via its boot
    // handshake from the persisted lastActiveRepo above.
    if (targetRepoPath && repoToOpen && hadPanel && currentBridge) {
      currentBridge.post({
        command: "loadRepos",
        repos: repoManager.getRepos(),
        lastActiveRepo: repoToOpen
      });
      currentBridge.post({ command: "setRepo", repo: repoToOpen });
    }
  };

  // Follow the repo focused in the native Source Control view (`Repository.ui.selected`, which the
  // git API drives from the single focused repo). Open the graph on it, or switch an already-open
  // graph to it in place — without stealing focus. The initial selection is captured silently by
  // the tracker, so this only fires on a deliberate selection change.
  context.subscriptions.push(
    scmRepoTracker.onDidChangeSelection((selectedPaths) => {
      if (!config.followSourceControlSelection()) return;
      const selected = toKnownRepos(selectedPaths);
      if (selected.length === 0) return;
      if (!currentPanel) {
        void openGraphView(selected[0]);
        return;
      }
      // `loadRepos` refreshes the repo set; `setRepo` then switches unconditionally (it alone won't,
      // as it keeps a still-valid current repo). Neither reveals the panel, so focus isn't stolen.
      currentBridge?.post({
        command: "loadRepos",
        repos: repoManager.getRepos(),
        lastActiveRepo: selected[0]
      });
      currentBridge?.post({ command: "setRepo", repo: selected[0] });
    })
  );

  // The native SCM view invokes `view` with the git SourceControl whose `rootUri`
  // is the repo root; surface that path so the icon opens the graph for that repo
  // (matching a click on the plugin sidebar's repo row). Other callers (status
  // bar, command palette) pass nothing.
  const scmRepoPathFromArg = (arg: unknown): string | undefined => {
    if (typeof arg === "object" && arg !== null && "rootUri" in arg) {
      const rootUri = (arg as { rootUri?: vscode.Uri }).rootUri;
      if (rootUri) return getPathFromUri(rootUri);
    }
    return undefined;
  };

  // Auto-fetch: periodically fetch all remotes when enabled, then refresh an
  // open graph. Best-effort and silent — failures (offline, no remotes) must
  // not nag the user.
  let autoFetchTimer: ReturnType<typeof setInterval> | undefined;
  const restartAutoFetch = () => {
    if (autoFetchTimer !== undefined) {
      clearInterval(autoFetchTimer);
      autoFetchTimer = undefined;
    }
    if (!config.autoFetchEnabled()) return;
    const minutes = Math.min(60, Math.max(1, config.autoFetchIntervalMinutes()));
    autoFetchTimer = setInterval(
      () => {
        void (async () => {
          try {
            await fetchFromRemotes(gitClient.getInstance(), {
              prune: config.fetchAndPrune(),
              pruneTags: config.fetchAndPruneTags()
            });
            currentBridge?.post({ command: "refresh" });
          } catch {
            /* best-effort: stay silent on failure */
          }
        })();
      },
      minutes * 60 * 1000
    );
  };
  restartAutoFetch();
  context.subscriptions.push({
    dispose: () => {
      if (autoFetchTimer !== undefined) clearInterval(autoFetchTimer);
    }
  });

  context.subscriptions.push(
    outputChannel,
    vscode.commands.registerCommand("git-graph-alter.view", (arg?: unknown) =>
      openGraphView(scmRepoPathFromArg(arg))
    ),
    vscode.commands.registerCommand("git-graph-alter.sidebar.openGraph", (rawRepoPath?: string) =>
      openGraphView(rawRepoPath)
    ),
    vscode.commands.registerCommand("git-graph-alter.clearAvatarCache", () => {
      avatarManager.clearCache();
    }),
    vscode.commands.registerCommand("git-graph-alter.fetch", async () => {
      try {
        await fetchFromRemotes(gitClient.getInstance(), {
          prune: config.fetchAndPrune(),
          pruneTags: config.fetchAndPruneTags()
        });
        // Refresh an open graph so the freshly-fetched refs show immediately.
        currentBridge?.post({ command: "refresh" });
      } catch (e: unknown) {
        void vscode.window.showErrorMessage(l10n.t("error.unableToFetch") + ": " + formatGitError(e));
      }
    }),
    vscode.commands.registerCommand("git-graph-alter.manageRemotes", async () => {
      // View/add/edit/delete remotes; offered as a command since neo has
      // no settings widget.
      const git = gitClient.getInstance();
      try {
        const remotes = await listRemoteNames(git);
        const addLabel = l10n.t("remotes.add");
        const choice = await vscode.window.showQuickPick([...remotes, addLabel], {
          placeHolder: l10n.t("remotes.pickPrompt")
        });
        if (choice === undefined) return;
        if (choice === addLabel) {
          const name = await vscode.window.showInputBox({
            prompt: l10n.t("remotes.namePrompt"),
            ignoreFocusOut: true
          });
          if (!name) return;
          const url = await vscode.window.showInputBox({
            prompt: l10n.t("remotes.urlPrompt"),
            ignoreFocusOut: true
          });
          if (url === undefined) return;
          await addRemote(git, { name: name.trim(), url: url.trim() });
        } else {
          const editUrl = l10n.t("remotes.editUrl");
          const rename = l10n.t("remotes.rename");
          const remove = l10n.t("remotes.remove");
          const action = await vscode.window.showQuickPick([editUrl, rename, remove], {
            placeHolder: l10n.t("remotes.actionPrompt", choice)
          });
          if (action === undefined) return;
          if (action === editUrl) {
            const url = await vscode.window.showInputBox({
              prompt: l10n.t("remotes.urlPrompt"),
              value: await getRemoteUrl(git, choice),
              ignoreFocusOut: true
            });
            if (url === undefined) return;
            await setRemoteUrl(git, { name: choice, url: url.trim() });
          } else if (action === rename) {
            const newName = await vscode.window.showInputBox({
              prompt: l10n.t("remotes.renamePrompt"),
              value: choice,
              ignoreFocusOut: true
            });
            if (!newName || newName.trim() === choice) return;
            await renameRemote(git, { oldName: choice, newName: newName.trim() });
          } else {
            const yes = l10n.t("remotes.removeConfirmYes");
            const confirm = await vscode.window.showWarningMessage(
              l10n.t("remotes.removeConfirm", choice),
              { modal: true },
              yes
            );
            if (confirm !== yes) return;
            await removeRemote(git, { name: choice });
          }
        }
        currentBridge?.post({ command: "refresh" });
      } catch (e: unknown) {
        void vscode.window.showErrorMessage(
          l10n.t("error.unableToManageRemote") + ": " + (e instanceof Error ? e.message : String(e))
        );
      }
    }),
    vscode.commands.registerCommand("git-graph-alter.fetchRemote", async () => {
      // Fetch a single chosen remote, offered as a command.
      try {
        const git = gitClient.getInstance();
        const remotes = await listRemoteNames(git);
        if (remotes.length === 0) {
          void vscode.window.showInformationMessage(l10n.t("fetch.noRemotes"));
          return;
        }
        const remote =
          remotes.length === 1
            ? remotes[0]
            : await vscode.window.showQuickPick(remotes, {
                placeHolder: l10n.t("fetch.pickRemote")
              });
        if (remote === undefined) return; // cancelled
        await fetchRemote(git, {
          remote,
          prune: config.fetchAndPrune(),
          pruneTags: config.fetchAndPruneTags()
        });
        currentBridge?.post({ command: "refresh" });
      } catch (e: unknown) {
        void vscode.window.showErrorMessage(l10n.t("error.unableToFetch") + ": " + formatGitError(e));
      }
    }),
    vscode.commands.registerCommand("git-graph-alter.viewReflog", async () => {
      // Browse the reflog (and commits dangling beyond it) and recover any of
      // them. A command + QuickPick, since neo has no settings widget.
      const git = gitClient.getInstance();
      try {
        const [reflog, dangling] = await Promise.all([
          loadReflog(git),
          loadDanglingCommits(git)
        ]);
        const entries = [...reflog, ...dangling];
        if (entries.length === 0) {
          void vscode.window.showInformationMessage(l10n.t("reflog.empty"));
          return;
        }
        const danglingTag = l10n.t("reflog.danglingTag");
        const pick = await vscode.window.showQuickPick(
          entries.map((e) => ({
            label: `${e.dangling ? "$(warning) " : ""}${e.shortHash}  ${e.subject}`,
            description: e.dangling ? danglingTag : e.selector,
            entry: e
          })),
          { placeHolder: l10n.t("reflog.pickPrompt"), matchOnDescription: true }
        );
        if (pick === undefined) return; // cancelled
        const hash = pick.entry.hash;
        const createBranchLabel = l10n.t("reflog.createBranch");
        const resetLabel = l10n.t("reflog.resetHard");
        const copyLabel = l10n.t("reflog.copyHash");
        const action = await vscode.window.showQuickPick(
          [createBranchLabel, resetLabel, copyLabel],
          { placeHolder: l10n.t("reflog.actionPrompt", pick.entry.shortHash) }
        );
        if (action === undefined) return;
        if (action === createBranchLabel) {
          const name = (
            await vscode.window.showInputBox({
              prompt: l10n.t("reflog.branchNamePrompt"),
              ignoreFocusOut: true
            })
          )?.trim();
          if (!name) return;
          await createBranch(git, {
            commitHash: hash,
            branchName: name,
            checkout: false,
            force: false
          });
        } else if (action === resetLabel) {
          const yes = l10n.t("reflog.resetConfirmYes");
          const confirm = await vscode.window.showWarningMessage(
            l10n.t("reflog.resetConfirm", pick.entry.shortHash),
            { modal: true },
            yes
          );
          if (confirm !== yes) return;
          await resetToCommit(git, { commitHash: hash, resetMode: "hard" });
        } else {
          await vscode.env.clipboard.writeText(hash);
        }
        currentBridge?.post({ command: "refresh" });
      } catch (e: unknown) {
        void vscode.window.showErrorMessage(l10n.t("reflog.unableTo") + ": " + formatGitError(e));
      }
    }),
    vscode.commands.registerCommand("git-graph-alter.exportRepoConfig", () => {
      // Export the repo's Git Graph config to a committable .vscode file.
      const repo = extensionState.getLastActiveRepo();
      const repos = repoManager.getRepos();
      if (!repo || !repos[repo]) {
        void vscode.window.showInformationMessage(l10n.t("repoName.noRepos"));
        return;
      }
      const error = repoManager.exportRepoConfig(repo);
      if (error === null) {
        void vscode.window.showInformationMessage(l10n.t("exportConfig.done"));
      } else {
        void vscode.window.showErrorMessage(l10n.t("exportConfig.failed") + ": " + error);
      }
    }),
    vscode.commands.registerCommand("git-graph-alter.toggleRemoteVisibility", async () => {
      // Show/hide the branches of individual remotes for the current repo.
      const repo = extensionState.getLastActiveRepo();
      const repos = repoManager.getRepos();
      if (!repo || !repos[repo]) {
        void vscode.window.showInformationMessage(l10n.t("repoName.noRepos"));
        return;
      }
      const remotes = await listRemoteNames(gitClient.getInstance());
      if (remotes.length === 0) {
        void vscode.window.showInformationMessage(l10n.t("fetch.noRemotes"));
        return;
      }
      const hidden = repos[repo].hiddenRemotes ?? [];
      const picked = await vscode.window.showQuickPick(
        remotes.map((r) => ({ label: r, picked: !hidden.includes(r) })),
        { canPickMany: true, placeHolder: l10n.t("remoteVisibility.prompt") }
      );
      if (picked === undefined) return; // cancelled
      const visible = new Set(picked.map((p) => p.label));
      const newHidden = remotes.filter((r) => !visible.has(r));
      repoManager.setRepoState(repo, { ...repos[repo], hiddenRemotes: newHidden });
      repoManager.sendRepos();
      currentBridge?.post({ command: "refresh" });
    }),
    vscode.commands.registerCommand("git-graph-alter.setRepoName", async () => {
      // Custom display name for a repo in the Repo dropdown; a command
      // since neo has no settings widget.
      const repos = repoManager.getRepos();
      const repoPaths = Object.keys(repos);
      if (repoPaths.length === 0) {
        void vscode.window.showInformationMessage(l10n.t("repoName.noRepos"));
        return;
      }
      const repo =
        repoPaths.length === 1
          ? repoPaths[0]
          : await vscode.window.showQuickPick(repoPaths, {
              placeHolder: l10n.t("repoName.pickPrompt")
            });
      if (repo === undefined) return;
      const name = await vscode.window.showInputBox({
        prompt: l10n.t("repoName.prompt"),
        value: repos[repo].customName ?? "",
        ignoreFocusOut: true
      });
      if (name === undefined) return; // cancelled
      const trimmed = name.trim();
      repoManager.setRepoState(repo, {
        ...repos[repo],
        customName: trimmed === "" ? null : trimmed
      });
      repoManager.sendRepos();
    }),
    vscode.commands.registerCommand("git-graph-alter.openExtensionSettings", () => {
      // Quick access to this extension's settings.
      void vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "@ext:your-publisher.vscode-git-graph-alter"
      );
    }),
    vscode.commands.registerCommand("git-graph-alter.setGitUserDetails", async () => {
      // neo has no Settings Widget; the local/global user name & email are set
      // through this command instead.
      const git = gitClient.getInstance();
      const current = await getUserDetails(git);
      const name = await vscode.window.showInputBox({
        prompt: l10n.t("userDetails.namePrompt"),
        value: current.name,
        ignoreFocusOut: true
      });
      if (name === undefined) return; // cancelled
      const email = await vscode.window.showInputBox({
        prompt: l10n.t("userDetails.emailPrompt"),
        value: current.email,
        ignoreFocusOut: true
      });
      if (email === undefined) return;
      const localLabel = l10n.t("userDetails.scopeLocal");
      const globalLabel = l10n.t("userDetails.scopeGlobal");
      const scope = await vscode.window.showQuickPick([localLabel, globalLabel], {
        placeHolder: l10n.t("userDetails.scopePrompt")
      });
      if (scope === undefined) return;
      try {
        await setUserDetails(git, {
          name: name.trim(),
          email: email.trim(),
          useGlobal: scope === globalLabel
        });
        void vscode.window.showInformationMessage(l10n.t("userDetails.updated"));
      } catch (e: unknown) {
        void vscode.window.showErrorMessage(
          l10n.t("userDetails.unableToSet") + ": " + (e instanceof Error ? e.message : String(e))
        );
      }
    }),
    vscode.commands.registerCommand("git-graph-alter.getVersionInfo", async () => {
      let gitVersion = "git: unknown";
      try {
        gitVersion = (await gitClient.getInstance().raw(["--version"])).trim();
      } catch {
        /* git not available; report what we can */
      }
      const info = [
        "Git Graph Alter: " + context.extension.packageJSON.version,
        "Visual Studio Code: " + vscode.version,
        "OS: " + process.platform + " " + process.arch,
        gitVersion
      ].join("\n");
      const copy = await vscode.window.showInformationMessage(
        info,
        { modal: true },
        l10n.t("versionInfo.copy")
      );
      if (copy !== undefined) await vscode.env.clipboard.writeText(info);
    }),
    vscode.commands.registerCommand("git-graph-alter.openFileFromDiff", (uri?: vscode.Uri) => {
      // Opens the working-tree version of the file shown in a Git Graph diff
      // editor. `uri` is supplied by the editor/title menu; fall back to the
      // active editor.
      const target = uri ?? vscode.window.activeTextEditor?.document.uri;
      if (target === undefined || target.scheme !== DiffDocProvider.scheme) return;
      const { repo, filePath } = decodeDiffDocUri(target);
      void vscode.commands.executeCommand("vscode.open", vscode.Uri.file(`${repo}/${filePath}`), {
        preview: true
      });
    }),
    vscode.workspace.registerTextDocumentContentProvider(
      DiffDocProvider.scheme,
      new DiffDocProvider((repo, commit, filePath) =>
        getCommitFileContent(
          config.gitPath(),
          repo,
          commit,
          filePath,
          // Resolve fileEncoding at the repo's Workspace Folder scope.
          config.fileEncoding(vscode.Uri.file(repo))
        )
      )
    ),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("git-graph-alter.showStatusBarItem")) {
        statusBarItem.refresh();
      } else if (e.affectsConfiguration("git-graph-alter.maxDepthOfRepoSearch")) {
        repoSearch.maxDepthChanged();
      } else if (e.affectsConfiguration("git.path")) {
        gitClient.setGitPath(config.gitPath());
      } else if (e.affectsConfiguration("git-graph-alter.autoFetch")) {
        restartAutoFetch();
      }
    }),
    repoWatcher,
    scmRepoTracker
  );

  logger.log("Extension activated successfully");
}

export function deactivate() {}
