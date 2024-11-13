chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHATS_EXTRACTED') {
    const chatData = message.data;

    let htmlContent = chatData.map(chat => 
      `<li><p>${chat}</p></li>`
    ).join('\n');

    htmlContent = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline Chat</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            transition: background-color 0.6s ease, color 0.6s ease, transform 0.5s ease;
            background-color: #ecf0f1;
            color: #2c3e50;
        }
        .container {
            padding: 50px;
            text-align: center;
            transition: transform 0.4s ease-in-out;
        }
        h1 {
            font-size: 3.2em;
            color: inherit;
            letter-spacing: 3px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
            animation: fadeInUp 1.5s ease-out;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 30px 0;
            animation: fadeInList 2s ease-out;
        }
        li {
            font-size: 1.5em;
            margin: 15px 0;
            opacity: 0;
            animation: fadeInItem 2s ease forwards;
        }
        li:nth-child(odd) {
            animation-delay: 0.2s;
        }
        li:nth-child(even) {
            animation-delay: 0.4s;
        }
        .theme-toggle {
            position: fixed;
            top: 20px;
            right: 200px;
            cursor: pointer;
            padding: 15px 25px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 30px;
            font-size: 1.2em;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }
        .theme-toggle:hover {
            background-color: #2980b9;
            transform: scale(1.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        body.dark {
            background-color: #2c3e50;
            color: #ecf0f1;
        }
        body.light {
            background-color: #ecf0f1;
            color: #2c3e50;
        }
        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(30px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes fadeInList {
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }
        @keyframes fadeInItem {
            0% {
                opacity: 0;
                transform: translateY(10px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body class="light">
    <div class="container">
        <h1>This HTML File is Created by Whitzscott Chat Importer Extension.</h1>
        <p>
            <ul>${htmlContent}</ul>
        </p>
        <button class="theme-toggle" onclick="toggleTheme()">Toggle Dark/Light Mode</button>
    </div>

    <script>
        function toggleTheme() {
            const body = document.body;
            if (body.classList.contains('light')) {
                body.classList.remove('light');
                body.classList.add('dark');
            } else {
                body.classList.remove('dark');
                body.classList.add('light');
            }
        }
    </script>
</body>
</html>

    `;

    const base64Content = btoa(unescape(encodeURIComponent(htmlContent)));
    const dataUrl = `data:text/html;base64,${base64Content}`;

    chrome.downloads.download({
      url: dataUrl,
      filename: 'extracted_chats.html',
      saveAs: true
    });

    let index = 0;

    const sendNextMessage = () => {
      if (index < chatData.length) {
        const chat = chatData[index];

        chrome.scripting.executeScript({
          target: { tabId: sender.tab.id },
          func: sendMessage,
          args: [chat]
        }, () => {
          index++;
          if (index < chatData.length) {
            setTimeout(sendNextMessage, 2000);
          }
        });
      }
    };

    sendNextMessage();
  }
});

function sendMessage(chat) {
  const textArea = document.querySelector('textarea[placeholder="Message"]');
  const continueButton = document.querySelector('button[type="submit"]');

  if (textArea && continueButton) {
    textArea.value = chat;
    textArea.dispatchEvent(new Event('input', { bubbles: true }));
    continueButton.click();
  }
}
