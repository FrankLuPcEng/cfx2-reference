# Design Spec: 開發者功能擴充

**日期**: 2026-05-06  
**背景**: 以軟體開發者角度，分析現有 CFX 2.0 Reference 網站的認知缺口，並設計最能幫助開發者「理解 CFX 運作方式」與「學會如何開發」的功能擴充。

---

## 一、問題陳述

### 現有網站可以做到
- 查閱 183 個 CFX 訊息的 JSON schema 與欄位定義
- 透過循序圖理解「哪個流程用了哪些訊息、按什麼順序」
- 透過機台視角了解「這種設備通常需要哪些流程」
- 透過情境視角串聯多個流程成一個完整作業場景

### 開發者仍無法從現有網站得到的資訊
1. **CFX 架構盲點**：Broker、Endpoint、MES 如何連接？訊息是怎麼被路由的？
2. **CFXHandle 不理解**：`SMTPlus.Model_21232.SN23123` 每段代表什麼？何時需要它？
3. **AMQP Topic 格式不清楚**：要訂閱哪個 topic 才能收到某個訊息？
4. **沒有程式碼起點**：從 JSON schema 到「能跑起來的訂閱端程式碼」之間有很大的鴻溝
5. **訊息反查困難**：「我在用 `CFX.Production.WorkCompleted`，它出現在哪些 flow？」目前無法從訊息面板得到答案

---

## 二、範疇決策

### 納入本次設計
**功能 A：「開發指南」新分頁（Dev Guide View）**  
**功能 B：訊息面板增強（Message Detail Enrichment）**

### 排除本次設計
- **互動工具（JSON Validator、Code Generator）**：需要 JSON Schema 正規化，工程複雜度過高，留到未來版本
- **Endpoint Simulator**：需要 AMQP mock 後端，不適合純靜態 GitHub Pages

---

## 三、功能 A：開發指南分頁

### 3.1 入口

- 在 `#mode-toggle` 加入第 5 個按鈕：`🛠 開發指南`（`data-mode="guide"`）
- 搜尋欄在此模式下隱藏（內容是靜態的，不需搜尋）
- 側欄顯示章節目錄，點擊後主區域捲動到對應章節（`scrollIntoView`）

### 3.2 側欄章節目錄（取代流程/訊息列表）

```
🛠 開發指南
─────────────
📐 CFX 架構概覽
🔑 CFXHandle 格式
📡 AMQP Topic 路由
🚀 Endpoint 開發入門
📋 常見開發模式
```

點擊即 smooth-scroll 到主區域對應 `<section id="...">`。

### 3.3 主區域各節內容

#### 節 1：CFX 架構概覽
- 靜態 SVG/CSS 架構示意圖，三欄：  
  `[設備 / CFX Endpoint]` → `[AMQP Broker]` ← `[MES / ERP]`
- 箭頭說明：Event（Endpoint → Broker → MES）、Request/Response（MES → Endpoint）
- 文字說明：CFX 是 pub/sub 模型；Endpoint 是設備側軟體代理人；Broker 負責訊息路由
- 強調：**CFX 不是 HTTP REST，不是直連，而是透過 AMQP 解耦**

#### 節 2：CFXHandle 格式
- 說明格式：`{Vendor}.{Model}.{SerialNumber}`
- 範例拆解 `SMTPlus.Model_21232.SN23123` → 各欄位對應說明
- 用途：
  - 作為 AMQP Topic 前綴（每台設備有獨立的 topic namespace）
  - 作為訊息 `CFXHandle` 欄位的值
  - MES 用來識別特定設備
- 規則：字串中不能有斜線；在同一 AMQP 網路中必須唯一

#### 節 3：AMQP Topic 路由
- 訊息路由格式：`CFX/{senderHandle}/{MessageType}`
- 發布範例：`CFX/SMTPlus.Model_21232.SN23123/CFX.Production.WorkCompleted`
- 訂閱範例：
  - 訂閱單台設備的特定訊息：`CFX/SMTPlus.Model_21232.SN23123/CFX.Production.WorkCompleted`
  - 訂閱所有設備的特定訊息：`CFX/*/CFX.Production.WorkCompleted`
  - 訂閱單台設備的所有訊息：`CFX/SMTPlus.Model_21232.SN23123/#`
- Request/Response：使用 reply-to queue，不走 topic；Request 帶 `CorrelationId`
- 圖示：帶 topic 字串的訊息流向圖

#### 節 4：Endpoint 開發入門
分為 5 步驟的 Step-by-step 指南（accordion 或清單）：

| 步驟 | 說明 |
|---|---|
| 1. 選擇 AMQP 函式庫 | RabbitMQ.Client（.NET/C#）、amqplib（Node.js）、pika（Python）|
| 2. 建立 AMQP 連線 | 偽碼：`connection = amqp.connect("amqp://broker-host/")` |
| 3. 發布 EndpointConnected | 上線後立即發布，通知 MES 設備存在；附帶 CFXHandle 與 RequestNetworkUri |
| 4. 訂閱需要的訊息 | 根據設備類型訂閱對應 topic（連結至機台視角） |
| 5. 實作 AreYouThereRequest | MES 心跳查詢，必須回應否則 MES 視為設備離線 |

每步驟附語言無關的偽碼區塊（code block），使用語法高亮（`<pre><code class="language-text">`）。

#### 節 5：常見開發模式
三種 code pattern，各附說明與偽碼：

1. **發布 Event**  
   ```
   payload = { "TransactionId": uuid(), ...}
   topic = f"CFX/{myHandle}/{messageType}"
   channel.basic_publish(topic, json(payload))
   ```

2. **處理 Request / 回應 Response**  
   ```
   # 訂閱 reply-to queue
   on_message(request):
     correlationId = request.correlation_id
     reply_to = request.reply_to
     response = { "Result": {"Result":"Success"}, ... }
     channel.basic_publish(reply_to, json(response), correlationId=correlationId)
   ```

3. **Result 物件錯誤處理**  
   CFX 標準 Result 結構：`{ Result: "Success"|"Failed"|"Blocked", ResultCode: int, Message: string }`  
   建議：永遠檢查 `Result.Result`，不要假設成功

---

## 四、功能 B：訊息面板增強

在現有右側 `#detail-panel` 訊息詳情中，新增兩個小區塊（現有內容不動）：

### 4.1 出現在哪些 Flow（反查）

位置：在 JSON Schema 區塊下方，`fields` 表格上方。  
資料來源：在 client side 從 `FLOWS` 陣列過濾，找出 `steps` 中 `msg === currentMsgName` 的 flow。

UI：  
```
📋 出現在 Flows
[Endpoint 上線]  [生產啟動]        ← 可點擊的 chip
```
點擊 chip → 切換到 flows mode 並選中該 flow（複用現有 `selectFlow()`）。  
若無對應 flow（e.g. 孤立訊息）→ 顯示「此訊息未出現在任何 Flow 中」。

### 4.2 AMQP Topic 字串

位置：訊息名稱（`h2`）與 direction badge 之間。  
內容：  
```
Topic  CFX/{your-handle}/CFX.Production.WorkCompleted  [複製]
```
- `{your-handle}` 是文字佔位符（灰色斜體），不是真實值
- 複製按鈕：複製 `CFX/*/CFX.Production.WorkCompleted`（wildcard 版本，最實用）
- Request/Response 訊息：額外說明「此訊息使用 reply-to queue，不以 topic 路由」

---

## 五、技術架構

### 不需要新的 JSON 資料檔
- Dev Guide 內容為 JS 字串常數（inline HTML string），render 進 `#main`
- 反查 flow 邏輯：`FLOWS.flatMap(g => g.items).filter(f => f.steps.some(s => s.msg === name))`

### 新 mode 加入方式
```javascript
// app.js - setMode() switch case
case 'guide': renderGuide(); break;

// renderGuide() 產生靜態 HTML，insertAdjacentHTML 到 #main
// 側欄列出 GUIDE_SECTIONS 陣列，每個 { id, icon, label }
```

### 資料流
```
init()
  → fetch 4 JSONs (現有)
  → setupListeners() (現有)
     → 加入 'guide' mode btn listener
  
setMode('guide')
  → renderGuide()         // 主區域 HTML
  → renderGuideSidebar()  // 側欄章節目錄

selectMsg(name)  [現有]
  → renderDetail(name)    // 現有邏輯 + 以下新增:
  → appendFlowBacklinks(name)   // 功能 B.1
  → appendAmqpTopic(name)       // 功能 B.2
```

### 現有程式碼改動範圍
| 檔案 | 改動 |
|---|---|
| `index.html` | `#mode-toggle` 加一個 `<button>` |
| `app.js` | 新增 `renderGuide()`, `renderGuideSidebar()`, `appendFlowBacklinks()`, `appendAmqpTopic()`；`setMode()` 加 case |
| `styles.css` | Dev Guide 排版、偽碼 code block、chapter TOC 樣式、flow-chip 樣式、AMQP topic row 樣式 |
| `data/*.json` | **不改動** |

---

## 六、設計決策記錄

| 決策 | 選擇 | 理由 |
|---|---|---|
| Dev Guide 內容儲存方式 | JS 字串常數（不加新 JSON） | 靜態教學內容不需要資料驅動；減少 fetch 數量 |
| 偽碼語言 | 語言無關（Python-ish 偽碼） | CFX SDK 有多語言；避免綁定特定語言造成誤導 |
| AMQP topic 複製版本 | wildcard 版（`CFX/*/...`）| 開發者最常用的訂閱模式，比完整 handle 更實用 |
| 架構圖形式 | CSS/HTML div 排版（非外部圖檔） | 不依賴外部資源；dark mode 自動相容；維護容易 |
| Flow backlink 點擊行為 | 切換至 flows mode + selectFlow() | 複用現有互動邏輯，一致性佳 |

---

## 七、超出範疇（留待未來）

- **JSON Schema Validator**：需要正規化 schema 格式（目前 `schema` 欄位是 example string，不是 JSON Schema spec）
- **Code Snippet Generator**（動態）：需要決定語言 + template engine
- **Endpoint Simulator**：需要 WebSocket/AMQP mock，非靜態站可支援
- **版本切換**（CFX 2.0 vs 未來版本）：資料架構需要重大調整
