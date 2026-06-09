# Changelog

## [Unreleased]

### Changed

- Renamed the project to **Git Graph Alter** (`vscode-git-graph-alter`), forked from (neo) Git Graph. Command, configuration, and URI-scheme namespaces moved from `neo-git-graph` to `git-graph-alter`. Existing `neo-git-graph.*` settings and keybindings must be re-created under the new prefix.

## [0.4.0] - 2026-04-10

### Added

- Full internationalization (i18n) support with multiple languages
- Language support: English (default), Simplified Chinese (简体中文), Traditional Chinese (繁體中文)

### Fixed

- Escape HTML in git output before rendering

## [0.3.0] - 2026-03-26

### Added

- Introduce gitClient based on simple-git
- Added a button to locate HEAD in the graph

### Changed

- Extract webview bridge
- Extract webview lifecycle

## [0.2.0] - 2026-03-17

### Added

- Add initial test suite and CI configuration

### Fixed

- Remove information message

## [0.1.1] - 2026-02-23

### Changed

- Migrate build system to esbuild and upgrade dependencies
- Add oxlint linter and oxfmt formatter

## [0.1.0] - 2026-02-18

Initial release

[Unreleased]: https://github.com/your-org/vscode-git-graph-alter/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/your-org/vscode-git-graph-alter/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/your-org/vscode-git-graph-alter/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/your-org/vscode-git-graph-alter/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/your-org/vscode-git-graph-alter/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/your-org/vscode-git-graph-alter/releases/tag/v0.1.0
