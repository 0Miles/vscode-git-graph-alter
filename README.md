<div align="center">
  <img src="./resources/icon.png" height="128"/>
  <samp>
    <h1>Git Graph Alter</h1>
    <h3>A visual Git extension focused on Git sidebar integration and multi-repository workflows</h3>
  </samp>
</div>

> This project is an independent MIT-licensed fork lineage based on (neo) Git Graph, which itself is a clean MIT fork of the original Git Graph.  
> It is **not** affiliated with, endorsed by, or maintained by the original Git Graph project, (neo) Git Graph, or Microsoft.  
> this extension only credits it as the upstream source of its MIT-licensed code (see
> [Attribution & lineage](#attribution--lineage)).

[![](https://img.shields.io/github/license/0Miles/vscode-git-graph-alter)](https://github.com/0Miles/vscode-git-graph-alter?tab=MIT-1-ov-file)
[![GitHub release](https://img.shields.io/github/v/release/0Miles/vscode-git-graph-alter)](https://github.com/0Miles/vscode-git-graph-alter/releases)
[![vscode downloads](https://img.shields.io/visual-studio-marketplace/d/0miles.vscode-git-graph-alter?label=download)](https://marketplace.visualstudio.com/items?itemName=0miles.vscode-git-graph-alter)
[![vscode installs](https://img.shields.io/visual-studio-marketplace/i/0miles.vscode-git-graph-alter?label=install)](https://marketplace.visualstudio.com/items?itemName=0miles.vscode-git-graph-alter)

## What Git Graph Alter is

Git Graph Alter is a Source Control extension for Visual Studio Code. Its focus is bringing the Git
history workflow into the **native Source Control sidebar** — including dedicated **Branches** and
**Remotes** side views — so you can inspect history and manage branches and remotes without leaving
the sidebar, with first-class support for **workspaces that contain many repositories**.

It also includes a commit-graph webview for visualizing history, but the design direction is
deliberately sidebar- and multi-repo-first, rather than centered on a single dedicated graph panel.

## How it differs from Git Graph–style extensions

This is maintained as a separate fork rather than as a contribution to its upstream because the
product direction differs:

- **Sidebar-first.** Branches and Remotes live as side views in the Source Control container; history
  follows the repository selected in the Source Control view.
- **Multi-repository workflows.** Designed for workspaces with several repositories, with per-repo
  selection and grouping.
- **Localized UI.** English, Simplified Chinese, and Traditional Chinese.
- **Devcontainer / remote ready.** Works in remote and container environments.

Git Graph–style extensions are generally centered on a dedicated commit-graph Webview Panel; Git
Graph Alter integrates the same kind of history workflow into the sidebar instead.

## Features

- **Branches view**: A sidebar view with search, multi-select, remote/local grouping, and an inactive-branch filter
- **Remotes view**: Add, edit, rename, and remove remotes from the sidebar
- **Source Control integration**: History follows the repository selected in the Source Control view
- **Multi-repo**: Work with multiple repositories in one workspace
- **Graph view**: See branches, tags, stashes, and uncommitted changes in one graph
- **Commit details**: Click a commit to see message, files, and diffs
- **Branch actions**: Create, checkout, rename, delete, merge, rebase, and push
- **Tag actions**: Create, delete, and push tags
- **Commit actions**: Checkout, cherry-pick, revert, and reset
- **Avatar support**: Optional avatars from GitHub, GitLab, or Gravatar
- **Devcontainer ready**: Works in remote and container environments

## Configuration

All settings live under the `git-graph-alter.*` prefix. The easiest way to
configure the extension is the Settings UI — open Settings and search for
**Git Graph Alter**.

A few commonly adjusted settings:

| Setting                                      | Default       | Description                                      |
| -------------------------------------------- | ------------- | ------------------------------------------------ |
| `git-graph-alter.history.fetchAvatars`       | `false`       | Fetch avatars (sends email to external services) |
| `git-graph-alter.dates.format`               | `Date & Time` | Date format shown in the date column             |
| `git-graph-alter.dates.type`                 | `Author Date` | `Author Date` or `Commit Date`                   |
| `git-graph-alter.graph.edgeStyle`            | `rounded`     | `rounded` or `angular`                           |
| `git-graph-alter.history.initialCommitCount` | `300`         | Commits to load on open                          |
| `git-graph-alter.repoSearchDepth`            | `0`           | Folder depth for repository search               |
| `git-graph-alter.statusBarButton`            | `true`        | Show the status bar button                       |

See `contributes.configuration` in `package.json` for the full list of settings.

## Installation

Search for **Git Graph Alter** (`0miles.vscode-git-graph-alter`) in Extensions, or install from:

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=0miles.vscode-git-graph-alter)
- [GitHub Releases](https://github.com/0Miles/vscode-git-graph-alter/releases) (`.vsix` manual install)

## Attribution & lineage

Git Graph Alter is an MIT-licensed fork. Its code lineage is, in order:

1. [Git Graph](https://github.com/mhutchie/vscode-git-graph) by Michael Hutchison — the original
   project. Everything up to and including
   [commit 4af8583](https://github.com/mhutchie/vscode-git-graph/commit/4af8583a42082b2c230d2c0187d4eaff4b69c665)
   was MIT-licensed; the project changed its license in May 2019, and nothing after that commit is used here.
2. [(neo) Git Graph](https://github.com/asispts/neo-git-graph) by Asis Pattisahusiwa — a clean MIT
   fork based on that last MIT commit.
3. **Git Graph Alter** — this project, forked from (neo) Git Graph.

This section exists to **give credit to the upstream authors** as the MIT license requires. The names
"Git Graph" and "(neo) Git Graph" refer to those separate projects and their authors; they do not
indicate any affiliation with, sponsorship by, or endorsement from them.

## License

MIT — see [LICENSE](LICENSE).

---

**Disclaimer:** Git Graph Alter is an independent, community-maintained project. It is not affiliated
with, endorsed by, or connected to the "Git Graph" extension by Michael Hutchison, the "(neo) Git
Graph" project, or Microsoft. All product names, trademarks, and registered trademarks are the
property of their respective owners and are used here only for identification and attribution.
