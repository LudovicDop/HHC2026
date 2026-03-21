let lastSentPatientId = null

const PILL_HOST_ID = 'biotrack-open-pill-host'

function injectOpenExtensionPill() {
  if (window !== window.top) return
  if (document.getElementById(PILL_HOST_ID)) return

  const host = document.createElement('div')
  host.id = PILL_HOST_ID
  host.setAttribute('data-biotrack-ui', 'open-pill')

  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = `
    .wrap {
      position: fixed;
      z-index: 2147483646;
      right: max(12px, env(safe-area-inset-right, 0px));
      bottom: max(12px, env(safe-area-inset-bottom, 0px));
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      pointer-events: none;
    }
    .pill {
      pointer-events: auto;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
      padding: 0 14px;
      border: 1px solid rgba(15, 23, 42, 0.12);
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.92);
      color: #f8fafc;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(15, 23, 42, 0.18);
      transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }
    .pill:hover {
      background: rgba(15, 23, 42, 1);
      box-shadow: 0 6px 22px rgba(15, 23, 42, 0.22);
    }
    .pill:active {
      transform: scale(0.97);
    }
    .pill:focus-visible {
      outline: 2px solid #38bdf8;
      outline-offset: 2px;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 9999px;
      background: #34d399;
      box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.35);
      flex-shrink: 0;
    }
    @media print {
      .wrap { display: none !important; }
    }
  `

  const wrap = document.createElement('div')
  wrap.className = 'wrap'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'pill'
  btn.setAttribute('aria-label', 'Ouvrir l’optimiseur FMT 2026')
  btn.title = 'Optimiseur FMT 2026 — nouvel onglet'

  const dot = document.createElement('span')
  dot.className = 'dot'
  dot.setAttribute('aria-hidden', 'true')

  const label = document.createElement('span')
  label.textContent = 'FMT 2026'

  btn.append(dot, label)
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_FMT_DASHBOARD' }).catch(() => {})
  })

  wrap.appendChild(btn)
  shadow.append(style, wrap)
  document.documentElement.appendChild(host)
}

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
  document.addEventListener('DOMContentLoaded', () => {
    injectOpenExtensionPill()
    readPatientFromDomAndNotify()
  })
} else {
  injectOpenExtensionPill()
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
