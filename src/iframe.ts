export function buildIframeHtml(opts: { panelWidth: number }): string {
  const pw = opts.panelWidth;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>viagen</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; height: 100vh; background: #09090b; }
    #app-frame { flex: 1; border: none; height: 100%; }
    #chat-frame { width: ${pw}px; border: none; height: 100%; border-left: 1px solid #27272a; }
  </style>
</head>
<body>
  <iframe id="app-frame" src="/?_viagen_embed=1"></iframe>
  <iframe id="chat-frame" src="/via/ui"></iframe>
  <script>
    // Relay postMessage from app iframe to chat iframe (e.g. "Fix This Error")
    window.addEventListener('message', function(ev) {
      if (ev.data && ev.data.type === 'viagen:send') {
        document.getElementById('chat-frame').contentWindow.postMessage(ev.data, '*');
      }
    });
    // Tell chat iframe it's in split-view mode (hides pop-out button)
    var chatFrame = document.getElementById('chat-frame');
    chatFrame.addEventListener('load', function() {
      chatFrame.contentWindow.postMessage({ type: 'viagen:context', iframe: true }, '*');
    });
  </script>
</body>
</html>`;
}
