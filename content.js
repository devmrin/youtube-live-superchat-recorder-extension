let observer = null;
let parsedIds = new Set(); // To prevent duplicates

async function getSuperchats() {
  const result = await chrome.storage.local.get('superchats');
  return result.superchats || [];
}

async function addSuperchat(data) {
  const superchats = await getSuperchats();
  superchats.push(data);
  await chrome.storage.local.set({ superchats });
}

function extractSuperchatData(node) {
  // The node itself or a descendant might be the paid message renderer
  let renderer = null;
  if (node.tagName && node.tagName.toLowerCase() === 'yt-live-chat-paid-message-renderer') {
    renderer = node;
  } else if (node.querySelector) {
    renderer = node.querySelector('yt-live-chat-paid-message-renderer');
  }
  
  if (!renderer) return null;

  const authorNode = renderer.querySelector('#author-name');
  const amountNode = renderer.querySelector('#purchase-amount');
  const messageNode = renderer.querySelector('#message');
  const timestampNode = renderer.querySelector('#timestamp');

  if (!authorNode || !amountNode) return null;

  const author = authorNode.textContent.trim();
  const amount = amountNode.textContent.trim();
  const message = messageNode ? messageNode.textContent.trim() : '';
  const timestamp = timestampNode ? timestampNode.textContent.trim() : '';
  
  // Use elements' native id if possible, else combination string
  const idStr = renderer.id ? renderer.id : `${author}-${amount}-${timestamp}-${message}`;
  
  if (parsedIds.has(idStr)) return null;
  parsedIds.add(idStr);

  return {
    author,
    amount,
    message,
    timestamp: new Date().toISOString()
  };
}

function handleMutations(mutations) {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const data = extractSuperchatData(node);
          if (data) {
            console.log("Superchat Recorder: Recorded new superchat:", data);
            addSuperchat(data).catch(console.error);
          }
        }
      }
    }
  }
}

function startObserving() {
  if (observer) return;
  // Fallback to body if #item-scroller is not found immediately
  const chatContainer = document.querySelector('#item-scroller') || document.body;
  
  observer = new MutationObserver(handleMutations);
  observer.observe(chatContainer, {
    childList: true,
    subtree: true
  });
  console.log("Superchat Recorder: Started observing chat.");
}

function stopObserving() {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log("Superchat Recorder: Stopped observing chat.");
  }
}

// Check initial state
chrome.storage.local.get('isRecording', (result) => {
  if (result.isRecording) {
    startObserving();
  }
});

// Listen for state changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isRecording) {
    if (changes.isRecording.newValue === true) {
      startObserving();
    } else {
      stopObserving();
    }
  }
  if (changes.superchats && changes.superchats.newValue && changes.superchats.newValue.length === 0) {
     parsedIds.clear(); // Reset duplicates check if data is cleared
  }
});
