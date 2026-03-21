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
  indicatorIsDone,
  INDICATOR_LABELS,
  MONTHS_VISIT_FORFAIT_LOSS,
  MONTHS_VISIT_WARNING,
  PART_VARIABLE_CATEGORIES,
  statsPerCategory,
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
  return v.some((k) => indicatorEligible(k, p) && !indicatorIsDone(p, k))
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

function buildFilterOptions(showFinancials, expandedCategoryId) {
  const opts = [{ value: 'all', label: 'Tous les patients' }]
  if (showFinancials) {
    opts.push({ value: 'perte50', label: 'Priorité : perte > 50 €' })
  }
  if (expandedCategoryId === 'vaccination') {
    opts.push({ value: 'vaccin', label: 'Action : à vacciner (Grippe / COVID / Pneumo)' })
  }
  return opts
}

export function initFmtDashboard(root) {
  let selectedId = null
  let filterId = 'all'
  let showFinancials = false
  /** @type {string | null} */
  let expandedCategoryId = null
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
      <section class="fmt-pv-intro" aria-labelledby="fmt-pv-title">
        <h2 id="fmt-pv-title">ROSP / indicateurs de prévention du FMT</h2>
        <p class="fmt-pv-intro__lead">
          Depuis le 1<sup>er</sup> janvier 2026, la convention fusionne l’historique ROSP et le forfait patientèle dans le <strong>Forfait Médecin Traitant (FMT)</strong>.
          La <strong>part variable</strong> rémunère chaque indicateur de prévention validé : <strong>${EUR_PREVENTION_PER_GAP}&nbsp;€ par patient et par indicateur</strong>, <strong>sans plafond</strong> (données de démonstration).
        </p>
        <ul class="fmt-pv-intro__grid">
          <li class="fmt-pv-pillar">
            <p class="fmt-pv-pillar__title">Vaccination</p>
            <p class="fmt-pv-pillar__indic">Grippe · COVID · Pneumocoque · ROR · Méningocoque C · HPV</p>
            <p class="fmt-pv-pillar__pop">Populations cibles selon tranches d’âge et facteurs de risque (voir tableau par catégorie).</p>
          </li>
          <li class="fmt-pv-pillar">
            <p class="fmt-pv-pillar__title">Dépistage</p>
            <p class="fmt-pv-pillar__indic">Sein · Col utérus · Colorectal · Glycémie (MCVA) · MRC</p>
            <p class="fmt-pv-pillar__pop">Dépistages organisés et bilans ciblés (âge, sexe, comorbidités).</p>
          </li>
          <li class="fmt-pv-pillar">
            <p class="fmt-pv-pillar__title">Suivi chronique &amp; enfance</p>
            <p class="fmt-pv-pillar__indic">HbA1c · M9 · M24 · Bucco-dentaire</p>
            <p class="fmt-pv-pillar__pop">Diabète, consultations obligatoires de l’enfant, suivi dentaire 3–24 ans.</p>
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
          <p class="fmt-funnel-card__label">Éligibles ROSP / FMT</p>
          <p class="fmt-funnel-card__value">${funnel.eligiblePrevention}</p>
          <p class="fmt-funnel-card__hint">Au moins un indicateur de prévention (part variable) applicable</p>
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
          <p>Suivi des <strong>indicateurs de prévention du FMT</strong> (ex-ROSP) par grande famille. Ouvrez une ligne pour les patients éligibles et les manquants. Les montants indicatifs (${EUR_PREVENTION_PER_GAP}&nbsp;€ / indicateur validé, sans plafond) sont affichés sur demande.</p>
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
            <strong>FMT 2026</strong> : fusion ROSP + forfait patientèle. Part fixe illustrée : patient âgé en ALD jusqu’à
            <strong>100&nbsp;€/an</strong> ; au-delà de <strong>2 ans</strong> sans visite, le forfait peut tomber à
            <strong>${FMT_FLOOR_NOT_SEEN_EUR}&nbsp;€</strong> (manque à gagner illustratif <strong>95&nbsp;€</strong>).
            <strong>Part variable prévention</strong> : <strong>${EUR_PREVENTION_PER_GAP}&nbsp;€</strong> par patient et par indicateur ROSP/FMT <strong>validé</strong>, <strong>sans plafond</strong> — chaque manquant éligible représente le même montant potentiel à récupérer (démo).
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
      </div>

      <section class="fmt-criteria-section" aria-labelledby="fmt-criteria-title">
        <h2 id="fmt-criteria-title" class="fmt-criteria-section__title">Tableau par catégorie</h2>
        <p class="fmt-criteria-hint">
          Cliquez sur une catégorie pour afficher les patients concernés et les indicateurs part variable manquants dans cette famille.
          Le filtre « à vacciner » n’apparaît que lorsque la catégorie Vaccination est ouverte.
        </p>
        <div class="fmt-table-wrap">
          <table class="fmt-table-criteria" id="fmt-table-criteria">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Patients éligibles</th>
                <th>Avec au moins un manquant</th>
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

  root.addEventListener('click', (e) => {
    const btn = e.target.closest?.('[data-dossier-id]')
    if (!btn) return
    e.preventDefault()
    e.stopPropagation()
    const id = btn.getAttribute('data-dossier-id')
    if (id) void openDossier(id)
  })

  /** Tableau unique : suivi + synthèse médicale (une ligne par patient). */
  function buildUnifiedPatientTable(theadEl, tbodyEl, patients, showEur, categoryKeys) {
    const thEur = showEur ? '<th>Manque à gagner</th>' : ''
    theadEl.innerHTML = `
      <tr>
        <th>Indicateurs</th>
        <th>Statut</th>
        <th>Profil</th>
        <th>Synthèse</th>
        <th>Points d’attention</th>
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

      const manquantsCat =
        categoryKeys?.length > 0
          ? p._manquantsPV.filter((k) => categoryKeys.includes(k))
          : p._manquantsPV
      const badgesHtml =
        manquantsCat.length === 0
          ? '<span style="color:var(--muted)">À jour (cette catégorie)</span>'
          : manquantsCat
              .map((k) => `<span class="fmt-badge">${INDICATOR_LABELS[k]}</span>`)
              .join(' ')

      const tdInd = document.createElement('td')
      tdInd.innerHTML = `<div class="fmt-badges" style="gap:0.4rem">${badgesHtml}</div>`

      const tdStat = document.createElement('td')
      const pillSpan = document.createElement('span')
      pillSpan.className = pill.className
      pillSpan.textContent = pill.text
      tdStat.append(pillSpan)

      const tdProf = document.createElement('td')
      tdProf.className = 'fmt-profil-cell'
      tdProf.innerHTML = `
        <strong>${p.prenom} ${p.nom}</strong>
        <span class="fmt-profil-meta">${p.id} · ${formatDate(p.derniereVisite)}</span>
        <span class="fmt-profil-meta">${p.age} ans · ${p.sexe === 'F' ? 'F' : 'M'}${p.ald ? ' · ALD' : ''}${p.c2s ? ' · C2S' : ''}${p.diabetique ? ' · Diabète' : ''}</span>
      `

      const tdSyn = document.createElement('td')
      tdSyn.className = 'fmt-medical-note'
      tdSyn.textContent = p.syntheseMedicale ?? '—'

      const tdPts = document.createElement('td')
      tdPts.className = 'fmt-medical-sub'
      tdPts.textContent = p.pointsAttention ?? '—'

      tr.append(tdInd, tdStat, tdProf, tdSyn, tdPts)

      if (showEur) {
        const tdEur = document.createElement('td')
        tdEur.className = 'fmt-eur'
        tdEur.textContent = formatEur(p._total)
        tr.append(tdEur)
      } else {
        const tdEur = document.createElement('td')
        tdEur.className = 'fmt-eur'
        tdEur.style.color = 'var(--muted)'
        tdEur.textContent = '—'
        tr.append(tdEur)
      }

      const tdDos = document.createElement('td')
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'fmt-btn fmt-btn--sm'
      btn.dataset.dossierId = p.id
      btn.textContent = 'Dossier'
      tdDos.append(btn)
      tr.append(tdDos)

      tr.addEventListener('click', (ev) => {
        if (ev.target.closest('button[data-dossier-id]')) return
        selectedId = p.id === selectedId ? null : p.id
        render()
      })

      tbodyEl.append(tr)
    }
  }

  function renderCriteriaTable() {
    const enrichedAll = MOCK_PATIENTS.map((p) => enrichPatient(p))

    tbodyCriteria.replaceChildren()

    for (const cat of PART_VARIABLE_CATEGORIES) {
      const row = statsPerCategory(MOCK_PATIENTS, cat.keys)
      const isOpen = expandedCategoryId === cat.id

      const trMaster = document.createElement('tr')
      trMaster.className = `fmt-crit-master${isOpen ? ' fmt-crit-master--open' : ''}`
      trMaster.dataset.categoryId = cat.id
      trMaster.setAttribute('role', 'button')
      trMaster.tabIndex = 0
      trMaster.setAttribute('aria-expanded', String(isOpen))
      trMaster.innerHTML = `
        <td>
          <span class="fmt-crit-chevron" aria-hidden="true">${isOpen ? '▼' : '▶'}</span>
          <div class="fmt-cat-cell">
            <strong>${cat.title}</strong>
            <span class="fmt-cat-cell__sub">${cat.subtitle}</span>
            <span class="fmt-cat-cell__population">${cat.populationCible}</span>
          </div>
        </td>
        <td>${row.eligibleCount}</td>
        <td>${row.missingCount}</td>
      `

      const activate = () => {
        const next = expandedCategoryId === cat.id ? null : cat.id
        if (next !== expandedCategoryId) selectedId = null
        expandedCategoryId = next
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
        const pool = enrichedAll.filter((p) => cat.keys.some((k) => indicatorEligible(k, p)))
        const filtered = applyFilter(pool, filterId)

        const inner = document.createElement('div')
        inner.className = 'fmt-crit-panel-inner'

        const suiviWrap = document.createElement('div')
        const hSuivi = document.createElement('h3')
        hSuivi.className = 'fmt-subsection-title'
        hSuivi.textContent = `Suivi patients — ${cat.title}`
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

        buildUnifiedPatientTable(theadSuivi, tbodySuivi, filtered, showFinancials, cat.keys)

        inner.append(suiviWrap)
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

    const opts = buildFilterOptions(showFinancials, expandedCategoryId)
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
        <div class="fmt-kpi-sub">≈ ${EUR_PREVENTION_PER_GAP}&nbsp;€ × indicateurs manquants (éligibles), sans plafond national sur la part variable</div>
      </article>
      <article class="fmt-kpi fmt-kpi--maj">
        <div class="fmt-kpi-label">Majorations ZIP / C2S actives</div>
        <div class="fmt-kpi-value">${kpis.countC2S}<span style="font-size:0.9rem;font-weight:600;margin-left:0.25rem">C2S</span></div>
        <div class="fmt-kpi-sub">${kpis.majorationsLabel}</div>
      </article>
    `

    footnoteEl.textContent = showFinancials
      ? 'Données de démonstration. ROSP / FMT : valider montants et périmètres avec les textes officiels et votre caisse. Rappel : 5 € par indicateur validé sans plafond est un ordre de grandeur pédagogique ici. Intégration dossier : à brancher sur votre back (ex. export JSON Go).'
      : 'Données de démonstration. Intégration agenda / dossier : à brancher sur votre back (ex. export JSON Go).'

    renderCriteriaTable()
  }

  render()
}
