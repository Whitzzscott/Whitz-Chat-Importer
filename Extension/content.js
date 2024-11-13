(function() {
  function extractChats() {
    const chatElements = document.querySelectorAll('div.mt-1.max-w-xl.rounded-2xl.px-3.min-h-12.flex.justify-center.py-3.bg-surface-elevation-3');
    const chatContents = new Set(); // Using a Set to automatically remove duplicates

    chatElements.forEach(chat => {
      const pTag = chat.querySelector('p[node]');
      if (pTag && pTag.innerText.trim()) {
        chatContents.add(pTag.innerText.trim());
      }

      const divContent = chat.innerText.trim();
      if (divContent && !chatContents.has(divContent)) {
        chatContents.add(divContent);
      }
    });

    if (chatContents.size > 0) {
      chrome.runtime.sendMessage({
        type: 'CHATS_EXTRACTED',
        data: Array.from(chatContents)
      });
    }
  }

  const extractButton = document.createElement('button');
  extractButton.textContent = 'Extract Chats';
  extractButton.style.position = 'fixed';
  extractButton.style.bottom = '20px';
  extractButton.style.right = '20px';
  extractButton.style.padding = '10px 20px';
  extractButton.style.backgroundColor = '#4CAF50';
  extractButton.style.color = 'white';
  extractButton.style.fontSize = '16px';
  extractButton.style.border = 'none';
  extractButton.style.borderRadius = '5px';
  extractButton.style.cursor = 'pointer';
  document.body.appendChild(extractButton);

  extractButton.addEventListener('click', extractChats);

  const uploadButton = document.createElement('button');
  uploadButton.textContent = 'Upload Chat File';
  uploadButton.style.position = 'fixed';
  uploadButton.style.bottom = '80px';
  uploadButton.style.right = '20px';
  uploadButton.style.padding = '10px 20px';
  uploadButton.style.backgroundColor = '#008CBA';
  uploadButton.style.color = 'white';
  uploadButton.style.fontSize = '16px';
  uploadButton.style.border = 'none';
  uploadButton.style.borderRadius = '5px';
  uploadButton.style.cursor = 'pointer';
  document.body.appendChild(uploadButton);

  uploadButton.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.html';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          let fileContent = e.target.result;

          fileContent = fileContent.replace(/<p[^>]*>|<\/p>/gi, '');
          const listItems = fileContent.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
          const chatMessages = listItems.map(item => item.replace(/<li[^>]*>|<\/li>/gi, '').trim()).filter(msg => msg.length > 0);

          if (chatMessages.length > 0) {
            sendMessages(chatMessages);
          }
        };
        reader.readAsText(file);
      }
    });

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  });

  const setIntervalButton = document.createElement('button');
  setIntervalButton.textContent = 'Set Sending Message Interval';
  setIntervalButton.style.position = 'fixed';
  setIntervalButton.style.bottom = '140px';
  setIntervalButton.style.right = '20px';
  setIntervalButton.style.padding = '10px 20px';
  setIntervalButton.style.backgroundColor = '#FF9800';
  setIntervalButton.style.color = 'white';
  setIntervalButton.style.fontSize = '16px';
  setIntervalButton.style.border = 'none';
  setIntervalButton.style.borderRadius = '5px';
  setIntervalButton.style.cursor = 'pointer';
  document.body.appendChild(setIntervalButton);

  let interval = 10000;

  setIntervalButton.addEventListener('click', () => {
    const userInterval = prompt('Enter the interval in seconds for each message (default is 10s):');
    const parsedInterval = parseInt(userInterval, 10);
    if (!isNaN(parsedInterval) && parsedInterval > 0) {
      interval = parsedInterval * 1000;
      alert(`Message interval set to ${parsedInterval} seconds.`);
    } else {
      alert('Invalid input. Keeping the default interval of 10 seconds.');
    }
  });

  function sendMessages(chatMessages) {
    const textArea = document.querySelector('textarea[placeholder="Message"]');
    const continueButton = document.querySelector('button[type="submit"]');

    if (textArea && continueButton) {
      let messageIndex = 0;

      function sendMessage() {
        if (messageIndex < chatMessages.length) {
          const message = chatMessages[messageIndex];
          textArea.value = message;
          textArea.dispatchEvent(new Event('input', { bubbles: true }));

          continueButton.click();
          messageIndex++;

          setTimeout(sendMessage, interval);
        }
      }

      sendMessage();
    }
  }
})();
