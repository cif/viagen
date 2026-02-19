export function buildUiHtml(opts?: { editable?: boolean }): string {
  const hasEditor = opts?.editable ?? false;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>viagen</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #09090b;
      color: #e4e4e7;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding: 10px 16px;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .header h1 {
      font-size: 13px;
      font-weight: 600;
      font-family: ui-monospace, monospace;
      color: #a1a1aa;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #3f3f46;
    }
    .status-dot.ok { background: #22c55e; }
    .status-dot.error { background: #ef4444; }
    .setup-banner {
      padding: 12px 16px;
      border-bottom: 1px solid #27272a;
      background: #18181b;
      font-size: 12px;
      color: #a1a1aa;
      line-height: 1.6;
      flex-shrink: 0;
      display: none;
    }
    .setup-banner code {
      font-family: ui-monospace, monospace;
      color: #d4d4d8;
      font-size: 11px;
    }
    .btn {
      padding: 5px 10px;
      border: 1px solid #3f3f46;
      background: #18181b;
      color: #a1a1aa;
      border-radius: 5px;
      font-size: 11px;
      cursor: pointer;
      font-family: inherit;
      transition: border-color 0.15s, color 0.15s;
    }
    .btn:hover { border-color: #52525b; color: #e4e4e7; }
    .btn.active { border-color: #22c55e; color: #22c55e; }
    .activity-bar {
      padding: 6px 16px;
      border-bottom: 1px solid #27272a;
      background: #18181b;
      font-family: ui-monospace, monospace;
      font-size: 11px;
      color: #71717a;
      flex-shrink: 0;
      display: none;
      animation: pulse 2s ease-in-out infinite;
    }
    .activity-bar.done {
      animation: none;
      color: #a1a1aa;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .msg-summary {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      color: #a1a1aa;
      padding: 4px 0;
    }
    .session-timer {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      color: #52525b;
      margin-left: 8px;
    }
    .session-timer.warning { color: #f59e0b; }
    .session-timer.critical { color: #ef4444; }
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .messages:empty::after {
      content: 'Ask Claude to build something...';
      color: #3f3f46;
      font-size: 13px;
      text-align: center;
      margin-top: 40%;
    }
    .msg {
      font-size: 13px;
      line-height: 1.6;
      word-wrap: break-word;
    }
    .label {
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 2px;
    }
    .msg-user .label { color: #a1a1aa; }
    .msg-user .text { color: #d4d4d8; }
    .msg-assistant .label { color: #d4d4d8; }
    .msg-assistant .text {
      color: #d4d4d8;
    }
    .msg-assistant .text a {
      color: #60a5fa;
      text-decoration: underline;
      text-underline-offset: 2px;
      text-decoration-color: #3b82f640;
    }
    .msg-assistant .text a:hover { text-decoration-color: #60a5fa; }
    .msg-assistant .text strong { color: #e4e4e7; }
    .msg-assistant .text em { font-style: italic; }
    .msg-assistant .text .md-code {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      background: #27272a;
      padding: 1px 5px;
      border-radius: 3px;
      color: #d4d4d8;
    }
    .msg-assistant .text .md-pre {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 5px;
      padding: 8px 10px;
      margin: 6px 0;
      overflow-x: auto;
      font-family: ui-monospace, monospace;
      font-size: 11px;
      line-height: 1.5;
      color: #d4d4d8;
    }
    .msg-assistant .text .md-li {
      display: block;
      padding-left: 14px;
      text-indent: -14px;
      line-height: 1.5;
    }
    .msg-assistant .text .md-li:first-child,
    .msg-assistant .text br + .md-li { margin-top: 4px; }
    .msg-assistant .text .md-li:last-child { margin-bottom: 4px; }
    .msg-assistant .text .md-li::before {
      content: '\\2022\\00a0\\00a0';
      color: #52525b;
    }
    .msg-assistant .text .md-h {
      display: block;
      color: #e4e4e7;
      margin-top: 4px;
    }
    .msg-tool {
      font-family: ui-monospace, monospace;
      font-size: 11px;
      color: #71717a;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 5px;
      padding: 6px 10px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .msg-tool-result {
      font-family: ui-monospace, monospace;
      font-size: 10px;
      color: #52525b;
      background: #111113;
      border: 1px solid #1e1e22;
      border-top: none;
      border-radius: 0 0 5px 5px;
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.2s, padding 0.2s;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .msg-tool-result.open {
      max-height: 200px;
      padding: 6px 10px;
      overflow-y: auto;
    }
    .msg-tool.expandable {
      cursor: pointer;
      border-radius: 5px 5px 0 0;
    }
    .msg-tool.expandable::after {
      content: ' +';
      color: #3f3f46;
    }
    .msg-tool.expandable.expanded::after {
      content: ' -';
    }
    .msg-error {
      font-size: 12px;
      color: #f87171;
      background: #1c0a0a;
      border: 1px solid #7f1d1d;
      border-radius: 5px;
      padding: 6px 10px;
    }
    .input-area {
      padding: 10px 12px;
      border-top: 1px solid #27272a;
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }
    .input-area input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #3f3f46;
      background: #18181b;
      color: #e4e4e7;
      border-radius: 6px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s;
    }
    .input-area input:focus { border-color: #71717a; }
    .input-area input::placeholder { color: #52525b; }
    .input-area input:disabled { opacity: 0.5; }
    .send-btn {
      padding: 8px 16px;
      background: #3f3f46;
      color: #e4e4e7;
      border: 1px solid #52525b;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s, border-color 0.15s;
    }
    .send-btn:hover { background: #52525b; border-color: #71717a; }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .tab-bar {
      display: flex;
      border-bottom: 1px solid #27272a;
      flex-shrink: 0;
      background: #18181b;
    }
    .tab {
      flex: 1;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      font-family: ui-monospace, monospace;
      color: #71717a;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }
    .tab:hover { color: #a1a1aa; }
    .tab.active { color: #e4e4e7; border-bottom-color: #e4e4e7; }
    .file-dir-header {
      padding: 6px 16px;
      font-family: ui-monospace, monospace;
      font-size: 11px;
      font-weight: 600;
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #09090b;
      position: sticky;
      top: 0;
    }
    .file-item {
      padding: 8px 16px;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      color: #a1a1aa;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.1s;
      border-bottom: 1px solid #1e1e22;
    }
    .file-item:hover { background: #18181b; color: #e4e4e7; }
    .file-item .file-path { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .editor-header {
      padding: 8px 12px;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      background: #18181b;
    }
    .editor-back {
      background: none;
      border: none;
      color: #a1a1aa;
      font-size: 16px;
      cursor: pointer;
      padding: 2px 6px;
      line-height: 1;
    }
    .editor-back:hover { color: #e4e4e7; }
    .editor-filename {
      flex: 1;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      color: #d4d4d8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .editor-wrap {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    .editor-textarea {
      width: 100%;
      height: 100%;
      background: #09090b;
      color: #d4d4d8;
      border: none;
      padding: 8px 12px 8px 48px;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      line-height: 1.6;
      resize: none;
      outline: none;
      tab-size: 2;
      white-space: pre;
      overflow: auto;
    }
    .line-numbers {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 40px;
      padding: 8px 8px 8px 0;
      font-family: ui-monospace, monospace;
      font-size: 12px;
      line-height: 1.6;
      color: #3f3f46;
      text-align: right;
      user-select: none;
      pointer-events: none;
      overflow: hidden;
      background: #0a0a0c;
      border-right: 1px solid #1e1e22;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1><span class="status-dot" id="status-dot"></span> viagen <span class="session-timer" id="session-timer"></span></h1>
    <div style="display:flex;gap:4px;">
      <button class="btn" id="popout-btn" title="Open split view" style="display:flex;align-items:center;padding:5px 7px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"></path></svg>
      </button>
      <button class="btn" id="sound-btn" title="Toggle completion sound" style="display:flex;align-items:center;padding:5px 7px;">
        <svg id="sound-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
      </button>
      <button class="btn" id="publish-btn" style="display:none">Publish</button>
      <button class="btn" id="reset-btn">Reset</button>
    </div>
  </div>
  ${hasEditor ? `<div class="tab-bar" id="tab-bar">
    <button class="tab active" data-tab="chat">Chat</button>
    <button class="tab" data-tab="files">Files</button>
  </div>` : ''}
  <div id="chat-view" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">
    <div class="setup-banner" id="setup-banner"></div>
    <div class="activity-bar" id="activity-bar"></div>
    <div class="messages" id="messages"></div>
    <div class="input-area">
      <input type="text" id="input" placeholder="What do you want to build?" autofocus />
      <button class="send-btn" id="send-btn">Send</button>
    </div>
  </div>
  ${hasEditor ? `<div id="files-view" style="display:none;flex-direction:column;flex:1;overflow:hidden;">
    <div id="file-list-view" style="flex:1;overflow-y:auto;">
      <div id="file-list" style="padding:0;"></div>
    </div>
    <div id="file-editor-view" style="display:none;flex-direction:column;flex:1;overflow:hidden;">
      <div class="editor-header">
        <button class="editor-back" id="editor-back" title="Back to files">&#x2190;</button>
        <span class="editor-filename" id="editor-filename"></span>
        <button class="btn" id="editor-save" disabled>Save</button>
      </div>
      <div class="editor-wrap" id="editor-wrap">
        <div class="line-numbers" id="line-numbers"></div>
        <textarea id="editor-textarea" class="editor-textarea" spellcheck="false"></textarea>
      </div>
    </div>
  </div>` : ''}
  <script>
    var STORAGE_KEY = 'viagen_chatLog';
    var SOUND_KEY = 'viagen_sound';
    var messagesEl = document.getElementById('messages');
    var inputEl = document.getElementById('input');
    var sendBtn = document.getElementById('send-btn');
    var resetBtn = document.getElementById('reset-btn');
    var publishBtn = document.getElementById('publish-btn');
    var soundBtn = document.getElementById('sound-btn');
    var activityBar = document.getElementById('activity-bar');
    var currentTextSpan = null;
    var isStreaming = false;
    var chatLog = []; // Array of { type: 'user'|'text'|'tool'|'error'|'summary', content: string }
    var unloading = false;
    var sendStartTime = 0;
    var toolCount = 0;
    var activityTimer = null;
    var soundEnabled = false;

    var soundIcon = document.getElementById('sound-icon');
    var speakerOn = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
    var speakerOff = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';

    function updateSoundIcon() {
      soundIcon.innerHTML = soundEnabled ? speakerOn : speakerOff;
      soundBtn.classList.toggle('active', soundEnabled);
    }

    // Load sound preference
    try { soundEnabled = localStorage.getItem(SOUND_KEY) === '1'; } catch(e) {}
    updateSoundIcon();

    soundBtn.addEventListener('click', function() {
      soundEnabled = !soundEnabled;
      try { localStorage.setItem(SOUND_KEY, soundEnabled ? '1' : '0'); } catch(e) {}
      updateSoundIcon();
      // Play a short test beep on first enable
      if (soundEnabled) playDoneSound();
    });

    function playDoneSound() {
      if (!soundEnabled) return;
      try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } catch(e) {}
    }

    function formatDuration(ms) {
      if (ms < 1000) return ms + 'ms';
      var secs = Math.round(ms / 1000);
      if (secs < 60) return secs + 's';
      var mins = Math.floor(secs / 60);
      secs = secs % 60;
      return mins + 'm ' + secs + 's';
    }

    function updateActivityBar() {
      if (!isStreaming) return;
      var elapsed = formatDuration(Date.now() - sendStartTime);
      var parts = [elapsed];
      if (toolCount > 0) parts.push(toolCount + (toolCount === 1 ? ' action' : ' actions'));
      activityBar.textContent = parts.join(' · ');
    }

    function showActivity() {
      activityBar.style.display = 'block';
      activityBar.classList.remove('done');
      updateActivityBar();
      activityTimer = setInterval(updateActivityBar, 1000);
    }

    function hideActivity() {
      if (activityTimer) { clearInterval(activityTimer); activityTimer = null; }
      var elapsed = formatDuration(Date.now() - sendStartTime);
      var parts = ['Done in ' + elapsed];
      if (toolCount > 0) parts.push(toolCount + (toolCount === 1 ? ' action' : ' actions'));
      activityBar.textContent = parts.join(' · ');
      activityBar.classList.add('done');
      setTimeout(function() { activityBar.style.display = 'none'; }, 5000);
    }
    window.addEventListener('beforeunload', function() { unloading = true; });
    window.addEventListener('pagehide', function() { unloading = true; });
    try { window.parent.addEventListener('beforeunload', function() { unloading = true; }); } catch(e) {}

    function saveHistory() {
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chatLog)); } catch(e) {}
    }

    function loadHistory() {
      try {
        var saved = sessionStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        chatLog = JSON.parse(saved);
        for (var i = 0; i < chatLog.length; i++) {
          var entry = chatLog[i];
          if (entry.type === 'user') renderUserMessage(entry.content);
          else if (entry.type === 'text') renderTextBlock(entry.content);
          else if (entry.type === 'tool') renderToolBlock(entry.content);
          else if (entry.type === 'tool_result') renderToolResult(entry.content);
          else if (entry.type === 'error') renderErrorBlock(entry.content);
        }
        messagesEl.scrollTop = messagesEl.scrollHeight;
      } catch(e) {}
    }

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function renderInline(text) {
      // Split by inline code to protect it from further processing
      var parts = text.split(/(\`[^\`]+\`)/g);
      var out = '';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.charAt(0) === '\`' && p.charAt(p.length - 1) === '\`') {
          out += '<span class="md-code">' + escapeHtml(p.slice(1, -1)) + '</span>';
        } else {
          var s = escapeHtml(p);
          // Bold
          s = s.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
          // Italic (single * not preceded/followed by *)
          s = s.replace(/(?:^|[^*])\\*([^*]+)\\*(?:[^*]|$)/g, function(m, g) { return m.replace('*' + g + '*', '<em>' + g + '</em>'); });
          // Links [text](url)
          s = s.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
          // Bare URLs
          s = s.replace(/(^|\\s)(https?:\\/\\/[^\\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
          out += s;
        }
      }
      return out;
    }

    function renderMarkdown(text) {
      // Split by fenced code blocks
      var parts = text.split(/(^\`\`\`[\\s\\S]*?^\`\`\`)/gm);
      // Fallback: if no code blocks matched, try non-multiline split
      if (parts.length === 1) {
        parts = text.split(/(\`\`\`[\\w]*\\n[\\s\\S]*?\\n\`\`\`)/g);
      }
      var html = '';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.indexOf('\`\`\`') === 0) {
          // Code block — strip fence and optional language tag
          var code = p.replace(/^\`\`\`\\w*\\n?/, '').replace(/\\n?\`\`\`$/, '');
          html += '<pre class="md-pre">' + escapeHtml(code) + '</pre>';
        } else {
          // Process line by line
          var lines = p.split('\\n');
          var lineHtml = [];
          for (var j = 0; j < lines.length; j++) {
            var line = lines[j];
            // Headers
            if (line.match(/^### /)) { lineHtml.push('<strong class="md-h">' + renderInline(line.slice(4)) + '</strong>'); }
            else if (line.match(/^## /)) { lineHtml.push('<strong class="md-h">' + renderInline(line.slice(3)) + '</strong>'); }
            else if (line.match(/^# /)) { lineHtml.push('<strong class="md-h">' + renderInline(line.slice(2)) + '</strong>'); }
            // List items (- or *)
            else if (line.match(/^[-*] /)) { lineHtml.push('<span class="md-li">' + renderInline(line.slice(2)) + '</span>'); }
            // Normal line
            else { lineHtml.push(renderInline(line)); }
          }
          // Join lines, skipping <br> between consecutive list items
          var joined = '';
          for (var k = 0; k < lineHtml.length; k++) {
            if (k > 0) {
              var prevLi = lineHtml[k - 1].indexOf('md-li') !== -1;
              var currLi = lineHtml[k].indexOf('md-li') !== -1;
              if (!(prevLi && currLi)) joined += '<br>';
            }
            joined += lineHtml[k];
          }
          html += joined;
        }
      }
      return html;
    }

    function formatTool(name, input) {
      switch (name) {
        case 'Read': return 'Reading ' + (input.file_path || '');
        case 'Edit': return 'Editing ' + (input.file_path || '');
        case 'Write': return 'Writing ' + (input.file_path || '');
        case 'Bash': return '$ ' + (input.command || '');
        case 'Glob': return 'Finding ' + (input.pattern || '');
        case 'Grep': return 'Searching "' + (input.pattern || '') + '"';
        default: return name + ': ' + JSON.stringify(input).slice(0, 80);
      }
    }

    function renderUserMessage(text) {
      var div = document.createElement('div');
      div.className = 'msg msg-user';
      div.innerHTML = '<span class="label">You</span><span class="text">' + escapeHtml(text) + '</span>';
      messagesEl.appendChild(div);
    }

    function renderTextBlock(text) {
      currentTextSpan = null;
      var div = document.createElement('div');
      div.className = 'msg msg-assistant';
      div.innerHTML = '<span class="label">Claude</span><span class="text stream-text"></span>';
      messagesEl.appendChild(div);
      div.querySelector('.stream-text').innerHTML = renderMarkdown(text);
    }

    var lastToolEl = null;

    function renderToolBlock(text) {
      currentTextSpan = null;
      var div = document.createElement('div');
      div.className = 'msg msg-tool';
      div.textContent = text;
      messagesEl.appendChild(div);
      lastToolEl = div;
    }

    function renderErrorBlock(text) {
      var div = document.createElement('div');
      div.className = 'msg msg-error';
      div.textContent = text;
      messagesEl.appendChild(div);
    }

    function addUserMessage(text) {
      chatLog.push({ type: 'user', content: text });
      saveHistory();
      renderUserMessage(text);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function appendText(text) {
      var last = chatLog[chatLog.length - 1];
      if (last && last.type === 'text') {
        last.content += text;
      } else {
        chatLog.push({ type: 'text', content: text });
      }
      saveHistory();

      if (!currentTextSpan) {
        var div = document.createElement('div');
        div.className = 'msg msg-assistant';
        div.innerHTML = '<span class="label">Claude</span><span class="text stream-text"></span>';
        messagesEl.appendChild(div);
        currentTextSpan = div.querySelector('.stream-text');
      }
      var fullText = chatLog[chatLog.length - 1].content;
      currentTextSpan.innerHTML = renderMarkdown(fullText);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function addToolBlock(name, input) {
      currentTextSpan = null;
      var label = formatTool(name, input);
      chatLog.push({ type: 'tool', content: label });
      saveHistory();
      renderToolBlock(label);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function renderToolResult(text) {
      if (!lastToolEl) return;
      lastToolEl.classList.add('expandable');
      var resultDiv = document.createElement('div');
      resultDiv.className = 'msg-tool-result';
      var truncated = text.length > 2000 ? text.slice(0, 2000) + '...' : text;
      resultDiv.textContent = truncated;
      lastToolEl.after(resultDiv);
      lastToolEl.addEventListener('click', function() {
        lastToolEl.classList.toggle('expanded');
        resultDiv.classList.toggle('open');
      });
    }

    function addToolResult(text) {
      chatLog.push({ type: 'tool_result', content: text });
      saveHistory();
      renderToolResult(text);
    }

    function addErrorBlock(text) {
      chatLog.push({ type: 'error', content: text });
      saveHistory();
      renderErrorBlock(text);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setStreaming(v) {
      isStreaming = v;
      inputEl.disabled = v;
      sendBtn.disabled = v;
      sendBtn.textContent = v ? '...' : 'Send';
    }

    async function send() {
      var text = inputEl.value.trim();
      if (!text || isStreaming) return;

      addUserMessage(text);
      inputEl.value = '';
      setStreaming(true);
      currentTextSpan = null;
      sendStartTime = Date.now();
      toolCount = 0;
      showActivity();

      try {
        var res = await fetch('/via/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });

        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var buffer = '';

        while (true) {
          var result = await reader.read();
          if (result.done) break;

          buffer += decoder.decode(result.value, { stream: true });
          var lines = buffer.split('\\n');
          buffer = lines.pop() || '';

          for (var i = 0; i < lines.length; i++) {
            if (!lines[i].startsWith('data: ')) continue;
            try {
              var data = JSON.parse(lines[i].slice(6));
              if (data.type === 'text') appendText(data.text);
              else if (data.type === 'tool_use') { toolCount++; updateActivityBar(); addToolBlock(data.name, data.input); }
              else if (data.type === 'tool_result') addToolResult(data.text);
              else if (data.type === 'error') addErrorBlock(data.text);
            } catch (e) {}
          }
        }
      } catch (e) {
        if (!unloading) addErrorBlock('Connection failed');
      }

      hideActivity();
      playDoneSound();
      setStreaming(false);
      inputEl.focus();
    }

    sendBtn.addEventListener('click', send);
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    resetBtn.addEventListener('click', async function () {
      await fetch('/via/chat/reset', { method: 'POST' });
      chatLog = [];
      saveHistory();
      messagesEl.innerHTML = '';
      currentTextSpan = null;
      inputEl.focus();
    });
    publishBtn.addEventListener('click', function () {
      if (isStreaming) return;
      if (publishBtn.dataset.branch && publishBtn.dataset.branch !== 'main' && publishBtn.dataset.branch !== 'master') {
        inputEl.value = 'Commit all changes, push to the remote branch, and create a pull request using gh pr create. Share the PR URL.';
      } else {
        inputEl.value = 'Commit all changes, push to the remote repository, and run vercel deploy to get a preview URL';
      }
      send();
    });

    // Pop-out button — open split view in new tab
    var popoutBtn = document.getElementById('popout-btn');
    popoutBtn.addEventListener('click', function() {
      window.open('/via/iframe', '_blank');
    });

    // Accept messages from parent (e.g. "Fix This Error" button)
    window.addEventListener('message', function(ev) {
      if (ev.data && ev.data.type === 'viagen:send' && ev.data.message) {
        inputEl.value = ev.data.message;
        send();
      }
      // Hide pop-out button when already in iframe split view
      if (ev.data && ev.data.type === 'viagen:context' && ev.data.iframe) {
        popoutBtn.style.display = 'none';
      }
    });

    function startSessionTimer(expiresAt) {
      var timerEl = document.getElementById('session-timer');
      function tick() {
        var remaining = expiresAt - Math.floor(Date.now() / 1000);
        if (remaining <= 0) {
          timerEl.textContent = 'expired';
          timerEl.className = 'session-timer critical';
          return;
        }
        var mins = Math.floor(remaining / 60);
        var secs = remaining % 60;
        timerEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
        if (remaining <= 120) timerEl.className = 'session-timer critical';
        else if (remaining <= 300) timerEl.className = 'session-timer warning';
        else timerEl.className = 'session-timer';
        setTimeout(tick, 1000);
      }
      tick();
    }

    // Health check — show status and disable input if not configured
    fetch('/via/health')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var dot = document.getElementById('status-dot');
        var banner = document.getElementById('setup-banner');
        if (data.configured) {
          dot.className = 'status-dot ok';
          if (data.git) {
            publishBtn.style.display = '';
            if (data.branch) publishBtn.dataset.branch = data.branch;
          }
        } else {
          dot.className = 'status-dot error';
          inputEl.disabled = true;
          sendBtn.disabled = true;
          inputEl.placeholder = 'Not configured — run npx viagen setup';
          banner.style.display = 'block';
          banner.innerHTML = 'Run <code>npx viagen setup</code> to configure auth, then restart the dev server.';
        }
        if (data.session) startSessionTimer(data.session.expiresAt);
      })
      .catch(function() {
        document.getElementById('status-dot').className = 'status-dot error';
      });

    loadHistory();

    // ── File editor panel ──
    ${hasEditor ? `
    (function() {
      var chatView = document.getElementById('chat-view');
      var filesView = document.getElementById('files-view');
      var tabs = document.querySelectorAll('.tab');
      var fileListView = document.getElementById('file-list-view');
      var fileEditorView = document.getElementById('file-editor-view');
      var editorTextarea = document.getElementById('editor-textarea');
      var lineNumbersEl = document.getElementById('line-numbers');
      var editorWrap = document.getElementById('editor-wrap');
      var editorSave = document.getElementById('editor-save');
      var editorFilename = document.getElementById('editor-filename');

      var editorState = { path: '', original: '', modified: false };

      // Tab switching
      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          tabs.forEach(function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          var target = tab.dataset.tab;
          chatView.style.display = target === 'chat' ? 'flex' : 'none';
          filesView.style.display = target === 'files' ? 'flex' : 'none';
          if (target === 'files') loadFileList();
          if (target === 'chat') inputEl.focus();
        });
      });

      // File list
      async function loadFileList() {
        var listEl = document.getElementById('file-list');
        listEl.innerHTML = '<div style="padding:16px;color:#52525b;font-size:12px;font-family:ui-monospace,monospace;">Loading...</div>';
        try {
          var res = await fetch('/via/files');
          var data = await res.json();
          renderFileList(data.files);
        } catch(e) {
          listEl.innerHTML = '<div style="padding:16px;color:#f87171;font-size:12px;">Failed to load files</div>';
        }
      }

      function renderFileList(files) {
        var listEl = document.getElementById('file-list');
        listEl.innerHTML = '';
        if (files.length === 0) {
          listEl.innerHTML = '<div style="padding:16px;color:#52525b;font-size:12px;">No editable files configured</div>';
          return;
        }
        var groups = {};
        files.forEach(function(f) {
          var parts = f.split('/');
          var dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
          if (!groups[dir]) groups[dir] = [];
          groups[dir].push(f);
        });
        Object.keys(groups).sort().forEach(function(dir) {
          var header = document.createElement('div');
          header.className = 'file-dir-header';
          header.textContent = dir === '.' ? 'root' : dir;
          listEl.appendChild(header);
          groups[dir].forEach(function(filePath) {
            var item = document.createElement('div');
            item.className = 'file-item';
            var name = filePath.split('/').pop();
            item.innerHTML = '<span style="color:#52525b;font-size:10px;">&#9634;</span><span class="file-path" title="' + escapeHtml(filePath) + '">' + escapeHtml(name) + '</span>';
            item.addEventListener('click', function() { openFile(filePath); });
            listEl.appendChild(item);
          });
        });
      }

      // Open file in editor
      async function openFile(path) {
        fileListView.style.display = 'none';
        fileEditorView.style.display = 'flex';
        editorFilename.textContent = path;
        editorSave.disabled = true;
        editorSave.textContent = 'Save';

        try {
          var res = await fetch('/via/file?path=' + encodeURIComponent(path));
          var data = await res.json();
          editorState = { path: path, original: data.content, modified: false };
          editorTextarea.value = data.content;
          updateLineNumbers();
        } catch(e) {
          editorTextarea.value = '// Error loading file';
          updateLineNumbers();
        }
      }

      // Line numbers
      function updateLineNumbers() {
        var lines = editorTextarea.value.split('\\n').length;
        var nums = '';
        for (var i = 1; i <= lines; i++) nums += i + '\\n';
        lineNumbersEl.textContent = nums;
      }

      function markModified() {
        editorState.modified = (editorTextarea.value !== editorState.original);
        editorSave.disabled = !editorState.modified;
      }

      // Textarea handling
      editorTextarea.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          var start = this.selectionStart;
          var end = this.selectionEnd;
          this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
          this.selectionStart = this.selectionEnd = start + 2;
          updateLineNumbers();
          markModified();
        }
      });
      editorTextarea.addEventListener('input', function() {
        updateLineNumbers();
        markModified();
      });
      editorTextarea.addEventListener('scroll', function() {
        lineNumbersEl.scrollTop = this.scrollTop;
      });

      // Save
      editorSave.addEventListener('click', async function() {
        editorSave.disabled = true;
        editorSave.textContent = 'Saving...';
        var content = editorTextarea.value;
        try {
          var res = await fetch('/via/file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: editorState.path, content: content }),
          });
          var data = await res.json();
          if (data.status === 'ok') {
            editorState.original = content;
            editorState.modified = false;
            editorSave.textContent = 'Saved';
            setTimeout(function() { editorSave.textContent = 'Save'; }, 1500);
          } else {
            editorSave.textContent = 'Error';
            setTimeout(function() { editorSave.textContent = 'Save'; editorSave.disabled = false; }, 2000);
          }
        } catch(e) {
          editorSave.textContent = 'Error';
          setTimeout(function() { editorSave.textContent = 'Save'; editorSave.disabled = false; }, 2000);
        }
      });

      // Back button
      document.getElementById('editor-back').addEventListener('click', function() {
        if (editorState.modified) {
          if (!confirm('Discard unsaved changes?')) return;
        }
        fileEditorView.style.display = 'none';
        fileListView.style.display = 'block';
        loadFileList();
      });

    })();
    ` : ''}
  </script>
</body>
</html>`;
}
