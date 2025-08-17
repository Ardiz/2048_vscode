
# Copilot Instructions for 2048 Game Project

## 專案架構概覽
- 本專案為純前端 2048 遊戲，無後端，所有邏輯皆在瀏覽器端執行。
- 主要檔案：
	- `index.html`：頁面結構與 UI 元素定義。
	- `style.css`：遊戲與 UI 樣式，含響應式設計與 tile 顏色規則。
	- `script.js`：全部遊戲邏輯、狀態管理、事件處理與 DOM 操作。

## 主要元件與資料流
- 遊戲主循環與狀態儲存在 `script.js`，以 `grid` 陣列管理 4x4 棋盤。
- 分數與最佳分數以 localStorage 儲存，並即時更新於 UI。
- 所有 tile 動畫、合併、移動、勝負判斷皆於 `script.js` 內處理。
- 事件來源：
	- 鍵盤（方向鍵）
	- 觸控（手機滑動）
	- 按鈕（New Game, Try again）

## 關鍵開發與除錯流程
- **本專案無 build、test、lint 流程**，直接開啟 `index.html` 即可於瀏覽器運行。
- 除錯建議：
	- 於 Chrome/Edge F12 工具檢查 DOM 結構與 JS console log。
	- 變更 `script.js` 後直接重新整理頁面即可看到效果。
- 若需重設最佳分數，可於瀏覽器 console 執行：
	`localStorage.removeItem('bestScore')`

## 專案慣例與注意事項
- 所有遊戲狀態皆以 JS 變數管理，UI 由 JS 動態生成與更新。
- tile 顏色、字型大小等視覺規則請參考 `style.css` 內 `.tile-*` 類別。
- 勝利（2048）與失敗（無法移動）皆以 `.game-message` 顯示提示。
- 支援桌機與手機（含觸控滑動事件）。
- 無外部 JS 函式庫依賴。

## 典型擴充/修改範例
- 若要更改棋盤大小，需同步調整 `GRID_SIZE`、CSS grid 設定與 tile 生成邏輯。
- 若要新增特殊 tile 或動畫，請於 `script.js` 及 `style.css` 增加對應規則。

## 關鍵檔案參考
- `script.js`：所有遊戲邏輯、狀態流、事件處理
- `style.css`：tile 樣式、分數區塊、響應式設計
- `index.html`：UI 結構、分數顯示、按鈕

---
如需進一步自動化、測試或 build 流程，請先與專案負責人討論。

