# 傑弗德餐飲顧問官網 — Codex 工作說明

這份文件寫給協助修改本網站的 AI（Codex 等）。每次開始修改前請先完整讀完。

正式網址：https://jfoodcatering.com.tw
推到 `main` 分支後，Vercel 會在約 1 分鐘內自動更新正式網站，所以**任何修改都不可以直接推到 `main`**。

---

## 一、修改流程（每次都要照做）

1. 從 `main` 開一個新分支，名稱描述這次要做的事，例如 `update-case-chunai`。
2. 只修改這次需求相關的檔案，不順手重構、不改排版以外的東西。
3. 開 Pull Request，說明裡用中文列出：
   - 改了什麼（哪幾頁、哪一段）
   - 為什麼改
   - 請網站負責人檢查哪些地方
4. Vercel 會在 Pull Request 上自動產生預覽網址。請負責人用**手機**和電腦都打開預覽網址確認，沒問題再按 Merge。
5. Merge 後約 1 分鐘，打開正式網址確認一次。

如果需求不清楚（要改哪一段、改成什麼字、用哪張照片），先問，不要猜。

**`main` 已由 GitHub Ruleset「保護 main」強制保護**：必須透過 Pull Request 合併，禁止強制推送（force push）與刪除分支。遇到推送或合併被擋，一律改走 Pull Request，**不要建議關閉或修改這個規則**；若規則真的造成卡關，請網站負責人聯絡原開發者。

---

## 二、網站結構

純靜態網站（HTML + CSS + 少量 JavaScript），沒有框架、沒有 build 步驟。

| 位置 | 內容 |
|---|---|
| `index.html` | 首頁 |
| `services.html` | 服務方式 |
| `cases.html` | 顧問案例列表 |
| `case/*.html` | 各顧問案例內頁（13 篇） |
| `brands.html` | 自有品牌 |
| `contact.html` | 聯絡表單 |
| `assets/muse.css` | 全站共用樣式（顏色、字體、按鈕、導覽列、頁尾） |
| `assets/home-hero.css` | 只給首頁第一區塊（左文右圖）使用 |
| `assets/site.js` | 手機選單、捲動淡入效果 |
| `assets/img/` | 網站圖片（`home/` 首頁、`cases/<案例>/` 案例、`jeff/`、`logo/`） |
| `jeff/` | 自有品牌頁使用的圖片 |
| `api/inquiry.js` | 聯絡表單寄信功能（伺服器端） |
| `vercel.json` | 舊網址轉址設定 |

---

## 三、可以改、小心改、不要動

**可以改**
- 各頁文字內容、案例內容、圖片替換。
- 新增案例頁：複製一篇現有的 `case/*.html` 改內容，再到 `cases.html` 加入卡片連結。

**小心改（改之前先在 Pull Request 說明影響範圍）**
- `assets/muse.css`：全站共用，改一個值會影響所有頁面。
- 導覽列與頁尾：每一頁都各有一份，要改就所有頁面一起改，保持一致。
- `assets/home-hero.css`：首頁第一區塊的版面與比例，已調整過各種螢幕寬度。

**不要動**
- `api/inquiry.js`：聯絡表單寄信功能。
- `vercel.json` 裡既有的轉址。
- `.vercelignore`：讓本檔（AGENTS.md）留在 GitHub 但不發佈到網站。
- `#nav::before` 的寫法：導覽列背景刻意放在 `::before`，避免 iPhone Safari 的工具列被染色，不要改回直接設在 `#nav` 上。

---

## 四、內容與圖片規則

**文字**
- 每頁 `<head>` 的 `<title>` 與 `<meta name="description">` 改內容時一起更新，這會影響 Google 搜尋結果。
- 圖片都要有中文 `alt` 說明。

**圖片**
- 格式用 JPG（照片）或 PNG（需要透明背景的 logo）。
- 照片長邊不超過 1600px，單張檔案盡量在 400KB 以下；太大的照片要先壓縮再放進來。
- 檔名用英文小寫與數字，不要用中文或空白。案例照片放在 `assets/img/cases/<案例英文名>/`，照現有的 `hero.jpg`、`01.jpg`、`02.jpg`… 命名。
- 只使用業主有權使用的照片。

**設計**
- 顏色、間距一律使用 `muse.css` 開頭 `:root` 裡已定義的變數（例如 `var(--accent)`），不要自己新增顏色。
- 不引入新的框架、套件或外部 CSS／JS。
- 不加入追蹤碼、廣告或第三方嵌入，除非業主明確要求。

---

## 五、安全

- **任何密碼、API Key、Token 都不可以寫進程式碼或提交到 GitHub。** 聯絡表單需要的金鑰放在 Vercel 的環境變數（`EMAIL_API_KEY`、`INQUIRY_FROM`、`INQUIRY_TO`），只在 Vercel 後台設定。
- 這個 repo 裡的所有檔案都會被公開放上網站，不要放入內部文件、合約、客戶資料或原始素材。

---

## 六、交付前檢查清單

在 Pull Request 說明裡逐項勾選：

- [ ] 只改了這次需求相關的檔案
- [ ] 預覽網址用手機（iPhone Safari）看過：沒有左右滑動、文字沒被切掉、按鈕按得到
- [ ] 預覽網址用電腦看過
- [ ] 新增或修改的連結都點得開
- [ ] 新圖片尺寸與檔案大小符合規則，有 `alt`
- [ ] 沒有寫入任何密碼或金鑰
