const GUIDE_SECTIONS = [
  { id: 'arch',    icon: '📐', label: 'CFX 架構概覽' },
  { id: 'handle',  icon: '🔑', label: 'CFXHandle 格式' },
  { id: 'topic',   icon: '📡', label: 'AMQP Topic 路由' },
  { id: 'start',   icon: '🚀', label: 'Endpoint 開發入門' },
  { id: 'pattern', icon: '📋', label: '常見開發模式' },
];

export function renderGuideSidebar() {
  const el = document.getElementById('flow-list');
  el.innerHTML = GUIDE_SECTIONS.map(s =>
    `<div class="guide-toc-item" data-sec="${s.id}" tabindex="0" role="button">
       <span class="guide-toc-icon" aria-hidden="true">${s.icon}</span>${s.label}
     </div>`
  ).join('');
  el.querySelectorAll('.guide-toc-item').forEach(item => {
    const scroll = () => {
      const target = document.getElementById('guide-' + item.dataset.sec);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    item.addEventListener('click', scroll);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scroll(); } });
  });
}

export function renderGuide() {
  document.getElementById('seqc').innerHTML = `<div class="guide-content">${guideHTML()}</div>`;
}

function guideHTML() {
  return `
<!-- ① Architecture -->
<div class="guide-section" id="guide-arch">
  <h3>📐 CFX 架構概覽</h3>
  <p>CFX（Connected Factory Exchange，IPC-CFX-2591）是基於 <strong>AMQP 訊息協議</strong>的工廠設備通訊標準。它採用 <strong>Pub/Sub</strong> 模型，讓設備（Endpoint）與製造執行系統（MES）透過中間的 Broker 解耦通訊。</p>
  <div class="arch-diagram">
    <div class="arch-box highlight">
      <div class="arch-box-title">CFX Endpoint</div>
      <div class="arch-box-sub">設備側代理人<br>（SMT 機台、測試機…）</div>
    </div>
    <div class="arch-arrow">
      <div class="arch-arrow-line">⇄</div>
      <div class="arch-arrow-label">Event / Request<br>Response</div>
    </div>
    <div class="arch-box highlight">
      <div class="arch-box-title">AMQP Broker</div>
      <div class="arch-box-sub">訊息路由中心<br>（RabbitMQ、Azure…）</div>
    </div>
    <div class="arch-arrow">
      <div class="arch-arrow-line">⇄</div>
      <div class="arch-arrow-label">訂閱 / 發布<br>Request / Response</div>
    </div>
    <div class="arch-box">
      <div class="arch-box-title">MES / ERP</div>
      <div class="arch-box-sub">製造執行系統<br>（訂閱事件、下發指令）</div>
    </div>
  </div>
  <h4>三種角色說明</h4>
  <ul>
    <li><strong>CFX Endpoint</strong>：設備側的軟體代理人，負責發布狀態事件（Event）並回應 MES 的查詢（Request/Response）</li>
    <li><strong>AMQP Broker</strong>：訊息路由中心，所有訊息都經過它傳遞；Endpoint 與 MES 不直連</li>
    <li><strong>MES / ERP</strong>：訂閱設備事件，並對設備發送 Request（如下發配方、查詢狀態）</li>
  </ul>
  <h4>重要觀念</h4>
  <ul>
    <li>CFX <strong>不是 REST API</strong>，不是 HTTP 直連，而是非同步 Pub/Sub</li>
    <li>每個訊息都有明確的 <strong>方向</strong>（Event / Request / Response），詳見訊息瀏覽器</li>
    <li>Endpoint 上線後必須先發布 <code>CFX.EndpointConnected</code>，MES 才能感知它的存在</li>
  </ul>
</div>
<hr class="guide-divider">

<!-- ② CFXHandle -->
<div class="guide-section" id="guide-handle">
  <h3>🔑 CFXHandle 格式</h3>
  <p>CFXHandle 是每個 Endpoint 在 CFX 網路中的唯一識別字串，格式如下：</p>
  <div class="handle-breakdown">
    <div class="handle-part">
      <div class="handle-part-val">SMTPlus</div>
      <div class="handle-part-label">Vendor（廠牌）</div>
    </div>
    <div class="handle-part">
      <div class="handle-part-val">Model_21232</div>
      <div class="handle-part-label">Model（機型）</div>
    </div>
    <div class="handle-part">
      <div class="handle-part-val">SN23123</div>
      <div class="handle-part-label">SerialNumber（序號）</div>
    </div>
  </div>
  <pre class="guide-code">CFXHandle = "{Vendor}.{Model}.{SerialNumber}"
// 範例：
CFXHandle = "SMTPlus.Model_21232.SN23123"</pre>
  <h4>使用場景</h4>
  <ul>
    <li><strong>AMQP Topic 前綴</strong>：每台設備有自己的 topic 命名空間（見下一節）</li>
    <li><strong>訊息欄位</strong>：所有 CFX 訊息的 <code>CFXHandle</code> 欄位填入此值</li>
    <li><strong>AreYouThereRequest</strong>：MES 用 CFXHandle 查詢特定設備是否在線</li>
  </ul>
  <h4>命名規則</h4>
  <ul>
    <li>各段以 <strong>點（.）</strong>分隔，段內不能有點</li>
    <li>同一 AMQP 網路中必須<strong>唯一</strong>（通常用序號保證）</li>
    <li>字串不能包含 <code>/</code>（會與 AMQP topic 路由衝突）</li>
  </ul>
</div>
<hr class="guide-divider">

<!-- ③ AMQP Topic -->
<div class="guide-section" id="guide-topic">
  <h3>📡 AMQP Topic 路由</h3>
  <p>CFX 訊息在 AMQP 中以 topic 路由。每個 Event 的 topic 格式為：</p>
  <pre class="guide-code">CFX/{senderCFXHandle}/{MessageType}

// 具體範例（設備發布事件）：
CFX/SMTPlus.Model_21232.SN23123/CFX.Production.WorkCompleted</pre>
  <h4>訂閱模式</h4>
  <pre class="guide-code"># 訂閱單台設備的特定訊息：
CFX/SMTPlus.Model_21232.SN23123/CFX.Production.WorkCompleted

# 訂閱所有設備的特定訊息（最常用）：
CFX/*/CFX.Production.WorkCompleted

# 訂閱單台設備的所有訊息：
CFX/SMTPlus.Model_21232.SN23123/#

# 訂閱所有設備的所有訊息：
CFX/#</pre>
  <p class="guide-code-note">⚠ 不同 AMQP 實作的 wildcard 字元可能不同（RabbitMQ 用 <code>*</code> 和 <code>#</code>，Azure Service Bus 用 SQL filter）。請依使用的 Broker 確認。</p>
  <h4>Request / Response 的特殊路由</h4>
  <ul>
    <li>Request 訊息（如 <code>CFX.AreYouThereRequest</code>）<strong>不走 topic 路由</strong></li>
    <li>MES 發送 Request 時，在訊息中帶上 <code>reply-to</code>（回覆佇列）與 <code>CorrelationId</code></li>
    <li>Endpoint 收到 Request 後，將 Response 發布到 <code>reply-to</code> 指定的佇列，並附上相同的 <code>CorrelationId</code></li>
  </ul>
  <p>在訊息面板中查看任何訊息時，都可以直接看到它的 AMQP topic 字串（Event 類型才有）。</p>
</div>
<hr class="guide-divider">

<!-- ④ Getting Started -->
<div class="guide-section" id="guide-start">
  <h3>🚀 Endpoint 開發入門</h3>
  <p>以下是從零建立一個最小可運作 CFX Endpoint 的 5 個步驟：</p>
  <div class="guide-steps">
    <div class="guide-step">
      <div class="guide-step-num">1</div>
      <div class="guide-step-body">
        <div class="guide-step-title">選擇 AMQP 函式庫</div>
        <div class="guide-step-desc">
          CFX 官方 SDK 是 .NET（C#）。其他語言可使用：<br>
          Node.js → <code>amqplib</code>、Python → <code>pika</code>、Java → <code>RabbitMQ Java Client</code>
        </div>
      </div>
    </div>
    <div class="guide-step">
      <div class="guide-step-num">2</div>
      <div class="guide-step-body">
        <div class="guide-step-title">建立 AMQP 連線與 Channel</div>
        <pre class="guide-code">connection = amqp.connect("amqp://broker-host:5672/")
channel = connection.createChannel()</pre>
      </div>
    </div>
    <div class="guide-step">
      <div class="guide-step-num">3</div>
      <div class="guide-step-body">
        <div class="guide-step-title">上線後立即發布 EndpointConnected</div>
        <pre class="guide-code">topic = "CFX/" + myHandle + "/CFX.EndpointConnected"
payload = {
  "CFXHandle": myHandle,
  "RequestNetworkUri": "amqp://broker-host/",
  "RequestTargetAddress": "/queue/" + myHandle
}
channel.publish(topic, json(payload))</pre>
      </div>
    </div>
    <div class="guide-step">
      <div class="guide-step-num">4</div>
      <div class="guide-step-body">
        <div class="guide-step-title">訂閱需要的訊息（依機台類型）</div>
        <div class="guide-step-desc">參考「機台視角」找出你的設備需要哪些 Flow，再訂閱對應訊息的 topic。</div>
        <pre class="guide-code">channel.subscribe("CFX/" + myHandle + "/CFX.Production.GetScheduledWorkOrdersRequest")
// → 收到後處理並回應 Response</pre>
      </div>
    </div>
    <div class="guide-step">
      <div class="guide-step-num">5</div>
      <div class="guide-step-body">
        <div class="guide-step-title">實作 AreYouThereRequest（必要）</div>
        <div class="guide-step-desc">MES 會定期傳送心跳查詢。若未回應，MES 可能將設備標記為離線。</div>
        <pre class="guide-code">on_request("CFX.AreYouThereRequest"):
  respond({
    "Result": { "Result": "Success", "ResultCode": 0 },
    "CFXHandle": myHandle,
    "RequestNetworkUri": "amqp://broker-host/",
    "RequestTargetAddress": "/queue/" + myHandle
  })</pre>
      </div>
    </div>
  </div>
</div>
<hr class="guide-divider">

<!-- ⑤ Patterns -->
<div class="guide-section" id="guide-pattern">
  <h3>📋 常見開發模式</h3>

  <div class="guide-pattern">
    <div class="guide-pattern-title">模式 1：發布 Event</div>
    <pre class="guide-code">// 任何狀態改變都應以 Event 通知 MES
topic = "CFX/" + myHandle + "/" + messageType
payload = {
  "TransactionId": uuid(),      // 每次發布產生新的 UUID
  "Timestamp":     isoNow(),    // ISO 8601 時間戳
  // ... 訊息特有欄位
}
channel.publish(topic, json(payload))</pre>
    <p class="guide-code-note">TransactionId 讓 MES 可以追蹤每一筆交易，建議每次發布都產生新值。</p>
  </div>

  <div class="guide-pattern">
    <div class="guide-pattern-title">模式 2：處理 Request / 回應 Response</div>
    <pre class="guide-code">// 收到 Request
on_message(request):
  correlationId = request.headers.correlationId
  replyTo       = request.headers.replyTo

  // 處理業務邏輯...
  result = doWork(request.body)

  // 回應到 reply-to queue，帶相同 correlationId
  response = {
    "Result": { "Result": "Success", "ResultCode": 0, "Message": null },
    // ... Response 特有欄位
  }
  channel.publishTo(replyTo, json(response), correlationId)</pre>
  </div>

  <div class="guide-pattern">
    <div class="guide-pattern-title">模式 3：Result 物件與錯誤處理</div>
    <pre class="guide-code">// CFX 標準 Result 結構（所有 Response 都包含）
{
  "Result": {
    "Result":     "Success" | "Failed" | "Blocked",
    "ResultCode": 0,           // 0 = 成功；非 0 = 廠商定義的錯誤碼
    "Message":    null         // 錯誤時填寫說明文字
  }
}

// 接收端處理建議：
if response.Result.Result != "Success":
  log.error("CFX Error: " + response.Result.Message)
  // 不要假設成功；永遠先檢查 Result</pre>
    <p class="guide-code-note">Result.Result 是字串，不是布林值。三種值：Success / Failed / Blocked（設備忙碌）。</p>
  </div>
</div>`;
}
