console.log('background.js loaded')

chrome.app.runtime.onLaunched.addListener(function() {
  console.log('background.js chrome.app.runtime.onLaunched')

  chrome.app.window.create('index.html', {
    innerBounds: {
      width: 1024,
      height: 768,
      minWidth: 1024,
      minHeight: 768,
    }
  });
});
