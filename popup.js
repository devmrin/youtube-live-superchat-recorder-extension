document.addEventListener('DOMContentLoaded', async () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const countEl = document.getElementById('count');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Load initial state
  const { isRecording = false, superchats = [] } = await chrome.storage.local.get(['isRecording', 'superchats']);
  updateUI(isRecording, superchats.length);

  toggleBtn.addEventListener('click', async () => {
    const { isRecording } = await chrome.storage.local.get({ isRecording: false });
    const newState = !isRecording;
    await chrome.storage.local.set({ isRecording: newState });
    updateUI(newState, parseInt(countEl.textContent, 10));
  });

  clearBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all recorded superchats?')) {
      await chrome.storage.local.set({ superchats: [] });
      updateUI(toggleBtn.classList.contains('recording'), 0);
    }
  });

  downloadBtn.addEventListener('click', async () => {
    const { superchats = [] } = await chrome.storage.local.get('superchats');
    if (superchats.length === 0) {
      alert("No superchats recorded yet.");
      return;
    }
    const blob = new Blob([JSON.stringify(superchats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: `superchats_${Date.now()}.json`,
      saveAs: true
    });
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.superchats) {
      countEl.textContent = changes.superchats.newValue.length;
    }
    if (changes.isRecording) {
      updateUI(changes.isRecording.newValue, parseInt(countEl.textContent, 10));
    }
  });

  function updateUI(recording, count) {
    if (recording) {
      toggleBtn.textContent = 'Stop Recording';
      toggleBtn.classList.add('recording');
    } else {
      toggleBtn.textContent = 'Start Recording';
      toggleBtn.classList.remove('recording');
    }
    countEl.textContent = count;
  }
});
