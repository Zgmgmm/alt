let currentSpeed = 1;
let customSpeed = 2;
let isAltPressed = false;

// Initialize speed from storage
chrome.storage.sync.get(['playbackSpeed'], (result) => {
  customSpeed = result.playbackSpeed || 2;
});

// Create and style speed overlay for a video element
function createSpeedOverlay(video) {
  const overlay = document.createElement('div');
  overlay.className = 'video-speed-overlay';
  overlay.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 24px;
    font-family: Arial, sans-serif;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  
  // Create wrapper if video is not already wrapped
  let wrapper = video.parentElement;
  if (!wrapper.classList.contains('video-speed-wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'video-speed-wrapper';
    wrapper.style.cssText = 'position: relative; display: inline-block;';
    video.parentElement.insertBefore(wrapper, video);
    wrapper.appendChild(video);
  }
  
  wrapper.appendChild(overlay);
  return overlay;
}

// Show speed overlay temporarily
function showSpeedOverlay(overlay, speed) {
  overlay.textContent = speed.toFixed(2) + 'x';
  overlay.style.opacity = '1';
  setTimeout(() => {
    overlay.style.opacity = '0';
  }, 1000);
}

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
    const overlay = video.parentElement.querySelector('.video-speed-overlay') ||
                   createSpeedOverlay(video);
    showSpeedOverlay(overlay, speed);
  }
}

// Monitor for new video elements
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName === 'VIDEO') {
        const speed = isAltPressed ? 1 : customSpeed;
        node.playbackRate = speed;
        const overlay = createSpeedOverlay(node);
        showSpeedOverlay(overlay, speed);
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