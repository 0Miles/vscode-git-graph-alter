# Changelog

## [0.2.1](https://github.com/0Miles/vscode-git-graph-alter/compare/v0.2.0...v0.2.1) (2026-06-18)


### Bug Fixes

* prune stale tracking ref when deleting an already-gone remote branch ([f229f01](https://github.com/0Miles/vscode-git-graph-alter/commit/f229f01d8811681796ed870069cf20042fb23e8a))

## [0.2.0](https://github.com/0Miles/vscode-git-graph-alter/compare/v0.1.0...v0.2.0) (2026-06-15)


### Features

* make the commit date display format a configurable setting ([3e22a11](https://github.com/0Miles/vscode-git-graph-alter/commit/3e22a115e095fdb8c49f40d5616a5d4434b8e01e))


### Bug Fixes

* clarify reset-mode dialog labels in zh-tw/zh-cn ([c993f61](https://github.com/0Miles/vscode-git-graph-alter/commit/c993f610d8b1cebc7da6b192bb671e6de0351e30))
* stop caching wrong Gravatar identicons on GitHub rate limit ([6132f16](https://github.com/0Miles/vscode-git-graph-alter/commit/6132f1618da457c96f36938a7edafca114d01d72))

## 0.1.0 (2026-06-12)


### Bug Fixes

* align every dialog checkbox to the left of its label ([1610d5a](https://github.com/0Miles/vscode-git-graph-alter/commit/1610d5af67e286649459bede67170d29a97a05d5))
* cancel the pending refresh debounce when the repo watcher stops ([35123a4](https://github.com/0Miles/vscode-git-graph-alter/commit/35123a448482b03d8c868069fa840dc8f55292f8))
* ship the Branches view cloud icons and drop source maps from the vsix ([6377bcd](https://github.com/0Miles/vscode-git-graph-alter/commit/6377bcdda199b21396db583ede1b6e6d53a3e5ab))


### Miscellaneous Chores

* cut the first release ([06498f1](https://github.com/0Miles/vscode-git-graph-alter/commit/06498f1bb5ba13331a0b5f88155c416d063769b2))

## [Unreleased]

Initial release of **Git Graph Alter**.

### Added

- Git graph webview: visualise branches, tags, and uncommitted changes, with commit details, diffs, and file history
- Branch, tag, commit, stash, and remote actions from the graph and context menus
- Branches side view with search, multi-select, remote/local grouping, and inline branch actions
- Remotes side view with add/edit/rename/remove actions
- Internationalization: English, Simplified Chinese (简体中文), Traditional Chinese (繁體中文)
- Devcontainer and remote environment support
- Avatar support via GitHub, GitLab, or Gravatar

[Unreleased]: https://github.com/0Miles/vscode-git-graph-alter/commits/main
