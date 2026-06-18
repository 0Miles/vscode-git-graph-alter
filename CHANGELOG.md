# Changelog

## [0.1.0](https://github.com/0Miles/vscode-git-graph-alter/compare/v0.2.1...v0.1.0) (2026-06-18)


### ⚠ BREAKING CHANGES

* restart versioning at 0.1.0 for the standalone release

### Features

* add a Branches view refresh button, moving visibility toggles to the overflow menu ([63ad820](https://github.com/0Miles/vscode-git-graph-alter/commit/63ad820889ca357ef2c935f7ceb65fc1d13ce7f2))
* add a Remotes side-view listing remotes with add/edit/rename/remove actions ([92dab33](https://github.com/0Miles/vscode-git-graph-alter/commit/92dab33cb8fbe6a773d30542450d534caa5976d1))
* add a tree/list layout toggle to the Commit Details View files panel ([d05b5ae](https://github.com/0Miles/vscode-git-graph-alter/commit/d05b5ae238a19aab396e6800aad57b167e7883e5))
* add branch search to the Branches view ([56ec3d3](https://github.com/0Miles/vscode-git-graph-alter/commit/56ec3d398d98c6406cbb6f1b7c7c2614e19e2a6c))
* add branch search to the Branches view ([c3643dc](https://github.com/0Miles/vscode-git-graph-alter/commit/c3643dc0f5b6ad9b5c898416e62ef52f8cab0ce3))
* add Branches sidebar view replacing the in-graph branch dropdown ([c417cb7](https://github.com/0Miles/vscode-git-graph-alter/commit/c417cb7dc3f6e68f7ee27860fb3bf3d5a1d13a19))
* add button at scm title ([#43](https://github.com/0Miles/vscode-git-graph-alter/issues/43)) ([6477346](https://github.com/0Miles/vscode-git-graph-alter/commit/6477346402abcd3adade1d45642d0225163dc710))
* add initial test suite and CI configuration ([#7](https://github.com/0Miles/vscode-git-graph-alter/issues/7)) ([0b66a23](https://github.com/0Miles/vscode-git-graph-alter/commit/0b66a238fd8d1e474e38be37db82151464512413))
* add internationalization support ([#35](https://github.com/0Miles/vscode-git-graph-alter/issues/35)) ([59374d6](https://github.com/0Miles/vscode-git-graph-alter/commit/59374d613dccf6e299654bbadc302685a660c2cd))
* add View Git Graph to the SCM repository context menu ([4c9acfc](https://github.com/0Miles/vscode-git-graph-alter/commit/4c9acfc39acd54b749e8d5e1f99352c49e1f1955))
* adopt native SCM Graph colours for ref labels, vertices and palette ([a41b351](https://github.com/0Miles/vscode-git-graph-alter/commit/a41b351bfe0c2f3a1bb75c586848206579ac28e0))
* adopt native SCM Graph colours for ref labels, vertices and palette ([51ff34e](https://github.com/0Miles/vscode-git-graph-alter/commit/51ff34e30e78d47899abff9232b65405a4213cc6))
* align webview styling with native VS Code theming ([61f36c5](https://github.com/0Miles/vscode-git-graph-alter/commit/61f36c51618912f8b28872373ccd5e6a13786938))
* align webview styling with native VS Code theming ([cfb6f7c](https://github.com/0Miles/vscode-git-graph-alter/commit/cfb6f7c67b20b6b0cec1acd9b4ae6cef826598e1))
* classify and hide inactive branches in the Branches view ([9fb04ba](https://github.com/0Miles/vscode-git-graph-alter/commit/9fb04ba67769a49b2e81243c5714d12454199ba4))
* classify and hide inactive branches in the Branches view ([8c5b3ea](https://github.com/0Miles/vscode-git-graph-alter/commit/8c5b3eaa11fe6a5df0bd809f270b2323217e27cb))
* Collapse button folds only folders, keeping the group headings open ([e62adb1](https://github.com/0Miles/vscode-git-graph-alter/commit/e62adb18d9bde3bafa50eda1b8dd71156a511428))
* conflict-resolution banner with 3-way merge editor ([265ea6a](https://github.com/0Miles/vscode-git-graph-alter/commit/265ea6ae7e66fb422a91c1b6927d3dfbd12f91df))
* drop the Graph column's header text from the commit table ([6710592](https://github.com/0Miles/vscode-git-graph-alter/commit/67105922c51dfd450db68f0adb08afc271adb074))
* extension host & native Source Control integration ([c62be96](https://github.com/0Miles/vscode-git-graph-alter/commit/c62be962a75949839c7330f48d5b5c2c166dc751))
* focus the graph panel when following the Source Control repo selection ([d26d0b2](https://github.com/0Miles/vscode-git-graph-alter/commit/d26d0b275849cbe488564c72a2b937fdd5817e31))
* Git Graph backend — queries, actions & utilities ([309e3f2](https://github.com/0Miles/vscode-git-graph-alter/commit/309e3f2732c985f3f9e860ccab62a0af011d2c94))
* Git Graph webview UI & styling ([98c65c7](https://github.com/0Miles/vscode-git-graph-alter/commit/98c65c7395222bfdeb99984229becf061d19169e))
* group the Branches view into Remote and Local sections ([67609a2](https://github.com/0Miles/vscode-git-graph-alter/commit/67609a24b43d5e8e57136b5440a2fffebdc25c4e))
* group the Branches view into Remote and Local sections ([1426c8a](https://github.com/0Miles/vscode-git-graph-alter/commit/1426c8a1499640b916aa0baadaaa771a87bce903))
* introduce gitClient based on simple-git ([#13](https://github.com/0Miles/vscode-git-graph-alter/issues/13)) ([d402f18](https://github.com/0Miles/vscode-git-graph-alter/commit/d402f181cfabfd472bf910db5fe331f197d25c4b))
* make the Branches view toggle the sole "show remote branches" control ([27529b5](https://github.com/0Miles/vscode-git-graph-alter/commit/27529b53068487711371fa74084c0d3752847758))
* make the commit date display format a configurable setting ([3e22a11](https://github.com/0Miles/vscode-git-graph-alter/commit/3e22a115e095fdb8c49f40d5616a5d4434b8e01e))
* map CDV and selection layering onto the Quick Pick hierarchy ([b1ddd14](https://github.com/0Miles/vscode-git-graph-alter/commit/b1ddd1412f7e343531cbc7fb5e82082c6ab2c652))
* map CDV and selection layering onto the Quick Pick hierarchy ([e4a5d09](https://github.com/0Miles/vscode-git-graph-alter/commit/e4a5d09748d3a7166e648d1cb3b9166b30a1d691))
* mirror the graph's branch menu onto the Branches view, delegating to it ([24ff192](https://github.com/0Miles/vscode-git-graph-alter/commit/24ff19251d4b3ece48ebea8a7cff85e90a4c6276))
* multi-select branches from the Branches view search ([55ca5f9](https://github.com/0Miles/vscode-git-graph-alter/commit/55ca5f95b5fd94508d5df3b68ff07159d09f1718))
* native dialog layout — left-aligned forms, right-aligned buttons ([25ce054](https://github.com/0Miles/vscode-git-graph-alter/commit/25ce054cef06616e9bdf1e6773d6586c81aa1bb7))
* native dialog layout — left-aligned forms, right-aligned buttons ([24810b6](https://github.com/0Miles/vscode-git-graph-alter/commit/24810b6d81819e75dace8f703012925aa3c63687))
* offer resetting a divergent local branch when checking out a remote ([b560fe3](https://github.com/0Miles/vscode-git-graph-alter/commit/b560fe325003e8423bc5b58174ccacb81e071075))
* offer View Reflog in the Branches view overflow menu ([a882568](https://github.com/0Miles/vscode-git-graph-alter/commit/a88256835b56d079385d1b1c21e011dcafb57cab))
* pre-fill the stash rename input with the current name ([b9f6c58](https://github.com/0Miles/vscode-git-graph-alter/commit/b9f6c580b2d062c4336e19168a6e8b2221bd8a5a))
* predict merge conflicts before merging (git merge-tree) ([0abdd15](https://github.com/0Miles/vscode-git-graph-alter/commit/0abdd15bb7b3741acd17a4b1049272b6b5cfed1c))
* quick-win git actions (auto-fetch, stash rename, patch export, fast-forward, error formatting) ([d227430](https://github.com/0Miles/vscode-git-graph-alter/commit/d227430433323830722dd403c6634475e02800ea))
* reflog browser with commit recovery ([b605feb](https://github.com/0Miles/vscode-git-graph-alter/commit/b605feb8cdd4236d3bc3da24a88bdf17d5e11e42))
* refresh after dismissing an action error to surface the conflict banner ([f3bf589](https://github.com/0Miles/vscode-git-graph-alter/commit/f3bf5896321cef2746e5b81a276e3b3136de446f))
* remember confirmation dialog choices across sessions ([8d57870](https://github.com/0Miles/vscode-git-graph-alter/commit/8d5787024eca3e02de3a39fc9f746717e6038888))
* remember the checkout three-way select choice ([97c173f](https://github.com/0Miles/vscode-git-graph-alter/commit/97c173f1c351f0e98f494ab42bf7bfc92f961ed1))
* remember the checkout three-way select choice ([d35bef5](https://github.com/0Miles/vscode-git-graph-alter/commit/d35bef5b5541b42dbcf2e60a07d50abcb46cd423))
* remove Checkout & Pull, Open Directory Diff, and select-in-branches-dropdown actions ([1a7013b](https://github.com/0Miles/vscode-git-graph-alter/commit/1a7013bcb38e6d69d0a2063dafb4192ec9f030e8))
* reorder the Branches view toolbar and give the remote toggle cloud icons ([618f355](https://github.com/0Miles/vscode-git-graph-alter/commit/618f35528f3533ad9b18a34b7e53bdd6be733684))
* repository statistics panel (authors + activity heatmap) ([1609ef3](https://github.com/0Miles/vscode-git-graph-alter/commit/1609ef3b8f839510f2557c411003c43868780b13))
* show stashes in the graph by default ([834b490](https://github.com/0Miles/vscode-git-graph-alter/commit/834b4906af48f6b35b311e9d21b9a8978643c91d))
* show the repo name and checked-out branch in the graph toolbar ([2e9fafa](https://github.com/0Miles/vscode-git-graph-alter/commit/2e9fafa790766e3481572688db9000b30b682834))
* state-reflecting remote toggle, clearable Show All, fixed control bar ([e5586f4](https://github.com/0Miles/vscode-git-graph-alter/commit/e5586f4b32d60ffa2145a386bf6587ab5d5729c2))
* Traditional & Simplified Chinese localization ([5693835](https://github.com/0Miles/vscode-git-graph-alter/commit/5693835789b6c6bd064a8517e01375f149b185b5))


### Bug Fixes

* align every dialog checkbox to the left of its label ([c8fbd6c](https://github.com/0Miles/vscode-git-graph-alter/commit/c8fbd6c81b93d4bea3289cb6ba4cf6954ec7e432))
* auto-refresh on operation markers so the conflict banner appears ([abdefff](https://github.com/0Miles/vscode-git-graph-alter/commit/abdefff4d339d6acc72813614ad5c3634b24220d))
* cancel the pending refresh debounce when the repo watcher stops ([fab66c3](https://github.com/0Miles/vscode-git-graph-alter/commit/fab66c3a14e639baceccc1b3686d218c184b8ab7))
* clamp context menu into the viewport so the top edge can't clip it ([0ba756a](https://github.com/0Miles/vscode-git-graph-alter/commit/0ba756a22d950ebca7cb7a15c5dd54a190e2e742))
* clarify reset-mode dialog labels in zh-tw/zh-cn ([c993f61](https://github.com/0Miles/vscode-git-graph-alter/commit/c993f610d8b1cebc7da6b192bb671e6de0351e30))
* enable allowUnsafeEditor so git commands run (graph was blank) ([446c73a](https://github.com/0Miles/vscode-git-graph-alter/commit/446c73ad2c9aa183ec6e181659ebb0eb758cc1be))
* escape HTML in git output before rendering  ([#42](https://github.com/0Miles/vscode-git-graph-alter/issues/42)) ([6df298b](https://github.com/0Miles/vscode-git-graph-alter/commit/6df298bf98c6dcf390abc9752f421ad0d57478be))
* extension not activating in devcontainer ([81f4fca](https://github.com/0Miles/vscode-git-graph-alter/commit/81f4fcac6d2dc76565e83c401231274b8a20ed10))
* extension test regression after i18n support ([#37](https://github.com/0Miles/vscode-git-graph-alter/issues/37)) ([1351fcb](https://github.com/0Miles/vscode-git-graph-alter/commit/1351fcb7483697b08ce27310facfc4a53f2161ff))
* follow SCM repo selection when the graph panel is hidden ([5a389d5](https://github.com/0Miles/vscode-git-graph-alter/commit/5a389d55378aed68866bddb97cf190696a442ed1))
* inherit process.env in git client so credential helpers work ([373358e](https://github.com/0Miles/vscode-git-graph-alter/commit/373358eb09a6fc92bf912f3f4ad4652b26fc4b42))
* keep remote branch labels folded after webview restore ([9c22bfa](https://github.com/0Miles/vscode-git-graph-alter/commit/9c22bfa0ab7fe610c93a2c04ecbfd485c518d7c2))
* keep remote branch labels folded after webview restore ([98f0c63](https://github.com/0Miles/vscode-git-graph-alter/commit/98f0c632f9f1480b39d242cf093621c246b4ed80))
* **l10n:** complete missing translations and add CI validation ([#39](https://github.com/0Miles/vscode-git-graph-alter/issues/39)) ([8cf46e5](https://github.com/0Miles/vscode-git-graph-alter/commit/8cf46e588a95f80cefe2ad2b0ba9a84a8a39d053))
* let lastActiveRepo win over saved webview state on reboot ([fcb09e7](https://github.com/0Miles/vscode-git-graph-alter/commit/fcb09e731a2fa736125ed9faa3c536e8d3673050))
* opaque ref-chip tint and a halo ring on the HEAD node ([afadaa4](https://github.com/0Miles/vscode-git-graph-alter/commit/afadaa460b656a7c910c49dd5be3f910c7ec1ebd))
* opaque ref-chip tint and a halo ring on the HEAD node ([79a6fb0](https://github.com/0Miles/vscode-git-graph-alter/commit/79a6fb0dd5617dd31c3fc17d7b12fd483cb84e03))
* paint the commit graph above row backgrounds, like upstream ([9cad2d5](https://github.com/0Miles/vscode-git-graph-alter/commit/9cad2d5b4680341146a457b0a4b4bee5bc24ac0e))
* paint the commit graph above row backgrounds, like upstream ([d4303ca](https://github.com/0Miles/vscode-git-graph-alter/commit/d4303ca54bc7c7e0956b35b04ea554e99136ca26))
* prevent star activation event ([258c184](https://github.com/0Miles/vscode-git-graph-alter/commit/258c184715a8109306f6a7b4a9e2457c7bf10a6d))
* prune stale tracking ref when deleting an already-gone remote branch ([f229f01](https://github.com/0Miles/vscode-git-graph-alter/commit/f229f01d8811681796ed870069cf20042fb23e8a))
* remove information message ([#15](https://github.com/0Miles/vscode-git-graph-alter/issues/15)) ([f5b0582](https://github.com/0Miles/vscode-git-graph-alter/commit/f5b0582d18bd1258fd1d7b231ab3a0b95a48553f)), closes [#14](https://github.com/0Miles/vscode-git-graph-alter/issues/14)
* rename stash so the new name actually shows in the graph ([eab3bf5](https://github.com/0Miles/vscode-git-graph-alter/commit/eab3bf5e005d365ae8e744a35820fb6fd514065d))
* restore translucency and contrast lost in the theme tokenization ([0d14f43](https://github.com/0Miles/vscode-git-graph-alter/commit/0d14f43ead22281b9376cf3b4d9209d739fbd826))
* restore translucency and contrast lost in the theme tokenization ([37c902a](https://github.com/0Miles/vscode-git-graph-alter/commit/37c902a636807f57c28b58dd0fa15b1039f0daea))
* ship the Branches view cloud icons and drop source maps from the vsix ([4828b4a](https://github.com/0Miles/vscode-git-graph-alter/commit/4828b4af8228f20ee86e97d0113c119f35f985eb))
* stop caching wrong Gravatar identicons on GitHub rate limit ([6132f16](https://github.com/0Miles/vscode-git-graph-alter/commit/6132f1618da457c96f36938a7edafca114d01d72))
* stop the graph freezing after commit/refresh when a stash sits above its base ([adce670](https://github.com/0Miles/vscode-git-graph-alter/commit/adce6700db634e584c442688417900656381bd69))
* survive vscode.getState() returning undefined on a fresh boot ([749b779](https://github.com/0Miles/vscode-git-graph-alter/commit/749b77909b680471a80dd74ae57db2b9c6e6a381))
* survive webview state restore with an expanded Commit Details View ([aba1bb7](https://github.com/0Miles/vscode-git-graph-alter/commit/aba1bb7306c02b52520557628aff7f9d7468495c))
* **tests:** add missing dialogMemory to remoteLabelRestore view-state fixture ([315a894](https://github.com/0Miles/vscode-git-graph-alter/commit/315a8940e3e7b4a145ea40a12fa1e1af4233be7c))
* **tests:** add missing dialogMemory to remoteLabelRestore view-state fixture ([9f4f715](https://github.com/0Miles/vscode-git-graph-alter/commit/9f4f715f2d1e0926acc3eeeee274139d432c1460))
* **tests:** restore LANG env var after branch tests ([24d836a](https://github.com/0Miles/vscode-git-graph-alter/commit/24d836a4c9aed0ff01128983591227108ff70214))
* **test:** use longer timeout in workspaceWatcher deduplication test ([dfeb865](https://github.com/0Miles/vscode-git-graph-alter/commit/dfeb865da7894b36a23b1f3aa6b351fdb7f8f1be))


### Miscellaneous Chores

* cut the first release ([2a7aa29](https://github.com/0Miles/vscode-git-graph-alter/commit/2a7aa292cc71ecc90b1935d5fa95d3ea1995d3ce))
* restart versioning at 0.1.0 for the standalone release ([7d942ad](https://github.com/0Miles/vscode-git-graph-alter/commit/7d942adb855587e06b7cfdef4e49a07fbd2630bf))

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
