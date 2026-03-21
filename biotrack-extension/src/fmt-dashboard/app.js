import {
  CABINET_DEMO,
  MOCK_PATIENTS,
} from './mockPatients.js'
import {
  aggregateKpis,
  enrichPatient,
  EUR_PREVENTION_PER_GAP,
  FMT_FLOOR_NOT_SEEN_EUR,
  INDICATOR_LABELS,
  MONTHS_VISIT_FORFAIT_LOSS,
  MONTHS_VISIT_WARNING,
  reminderText,
} from './fmtModel.js'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatEur(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

function vaccineMissing(p) {
  const v = ['grippe', 'covid', 'pneumocoque']
  return p._manquants.some((k) => v.includes(k))
}

function applyFilter(list, filterId) {
  if (filterId === 'perte50') {
    return list.filter((p) => p._total > 50)
  }
  if (filterId === 'vaccin') {
    return list.filter((p) => vaccineMissing(p))
  }
  return list
}

function visitPill(p) {
  if (!Number.isFinite(p._moisDepuisVisite)) {
    return { className: 'fmt-pill fmt-pill--loss', text: 'Inconnu' }
  }
  if (p._alerteVisite === 'loss') {
    return {
      className: 'fmt-pill fmt-pill--loss',
      text: `>${MONTHS_VISIT_FORFAIT_LOSS} mois`,
    }
  }
  if (p._alerteVisite === 'warn') {
    return {
      className: 'fmt-pill fmt-pill--warn',
      text: `>${MONTHS_VISIT_WARNING} mois`,
    }
  }
  return { className: 'fmt-pill fmt-pill--ok', text: 'À jour' }
}

function buildFilterOptions(showFinancials) {
  const opts = [{ value: 'all', label: 'Tous les patients' }]
  if (showFinancials) {
    opts.push({ value: 'perte50', label: 'Priorité : perte > 50 €' })
  }
  opts.push({ value: 'vaccin', label: 'Action : à vacciner' })
  return opts
}

export function initFmtDashboard(root) {
  let selectedId = null
  let filterId = 'all'
  let showFinancials = false
  const cabinet = { ...CABINET_DEMO }

  const toast = document.createElement('div')
  toast.className = 'fmt-toast'
  toast.setAttribute('role', 'status')
  document.body.append(toast)

  function showToast(msg) {
    toast.textContent = msg
    toast.classList.add('fmt-toast--show')
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => {
      toast.classList.remove('fmt-toast--show')
    }, 2600)
  }

  root.innerHTML = `
    <div class="fmt-shell">
      <section class="fmt-admin-summary" aria-labelledby="fmt-admin-title">
        <h2 id="fmt-admin-title">Résumé des demandes identifiées</h2>
        <p class="fmt-admin-summary__subtitle">
          Aperçu administratif — suggestion de l’IA à valider par le médecin
        </p>
        <ul class="fmt-admin-summary__list">
          <li class="fmt-admin-card">
            <p class="fmt-admin-card__title">Message patient prioritaire (1)</p>
            <div class="fmt-admin-card__row">
              <span class="fmt-admin-badge fmt-admin-badge--prio">Prioritaire</span>
            </div>
            <p class="fmt-admin-card__hint">Priorité suggérée par l’IA – à valider par le médecin</p>
          </li>
          <li class="fmt-admin-card">
            <p class="fmt-admin-card__title">Ordonnances à renouveler (2)</p>
            <div class="fmt-admin-card__row">
              <span class="fmt-admin-badge fmt-admin-badge--review">À relire rapidement</span>
            </div>
            <p class="fmt-admin-card__hint">Propositions IA en attente de validation</p>
          </li>
          <li class="fmt-admin-card">
            <p class="fmt-admin-card__title">Messages professionnels (4)</p>
            <div class="fmt-admin-card__row">
              <span class="fmt-admin-badge fmt-admin-badge--wait">Peut attendre</span>
            </div>
            <p class="fmt-admin-card__hint">Laboratoires, médecins, pharmacies</p>
          </li>
        </ul>
      </section>

      <header class="fmt-header">
        <div>
          <h1>Optimiseur de FMT 2026</h1>
          <p>Suivi des patients et de la prévention. Les montants FMT sont affichés uniquement sur demande.</p>
        </div>
      </header>

      <div class="fmt-financial-strip">
        <button
          type="button"
          class="fmt-financial-toggle"
          id="fmt-financial-toggle"
          aria-expanded="false"
          aria-controls="fmt-financial-panel"
        >
          Afficher les indicateurs financiers (montants indicatifs)
        </button>
        <div class="fmt-financial-panel" id="fmt-financial-panel" hidden>
          <section class="fmt-context" aria-label="Contexte FMT">
            <strong>FMT</strong> remplace le FPMT et la ROSP. Exemple pédagogique : patient âgé en ALD jusqu’à
            <strong>100&nbsp;€/an</strong> ; au-delà de <strong>2 ans</strong> sans visite, le forfait peut tomber à
            <strong>${FMT_FLOOR_NOT_SEEN_EUR}&nbsp;€</strong> (manque à gagner illustratif <strong>95&nbsp;€</strong>).
            Prévention : environ <strong>${EUR_PREVENTION_PER_GAP}&nbsp;€</strong> par indicateur manquant (éligible).
          </section>
          <div class="fmt-kpis" id="fmt-kpis"></div>
          <section class="fmt-donum" aria-labelledby="fmt-donum-title">
            <div>
              <h2 id="fmt-donum-title">Dotation numérique (DONUM)</h2>
              <p>Ex-forfait structure : logiciels compatibles Ségur et téléexpertise — potentiel jusqu’à <strong>2&nbsp;940&nbsp;€/an</strong> selon usage (indicatif).</p>
            </div>
          </section>
        </div>
      </div>

      <div class="fmt-toolbar">
        <label>
          Filtre
          <select class="fmt-select" id="fmt-filter" aria-label="Filtre liste"></select>
        </label>
        <button type="button" class="fmt-btn fmt-btn-primary" id="fmt-reminder" disabled>Générer rappel patient</button>
      </div>

      <div class="fmt-table-wrap">
        <table class="fmt-table" id="fmt-table">
          <thead id="fmt-thead"></thead>
          <tbody id="fmt-tbody"></tbody>
        </table>
      </div>

      <p class="fmt-footnote" id="fmt-footnote"></p>
    </div>
  `

  const kpisEl = root.querySelector('#fmt-kpis')
  const financialPanel = root.querySelector('#fmt-financial-panel')
  const financialToggle = root.querySelector('#fmt-financial-toggle')
  const thead = root.querySelector('#fmt-thead')
  const tbody = root.querySelector('#fmt-tbody')
  const filterEl = root.querySelector('#fmt-filter')
  const reminderBtn = root.querySelector('#fmt-reminder')
  const footnoteEl = root.querySelector('#fmt-footnote')

  financialToggle.addEventListener('click', () => {
    showFinancials = !showFinancials
    if (!showFinancials && filterId === 'perte50') {
      filterId = 'all'
    }
    render()
  })

  filterEl.addEventListener('change', () => {
    filterId = filterEl.value
    render()
  })

  reminderBtn.addEventListener('click', async () => {
    const list = MOCK_PATIENTS.map((p) => enrichPatient(p))
    const p = list.find((x) => x.id === selectedId)
    if (!p) return
    const { body } = reminderText(p)
    try {
      await navigator.clipboard.writeText(body)
      showToast('Texte copié dans le presse-papiers')
    } catch {
      showToast('Copie impossible (HTTPS ou permission) — ouvrez la console ou contactez l’admin')
      console.info('Rappel patient\n\n', body)
    }
  })

  function render() {
    financialPanel.hidden = !showFinancials
    financialToggle.setAttribute('aria-expanded', String(showFinancials))
    financialToggle.textContent = showFinancials
      ? 'Masquer les indicateurs financiers'
      : 'Afficher les indicateurs financiers (montants indicatifs)'

    const opts = buildFilterOptions(showFinancials)
    if (!opts.some((o) => o.value === filterId)) {
      filterId = 'all'
    }
    filterEl.replaceChildren()
    for (const o of opts) {
      const opt = document.createElement('option')
      opt.value = o.value
      opt.textContent = o.label
      filterEl.append(opt)
    }
    filterEl.value = filterId

    const enriched = MOCK_PATIENTS.map((p) => enrichPatient(p))
    const filtered = applyFilter(enriched, filterId)
    const kpis = aggregateKpis(enriched, cabinet)

    kpisEl.innerHTML = `
      <article class="fmt-kpi fmt-kpi--loss">
        <div class="fmt-kpi-label">Pertes sèches (non vus &gt; 2 ans)</div>
        <div class="fmt-kpi-value">${formatEur(kpis.pertesSeches)}</div>
        <div class="fmt-kpi-sub">Somme (forfait plein − ${FMT_FLOOR_NOT_SEEN_EUR}&nbsp;€) sur les dossiers éligibles</div>
      </article>
      <article class="fmt-kpi fmt-kpi--prev">
        <div class="fmt-kpi-label">Gains potentiels prévention</div>
        <div class="fmt-kpi-value">${formatEur(kpis.preventionPotentiel)}</div>
        <div class="fmt-kpi-sub">≈ ${EUR_PREVENTION_PER_GAP}&nbsp;€ × indicateurs manquants (éligibles)</div>
      </article>
      <article class="fmt-kpi fmt-kpi--maj">
        <div class="fmt-kpi-label">Majorations ZIP / C2S actives</div>
        <div class="fmt-kpi-value">${kpis.countC2S}<span style="font-size:0.9rem;font-weight:600;margin-left:0.25rem">C2S</span></div>
        <div class="fmt-kpi-sub">${kpis.majorationsLabel}</div>
      </article>
    `

    const thEur = showFinancials ? '<th>Manque à gagner</th>' : ''
    thead.innerHTML = `
      <tr>
        <th>Patient</th>
        <th>Profil</th>
        <th>Dernière visite</th>
        <th>Statut</th>
        <th>Indicateurs manquants</th>
        ${thEur}
      </tr>
    `

    footnoteEl.textContent = showFinancials
      ? 'Données de démonstration. Les montants et règles d’éligibilité doivent être validés avec les textes officiels et votre caisse. Intégration agenda / dossier : à brancher sur votre back (ex. export JSON Go).'
      : 'Données de démonstration. Intégration agenda / dossier : à brancher sur votre back (ex. export JSON Go).'

    tbody.replaceChildren()
    for (const p of filtered) {
      const tr = document.createElement('tr')
      tr.dataset.id = p.id
      tr.dataset.selected = String(p.id === selectedId)
      const pill = visitPill(p)
      const eurCell = showFinancials ? `<td class="fmt-eur">${formatEur(p._total)}</td>` : ''

      tr.innerHTML = `
        <td>
          <strong>${p.prenom} ${p.nom}</strong><br />
          <span style="color:var(--muted);font-size:0.72rem">${p.id}</span>
        </td>
        <td>
          ${p.age} ans · ${p.sexe === 'F' ? 'F' : 'M'}
          ${p.ald ? ' · <strong>ALD</strong>' : ''}
          ${p.c2s ? ' · <strong>C2S</strong>' : ''}
          ${p.diabetique ? ' · <strong>Diabète</strong>' : ''}
        </td>
        <td>${formatDate(p.derniereVisite)}</td>
        <td><span class="${pill.className}">${pill.text}</span></td>
        <td class="fmt-badges-cell"></td>
        ${eurCell}
      `

      const badgesCell = tr.querySelector('.fmt-badges-cell')
      const wrap = document.createElement('div')
      wrap.className = 'fmt-badges'
      if (p._manquants.length === 0) {
        const s = document.createElement('span')
        s.style.color = 'var(--muted)'
        s.style.fontSize = '0.75rem'
        s.textContent = '—'
        wrap.append(s)
      } else {
        for (const key of p._manquants) {
          const b = document.createElement('span')
          b.className = 'fmt-badge'
          b.textContent = INDICATOR_LABELS[key]
          wrap.append(b)
        }
      }
      badgesCell.append(wrap)

      tr.addEventListener('click', () => {
        selectedId = p.id === selectedId ? null : p.id
        render()
      })

      tbody.append(tr)
    }

    reminderBtn.disabled = !selectedId
  }

  render()
}
