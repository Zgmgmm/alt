let currentSpeed = 1;
let customSpeed = 2;
let isAltPressed = false;

// Initialize speed from storage
chrome.storage.sync.get(['playbackSpeed'], (result) => {
  customSpeed = result.playbackSpeed || 2;
});

// Listen for speed updates from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'speedUpdate') {
    customSpeed = message.speed;
    if (!isAltPressed) {
      updateVideoSpeeds(customSpeed);
    }
  }
});

// Handle Alt key events
document.addEventListener('keydown', (e) => {
  if (e.key === 'Alt' && !isAltPressed) {
    isAltPressed = true;
    updateVideoSpeeds(1);
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Alt') {
    isAltPressed = false;
    updateVideoSpeeds(customSpeed);
  }
});

// Update speed for all video elements
function updateVideoSpeeds(speed) {
  const videos = document.getElementsByTagName('video');
  for (const video of videos) {
    video.playbackRate = speed;
  }
}

// Monitor for new video elements
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName === 'VIDEO') {
        node.playbackRate = isAltPressed ? 1 : customSpeed;
      }
    });
  });
});

// Start observing the document
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// Set initial speed for existing videos
updateVideoSpeeds(customSpeed);