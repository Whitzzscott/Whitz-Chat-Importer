chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHATS_EXTRACTED') {
    const chatData = message.data;

    let htmlContent = chatData.map(chat => 
      `<li><p>${chat}</p></li>`
    ).join('\n');

    htmlContent = `
    <div>
    <h1>This HTML FILE is created from </h1>
    </div>
    <p>
    <ul>${htmlContent}</ul>
    <p>
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
