import {
  AGENDA_DEMO,
  CABINET_DEMO,
  DOSSIER_PATIENT_BASE_URL,
  MOCK_PATIENTS,
} from './mockPatients.js'
import {
  aggregateKpis,
  enrichPatient,
  EUR_PREVENTION_PER_GAP,
  FMT_FLOOR_NOT_SEEN_EUR,
  funnelStats,
  indicatorEligible,
  INDICATOR_LABELS,
  MONTHS_VISIT_FORFAIT_LOSS,
  MONTHS_VISIT_WARNING,
  reminderText,
  statsPerCriterion,
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
    return list.filter((x) => x._total > 50)
  }
  if (filterId === 'vaccin') {
    return list.filter((x) => vaccineMissing(x))
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
  /** @type {string | null} */
  let expandedCriterionKey = null
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

  async function openDossier(patientId) {
    const base = DOSSIER_PATIENT_BASE_URL?.trim()
    if (base) {
      const url = base.endsWith('/') ? `${base}${patientId}` : `${base}/${patientId}`
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }
    try {
      await navigator.clipboard.writeText(patientId)
      showToast('ID copié — ouvrir le dossier dans le logiciel métier')
    } catch {
      showToast(`ID patient : ${patientId}`)
    }
  }

  const funnel = funnelStats(MOCK_PATIENTS)

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

      <div class="fmt-agenda-banner" role="status">
        <p class="fmt-agenda-banner__line">
          <strong>Ordre du jour (démo)</strong> : ${AGENDA_DEMO.rendezVousAujourdhui} rendez-vous prévus aujourd’hui.
        </p>
        <p class="fmt-agenda-banner__line">
          <strong>Période affichée</strong> : ${AGENDA_DEMO.periodeLibelle}
        </p>
      </div>

      <section class="fmt-funnel" aria-label="Vue d’ensemble patients">
        <article class="fmt-funnel-card">
          <p class="fmt-funnel-card__label">Patients total</p>
          <p class="fmt-funnel-card__value">${funnel.total}</p>
          <p class="fmt-funnel-card__hint">Effectif de la liste chargée</p>
        </article>
        <article class="fmt-funnel-card">
          <p class="fmt-funnel-card__label">Éligibles prévention FMT</p>
          <p class="fmt-funnel-card__value">${funnel.eligiblePrevention}</p>
          <p class="fmt-funnel-card__hint">Au moins un critère « part variable » applicable</p>
        </article>
        <article class="fmt-funnel-card">
          <p class="fmt-funnel-card__label">À traiter</p>
          <p class="fmt-funnel-card__value">${funnel.withAnyGap}</p>
          <p class="fmt-funnel-card__hint">Éligibles avec au moins un indicateur manquant</p>
        </article>
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

      <section class="fmt-criteria-section" aria-labelledby="fmt-criteria-title">
        <h2 id="fmt-criteria-title" class="fmt-criteria-section__title">Tableau par critère</h2>
        <p class="fmt-criteria-hint">
          Cliquez sur une ligne pour afficher le suivi des patients éligibles à ce critère et leurs informations médicales.
          Les filtres ci-dessus s’appliquent au panneau ouvert.
        </p>
        <div class="fmt-table-wrap">
          <table class="fmt-table-criteria" id="fmt-table-criteria">
            <thead>
              <tr>
                <th>Indicateur</th>
                <th>Patients éligibles</th>
                <th>Manquants</th>
              </tr>
            </thead>
            <tbody id="fmt-tbody-criteria"></tbody>
          </table>
        </div>
      </section>

      <p class="fmt-footnote" id="fmt-footnote"></p>
    </div>
  `

  const kpisEl = root.querySelector('#fmt-kpis')
  const financialPanel = root.querySelector('#fmt-financial-panel')
  const financialToggle = root.querySelector('#fmt-financial-toggle')
  const tbodyCriteria = root.querySelector('#fmt-tbody-criteria')
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

  root.addEventListener('click', (e) => {
    const btn = e.target.closest?.('[data-dossier-id]')
    if (!btn) return
    e.preventDefault()
    e.stopPropagation()
    const id = btn.getAttribute('data-dossier-id')
    if (id) void openDossier(id)
  })

  function buildSuiviTable(theadEl, tbodyEl, patients, showEur) {
    const thEur = showEur ? '<th>Manque à gagner</th>' : ''
    theadEl.innerHTML = `
      <tr>
        <th>Indicateurs</th>
        <th>Statut</th>
        <th>Profil</th>
        ${thEur}
        <th>Dossier</th>
      </tr>
    `
    tbodyEl.replaceChildren()
    for (const p of patients) {
      const tr = document.createElement('tr')
      tr.dataset.id = p.id
      tr.dataset.selected = String(p.id === selectedId)
      const pill = visitPill(p)
      const eurCell = showEur
        ? `<td class="fmt-eur">${formatEur(p._total)}</td>`
        : '<td class="fmt-eur" style="color:var(--muted)">—</td>'

      const badgesHtml =
        p._manquants.length === 0
          ? '<span style="color:var(--muted)">À jour</span>'
          : p._manquants
              .map(
                (k) =>
                  `<span class="fmt-badge">${INDICATOR_LABELS[k]}</span>`,
              )
              .join(' ')

      tr.innerHTML = `
        <td><div class="fmt-badges" style="gap:0.4rem">${badgesHtml}</div></td>
        <td><span class="${pill.className}">${pill.text}</span></td>
        <td class="fmt-profil-cell">
          <strong>${p.prenom} ${p.nom}</strong>
          <span class="fmt-profil-meta">${p.id} · ${formatDate(p.derniereVisite)}</span>
          <span class="fmt-profil-meta">${p.age} ans · ${p.sexe === 'F' ? 'F' : 'M'}${p.ald ? ' · ALD' : ''}${p.c2s ? ' · C2S' : ''}${p.diabetique ? ' · Diabète' : ''}</span>
        </td>
        ${eurCell}
        <td>
          <button type="button" class="fmt-btn fmt-btn--sm" data-dossier-id="${p.id}">Dossier</button>
        </td>
      `

      tr.addEventListener('click', (ev) => {
        if (ev.target.closest('[data-dossier-id]')) return
        selectedId = p.id === selectedId ? null : p.id
        render()
      })

      tbodyEl.append(tr)
    }
  }

  function buildMedicalTable(tbodyEl, patients) {
    tbodyEl.replaceChildren()
    for (const p of patients) {
      const tr = document.createElement('tr')
      const syn = p.syntheseMedicale ?? '—'
      const pts = p.pointsAttention ?? '—'
      tr.innerHTML = `
        <td class="fmt-profil-cell"><strong>${p.prenom} ${p.nom}</strong><span class="fmt-profil-meta">${p.id}</span></td>
        <td><div class="fmt-medical-note">${syn}</div></td>
        <td><div class="fmt-medical-sub">${pts}</div></td>
        <td>
          <button type="button" class="fmt-btn fmt-btn--sm" data-dossier-id="${p.id}">Dossier</button>
        </td>
      `
      tbodyEl.append(tr)
    }
  }

  function renderCriteriaTable() {
    const stats = statsPerCriterion(MOCK_PATIENTS)
    const enrichedAll = MOCK_PATIENTS.map((p) => enrichPatient(p))

    tbodyCriteria.replaceChildren()

    for (const row of stats) {
      const isOpen = expandedCriterionKey === row.key

      const trMaster = document.createElement('tr')
      trMaster.className = `fmt-crit-master${isOpen ? ' fmt-crit-master--open' : ''}`
      trMaster.dataset.criterionKey = row.key
      trMaster.setAttribute('role', 'button')
      trMaster.tabIndex = 0
      trMaster.setAttribute('aria-expanded', String(isOpen))
      trMaster.innerHTML = `
        <td>
          <span class="fmt-crit-chevron" aria-hidden="true">${isOpen ? '▼' : '▶'}</span>
          <strong>${row.label}</strong>
        </td>
        <td>${row.eligibleCount}</td>
        <td>${row.missingCount}</td>
      `

      const activate = () => {
        const next = expandedCriterionKey === row.key ? null : row.key
        if (next !== expandedCriterionKey) selectedId = null
        expandedCriterionKey = next
        render()
      }

      trMaster.addEventListener('click', activate)
      trMaster.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault()
          activate()
        }
      })

      tbodyCriteria.append(trMaster)

      const trPanel = document.createElement('tr')
      trPanel.className = 'fmt-crit-panel'
      trPanel.hidden = !isOpen

      const td = document.createElement('td')
      td.colSpan = 3
      td.className = 'fmt-crit-panel-cell'

      if (isOpen) {
        const pool = enrichedAll.filter((p) => indicatorEligible(row.key, p))
        const filtered = applyFilter(pool, filterId)

        const inner = document.createElement('div')
        inner.className = 'fmt-crit-panel-inner'

        const suiviWrap = document.createElement('div')
        const hSuivi = document.createElement('h3')
        hSuivi.className = 'fmt-subsection-title'
        hSuivi.textContent = 'Suivi patients (critère sélectionné)'
        suiviWrap.append(hSuivi)

        const twSuivi = document.createElement('div')
        twSuivi.className = 'fmt-table-wrap'
        const tblSuivi = document.createElement('table')
        tblSuivi.className = 'fmt-table fmt-table--interactive'
        const theadSuivi = document.createElement('thead')
        const tbodySuivi = document.createElement('tbody')
        tblSuivi.append(theadSuivi, tbodySuivi)
        twSuivi.append(tblSuivi)
        suiviWrap.append(twSuivi)

        buildSuiviTable(theadSuivi, tbodySuivi, filtered, showFinancials)

        const medWrap = document.createElement('div')
        const hMed = document.createElement('h3')
        hMed.className = 'fmt-subsection-title'
        hMed.textContent = 'Informations médicales précises'
        medWrap.append(hMed)

        const twMed = document.createElement('div')
        twMed.className = 'fmt-table-wrap'
        const tblMed = document.createElement('table')
        tblMed.className = 'fmt-table'
        tblMed.innerHTML = `
          <thead>
            <tr>
              <th>Patient</th>
              <th>Synthèse</th>
              <th>Points d’attention</th>
              <th>Dossier</th>
            </tr>
          </thead>
        `
        const tbodyMed = document.createElement('tbody')
        tblMed.append(tbodyMed)
        twMed.append(tblMed)
        medWrap.append(twMed)

        const rawForMed = filtered.map((p) =>
          MOCK_PATIENTS.find((x) => x.id === p.id) ?? p,
        )
        buildMedicalTable(tbodyMed, rawForMed)

        inner.append(suiviWrap, medWrap)
        td.append(inner)
      }

      trPanel.append(td)
      tbodyCriteria.append(trPanel)
    }
  }

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

    footnoteEl.textContent = showFinancials
      ? 'Données de démonstration. Les montants et règles d’éligibilité doivent être validés avec les textes officiels et votre caisse. Intégration agenda / dossier : à brancher sur votre back (ex. export JSON Go).'
      : 'Données de démonstration. Intégration agenda / dossier : à brancher sur votre back (ex. export JSON Go).'

    renderCriteriaTable()

    let panelPatients = []
    if (expandedCriterionKey) {
      const pool = enriched.filter((p) => indicatorEligible(expandedCriterionKey, p))
      panelPatients = applyFilter(pool, filterId)
    }
    const canRemind =
      Boolean(selectedId) &&
      panelPatients.some((p) => p.id === selectedId)
    reminderBtn.disabled = !canRemind
  }

  render()
}
