# CLAUDE.md（繁體中文版）

本檔案為 Claude Code（claude.ai/code）在此專案中工作時提供指引。

## 指令

```bash
npm install      # 安裝相依套件
npm run dev      # 啟動開發伺服器於 http://localhost:3000（自動開啟瀏覽器）
npm run build    # 正式環境建置 → build/ 目錄
```

未設定測試執行器。

## 架構

這是一個以 React + TypeScript + Vite 建構的尋寶箱遊戲。所有遊戲邏輯都位於 `src/App.tsx`。

**遊戲狀態**（位於 `App.tsx`）：
- `boxes`：包含 3 個 `Box` 物件的陣列（`{ id, isOpen, hasTreasure }`）— 其中一個隨機藏有寶藏
- `score`：玩家分數；找到寶藏 +$100，遇到骷髏 -$50
- `gameEnded`：找到寶藏或所有箱子皆被開啟時遊戲結束

**核心函式**：`initializeGame()`、`openBox(boxId)`、`resetGame()`

**身份驗證與使用者流程**：
- `src/hooks/useAuth.ts` — 管理已登入／訪客狀態；將 `token` 和 `username` 持久化儲存於 `localStorage`
- `src/components/AuthModal.tsx` — 首次載入時的阻擋式彈窗（使用 `react-hook-form`）；包含登入／註冊分頁及「以訪客身份繼續」選項
- `src/components/UserHeader.tsx` — 登入後顯示；呈現使用者名稱及登出按鈕
- 訪客模式跳過身份驗證；僅已登入使用者的分數會被儲存

**後端 API**（`src/lib/api.ts`）：
- 所有呼叫透過通用的 `request<T>()` 輔助函式，並附加 `Authorization: Bearer <token>`
- 端點：`POST /api/auth/signup`、`POST /api/auth/signin`、`POST /api/scores`
- 後端伺服器**不包含**在此專案中 — `npm run dev` 僅啟動 Vite 前端

**靜態資源**：
- `src/assets/` — 寶箱圖片（關閉、開啟含寶藏、開啟含骷髏、鑰匙）
- `src/audios/` — `chest_open.mp3`（寶藏音效）和 `chest_open_with_evil_laugh.mp3`（骷髏音效）

**UI 層**：
- Framer Motion 負責箱子開啟時的 3D 翻轉動畫
- `src/components/ui/` 包含 45+ 個 Radix UI 封裝元件（以 Tailwind 預先樣式化）— 請使用這些元件而非安裝新的 UI 函式庫
- `src/styles/globals.css` 定義含 CSS 變數的 Tailwind CSS 自訂主題（支援亮色／暗色模式）
- `@` 路徑別名對應至 `src/`

**Vite 設定**：埠號 3000、SWC 轉譯器、所有 Radix UI 套件的路徑別名、輸出至 `build/`。
