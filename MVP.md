# Memzo MVP Plan

## 目標
讓 extension 捕捉的單字（含語境句子）進入 Vocabulary，
用戶從 Vocabulary 匯入到 collection，flashcard 遊戲保持獨立不動。

---

## MVP 範圍（不在 MVP 內：SRS、Netflix、AI 分析、多語境累積）

---

## Phase 1 — 後端地基

### 1-1. DB Schema（`memzo-web/prisma/schema.prisma`）

新增 `CapturedWord` model：

```prisma
model CapturedWord {
  id         String   @id @default(cuid())
  userId     String
  word       String
  definition String
  phonetic   String?
  audioUrl   String?
  source     Json     // { type, url, videoId, title, timestamp, context, highlightWord }
  status     String   @default("saved")  // "saved" | "imported" | "ignored"
  importedTo String?  // collectionId
  capturedAt DateTime @default(now())
}
```

執行：`npx prisma migrate dev --name add-captured-word`

---

### 1-2. 新增 API Routes（`memzo-web/src/app/api/words/`）

**POST `/api/words/capture`**（ext 呼叫）
- Header: `Authorization: Bearer {token}`
- Body: `{ word, definition, phonetic?, audioUrl?, source: SourceContext }`
- 建立 `CapturedWord` record，status = "saved"
- 回傳: `{ id, word, status }`

**GET `/api/words`**（web 呼叫）
- 回傳該 user 所有 CapturedWord（全部 status）
- 按 capturedAt desc 排序
- query param: `?status=saved` 可篩選

**POST `/api/words/import`**（web 呼叫）
- Body: `{ wordIds: string[], collectionId: string }`
- 把選中的 CapturedWord 轉成 Card 加到 collection
- 更新 CapturedWord.status = "imported"，importedTo = collectionId
- 回傳: `{ imported: number }`

**PATCH `/api/words/:id`**（web 呼叫）
- Body: `{ status: "ignored" }`
- 用於忽略單字

---

## Phase 2 — Extension 修改

### 2-1. 新增 Source types（`memzo-ext/src/lib/types.ts`）

```ts
export interface SourceContext {
  type: string
  url?: string
  videoId?: string
  title?: string
  timestamp?: number
  context?: string       // 完整字幕句
  highlightWord?: string // 要 highlight 的字（通常就是查的字）
  [key: string]: unknown
}

export interface SourceAdapter {
  getContext(): SourceContext
}
```

### 2-2. 新增 YoutubeAdapter（`memzo-ext/src/lib/sources/youtube.ts`）

```ts
export class YoutubeAdapter implements SourceAdapter {
  constructor(
    private currentSubtitle: string,
    private targetWord: string
  ) {}

  getContext(): SourceContext {
    const video = document.querySelector('video') as HTMLVideoElement
    const params = new URLSearchParams(location.search)
    return {
      type: 'youtube',
      url: location.href,
      videoId: params.get('v') ?? undefined,
      title: document.title.replace(' - YouTube', ''),
      timestamp: video?.currentTime,
      context: this.currentSubtitle,
      highlightWord: this.targetWord,
    }
  }
}
```

### 2-3. 新增 CAPTURE_WORD message（`memzo-ext/src/lib/messages.ts`）

新增 message type `CAPTURE_WORD`，帶 `{ word, definition, phonetic?, audioUrl?, source }`

### 2-4. 修改 background/api.ts

新增 `captureWord()` 函式：
- POST `/api/words/capture`（endpoint 新加，不是 ext/collections）
- 帶 Authorization header
- 成功後更新 local recent words（邏輯同現在的 saveCard）

### 2-5. 修改 background/index.ts

新增 case `CAPTURE_WORD`：
```ts
case "CAPTURE_WORD": {
  await captureWord(message.word, message.definition, message.source)
  return { success: true }
}
```
**保留舊的 `SAVE_CARD` case 不動**（向後相容，之後再移除）

### 2-6. 修改 content/index.tsx（WordSpan）

在 `handleSave()` 裡：
1. 建立 `new YoutubeAdapter(currentSubtitleText, word)`
2. 拿到 `sourceContext`
3. 改送 `CAPTURE_WORD` message 而非 `SAVE_CARD`

### 2-7. Tooltip.tsx

按鈕文字改為「＋ 加入詞彙庫」，UI 不大動。

---

## Phase 3 — Web UI

### 3-1. 新增 `/vocabulary` 頁面（`memzo-web/src/app/(app)/vocabulary/page.tsx`）

UI 結構：
```
標題：Vocabulary (N)
篩選：全部 | 未加入 | 已加入 | 已忽略
      來源：YouTube | Netflix（先只做全部）

[卡片列表]
每個卡片：
  ☐  word  /phonetic/
     definition
     "context sentence with highlightWord highlighted"
     ▶ 影片標題 · 2:35 · YouTube   ← 可點擊，跳到影片該時間點
  [忽略]

底部：[加入 Collection →]（點擊跳出 collection 選擇器）
```

深連結格式：`https://youtube.com/watch?v={videoId}&t={Math.floor(timestamp)}`

Highlight context：
```tsx
const highlighted = context.replace(
  new RegExp(`(${highlightWord})`, 'gi'),
  '<mark>$1</mark>'
)
```

### 3-2. Sidebar 加入口（`memzo-web/src/components/sidebar.tsx`）

在導覽列加「Vocabulary」連結，顯示未加入數量 badge。

### 3-3. Collection 建立頁加「從 Vocabulary 匯入」選項

`memzo-web/src/app/(app)/collections/new/page.tsx`：
- 建立 collection 後，若 vocabulary 有未加入的字，跳出「是否現在匯入？」

### 3-4. Collection 詳細頁加匯入入口

`memzo-web/src/app/(app)/collections/[id]/page.tsx`：
- 現有 Import section 加一個「從 Vocabulary」tab
- 點擊顯示未加入字詞，選擇後直接匯入

---

## 執行順序

| # | 工作 | 檔案 |
|---|------|------|
| 1 | 加 CapturedWord schema | `memzo-web/prisma/schema.prisma` |
| 2 | POST /api/words/capture | `memzo-web/src/app/api/words/capture/route.ts` |
| 3 | GET /api/words | `memzo-web/src/app/api/words/route.ts` |
| 4 | POST /api/words/import | `memzo-web/src/app/api/words/import/route.ts` |
| 5 | PATCH /api/words/[id] | `memzo-web/src/app/api/words/[id]/route.ts` |
| 6 | ext: SourceContext types | `memzo-ext/src/lib/types.ts` |
| 7 | ext: YoutubeAdapter | `memzo-ext/src/lib/sources/youtube.ts` |
| 8 | ext: captureWord() | `memzo-ext/src/entrypoints/background/api.ts` |
| 9 | ext: CAPTURE_WORD case | `memzo-ext/src/entrypoints/background/index.ts` |
| 10 | ext: WordSpan 改呼叫 | `memzo-ext/src/entrypoints/content/index.tsx` |
| 11 | web: /vocabulary 頁面 | `memzo-web/src/app/(app)/vocabulary/page.tsx` |
| 12 | web: sidebar 加入口 | `memzo-web/src/components/sidebar.tsx` |
| 13 | web: collection 匯入入口 | `memzo-web/src/app/(app)/collections/[id]/page.tsx` |

---

## 不動的部分（MVP 刻意跳過）
- flashcard study game — 完全不動
- Card model — 不加任何 source 欄位
- 現有 /api/ext/collections/[id]/cards — 保留不刪
- Collection CRUD — 不動

---

## 背景設計決策

### 為何 source 用 JSON blob 不用固定欄位
未來加 Netflix 只需在 `NetflixAdapter.getContext()` 填入各自的 key，
DB schema、API、inbox UI 完全不需要改。

### 為何捕捉和匯入分開
用戶主動決定哪些字值得學習，不是所有查過的字都要進 collection。

### 為何 Card 不加 source 欄位
flashcard 遊戲只需要 front/back，保持乾淨獨立。
來源資訊留在 CapturedWord，匯入後兩者無雙向依賴。

---

## 未來擴充（MVP 後）
- `memzo-ext/src/lib/sources/netflix.ts` — NetflixAdapter，其他不動
- 翻卡時顯示 context hint（Card 加 optional sourceWordId FK）
- 同一字多個 context 累積顯示
- Vocabulary badge 即時更新
- 匯出 CSV
