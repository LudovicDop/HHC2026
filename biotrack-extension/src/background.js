chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error))

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type === 'PATIENT_DETECTED' && sender.tab) {
    chrome.runtime.sendMessage(message).catch(() => {})
  }
})
