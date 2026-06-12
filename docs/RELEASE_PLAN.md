# Git Graph Alter 發佈計劃

> 目標：將 `vscode-git-graph-alter` 發佈到 VS Code Marketplace，並同步提供 GitHub Releases（`.vsix`）。
> 不發佈 Open VSX。

## 現狀（2026-06-12）

- 套件：`vscode-git-graph-alter`，publisher `0miles`，版本 `0.4.0`，MIT 授權。
- Repo：`0Miles/vscode-git-graph-alter`（public）。
- v0.1.0–v0.4.0 的 tag 只存在於 git，從未上架任何市集；v0.4.0 之後已累積大量功能（Branches/Remotes 側欄、工具列改版、i18n 等），尚未寫入 CHANGELOG。
- 打包：esbuild bundle（僅 `vscode` external），相依套件全數打包；`.vscodeignore` 採 whitelist。
- CI：`.github/workflows` 目前不存在，需要重建。
- 注意：git 歷史帶有舊上游 Git Graph 的 `v1.x` 標籤，**不可**推送到新 repo（會污染 Releases 與版本徽章）。

## 階段 1 — 發佈帳號（一次性，需人工操作）

1. 用 Microsoft 帳號登入 [Azure DevOps](https://dev.azure.com)，建立組織（若尚無）。
2. 在 Azure DevOps 建立 Personal Access Token：
   - Organization: **All accessible organizations**
   - Scopes: **Marketplace → Manage**
   - 設定到期日並記錄（PAT 過期是 CI 發佈失敗最常見原因）。
3. 到 [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage) 建立 publisher：
   - ID: `0miles`（必須與 package.json 的 `publisher` 完全一致；建立後不可改名）
   - 顯示名稱可自訂（例如 `Miles`）。
4. 本機驗證：`npx @vscode/vsce login 0miles`（貼上 PAT）。
5. 將 PAT 存入 GitHub repo secret `VSCE_PAT`（供 release workflow 使用）。

## 階段 2 — 發佈前整備

- [ ] 補齊 CHANGELOG `[Unreleased]`：彙整 v0.4.0 之後所有 feat/fix（含改名的 breaking change 說明）。
- [ ] 版本定為 **`0.5.0`**：改名 + 大量新功能，且為首次上架。（若想以正式版姿態上架可改 `1.0.0`，擇一即可。）
- [ ] README 行銷檢查：demo.gif 是否反映目前 UI；Marketplace 頁面會以 `repository` URL 解析相對圖片，repo 必須先公開。
- [ ] `package.nls*.json` / l10n 檢查：`pnpm run l10n:check`。
- [ ] 確認 `resources/icon.png` 至少 128×128（Marketplace 建議 256×256，必要時重出圖）。
- [ ] 移除或 gitignore 雜項檔案（如根目錄 `ngg-harness-baseline.png`，若非必要資產）。

## 階段 3 — 打包與本機驗證

```bash
pnpm install
pnpm run test          # vitest backend + webview
pnpm run test:ext      # VS Code extension host 測試
npx @vscode/vsce package --no-dependencies   # 觸發 vscode:prepublish（typecheck + lint + esbuild production）
```

- `--no-dependencies` 為必要：相依已由 esbuild 打包，且 pnpm 的 node_modules 結構 vsce 無法掃描。
- 驗證 `.vsix` 內容：`npx @vscode/vsce ls --no-dependencies`，確認沒有多餘檔案、`out/`、`l10n/`、`media/`、icon 都在。
- 本機安裝驗證：`code --install-extension vscode-git-graph-alter-0.5.0.vsix`，煙霧測試：
  - 開啟 Git Graph 面板、Branches/Remotes 側欄
  - 切換 zh-TW 顯示語言確認 i18n
  - devcontainer / remote 場景（此 fork 的賣點之一）

## 階段 4 — CI/CD（GitHub Actions）

重建 `.github/workflows/`：

1. **`ci.yml`** — push / PR 觸發：`pnpm install` → `typecheck` → `lint` → `format` → `test`（macOS 或 ubuntu + xvfb 跑 `test:ext`）。
2. **`release.yml`** — 推送 `v*` tag 觸發：
   - 跑完整 gates → `vsce package --no-dependencies`
   - `vsce publish --no-dependencies -p $VSCE_PAT`
   - 以 tag 建立 GitHub Release，附上 `.vsix` 與 CHANGELOG 對應段落。

## 階段 5 — 首次發佈執行

1. CHANGELOG：`[Unreleased]` → `[0.5.0] - <日期>`，更新比較連結。
2. `package.json` version → `0.5.0`，commit：`release: 0.5.0`。
3. `git tag v0.5.0 && git push origin main v0.5.0` → release workflow 自動上架 + 建 Release。
4. 上架後 5–10 分鐘檢查 Marketplace 頁面：icon、README 圖片、徽章、安裝測試。
5. 首次發佈 Marketplace 會做病毒掃描與驗證，可能延遲數分鐘到數小時，屬正常現象。

## 發佈後

- 版本策略：沿用 semver；`minor` = 新功能、`patch` = 修補。若要用 Marketplace pre-release channel，需改用 `vsce publish --pre-release`（版本規則：偶數 minor 為穩定版、奇數為預覽版的慣例可自行決定是否採用）。
- 舊 repo `0Miles/neo-git-graph`：建議 archive 並在 README 註明已遷移至新 repo。
- Publisher PAT 到期前更新 `VSCE_PAT` secret。
