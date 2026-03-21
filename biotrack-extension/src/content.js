let lastSentPatientId = null

function readPatientFromDomAndNotify() {
  const el =
    document.getElementById('biotrack-active-patient') ||
    document.getElementById('biotrack-active-appointment') ||
    document.getElementById('biotrack-patient-data')
  if (!el) {
    lastSentPatientId = null
    return
  }

  const patientId = el.getAttribute('data-patient-id')
  if (!patientId || patientId === lastSentPatientId) return

  lastSentPatientId = patientId
  chrome.runtime
    .sendMessage({ type: 'PATIENT_DETECTED', patientId })
    .catch(() => {})
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', readPatientFromDomAndNotify)
} else {
  readPatientFromDomAndNotify()
}

const observer = new MutationObserver(() => {
  readPatientFromDomAndNotify()
})
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['data-patient-id'],
})
