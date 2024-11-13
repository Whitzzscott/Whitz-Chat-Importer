(function() {
  function extractChats() {
    const chatElements = [
      ...document.querySelectorAll('div.mt-1.max-w-xl.rounded-2xl.px-3.min-h-12.flex.justify-center.py-3.bg-surface-elevation-3'),
      ...document.querySelectorAll('div.mb-8.flex.w-full.flex-1.flex-col.gap-2\\.5'),
      ...document.querySelectorAll('div.css-0')
    ];

    const chatContents = new Set();

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

    const topChatContents = Array.from(chatContents).slice(0, 10);

    if (topChatContents.length > 0) {
      chrome.runtime.sendMessage({
        type: 'CHATS_EXTRACTED',
        data: topChatContents
      });
    }
  }

  const extractButton = document.createElement('button');
  extractButton.textContent = 'Extract Chats';
  Object.assign(extractButton.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease, transform 0.2s',
  });
  extractButton.addEventListener('mouseenter', () => {
    extractButton.style.transform = 'scale(1.1)';
  });
  extractButton.addEventListener('mouseleave', () => {
    extractButton.style.transform = 'scale(1)';
  });
  document.body.appendChild(extractButton);

  extractButton.addEventListener('click', extractChats);

  const uploadButton = document.createElement('button');
  uploadButton.textContent = 'Upload Chat File';
  Object.assign(uploadButton.style, {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    padding: '10px 20px',
    backgroundColor: '#008CBA',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease, transform 0.2s',
  });
  uploadButton.addEventListener('mouseenter', () => {
    uploadButton.style.transform = 'scale(1.1)';
  });
  uploadButton.addEventListener('mouseleave', () => {
    uploadButton.style.transform = 'scale(1)';
  });
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
            sendMessages(chatMessages.reverse());
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
  Object.assign(setIntervalButton.style, {
    position: 'fixed',
    bottom: '140px',
    right: '20px',
    padding: '10px 20px',
    backgroundColor: '#FF9800',
    color: 'white',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease, transform 0.2s',
  });
  setIntervalButton.addEventListener('mouseenter', () => {
    setIntervalButton.style.transform = 'scale(1.1)';
  });
  setIntervalButton.addEventListener('mouseleave', () => {
    setIntervalButton.style.transform = 'scale(1)';
  });
  document.body.appendChild(setIntervalButton);

  let interval = 10000;

  setIntervalButton.addEventListener('click', () => {
    let userInterval = prompt('Enter the interval in seconds for each message (default is 10s):');
    userInterval = userInterval.replace(/\D/g, '');
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
