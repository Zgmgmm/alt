document.addEventListener('DOMContentLoaded', () => {
  const speedSlider = document.getElementById('speed');
  const speedValue = document.querySelector('.speed-value');

  // Load saved speed value
  chrome.storage.sync.get(['playbackSpeed'], (result) => {
    const savedSpeed = result.playbackSpeed || 2;
    speedSlider.value = savedSpeed;
    speedValue.textContent = savedSpeed.toFixed(2) + 'x';
  });

  // Update speed value display and save to storage
  speedSlider.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    speedValue.textContent = speed.toFixed(2) + 'x';
    chrome.storage.sync.set({ playbackSpeed: speed });

    // Notify content script of speed change
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'speedUpdate', speed });
    });
  });
});