chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error))

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type === 'OPEN_FMT_DASHBOARD') {
    const url = chrome.runtime.getURL('fmt-dashboard.html')
    chrome.tabs.create({ url }).catch(() => {})
    return
  }

  if (message?.type === 'OPEN_BIOTRACK_SIDE_PANEL' && sender.tab?.id != null) {
    chrome.sidePanel.open({ tabId: sender.tab.id }).catch(() => {})
    return
  }

  if (message?.type === 'PATIENT_DETECTED' && sender.tab) {
    chrome.runtime.sendMessage(message).catch(() => {})
  }
})
