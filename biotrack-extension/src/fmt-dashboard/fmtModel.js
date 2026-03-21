/** Montants pédagogiques — à ajuster selon la convention. */
export const EUR_PREVENTION_PER_GAP = 5
export const MONTHS_VISIT_WARNING = 18
export const MONTHS_VISIT_FORFAIT_LOSS = 24
export const FMT_FLOOR_NOT_SEEN_EUR = 5

export const INDICATOR_KEYS = [
  'grippe',
  'covid',
  'pneumocoque',
  'colorectal',
  'mammographie',
  'colUterus',
  'hba1c',
  'm9',
  'm24',
  'buccoDentaire',
]

/** Indicateurs part variable ciblés par le dashboard et le panneau latéral (hors puériculture / bucco). */
export const PART_VARIABLE_KEYS = [
  'grippe',
  'covid',
  'pneumocoque',
  'colorectal',
  'mammographie',
  'colUterus',
  'hba1c',
]

/** Trois familles affichées dans le tableau principal du dashboard. */
export const PART_VARIABLE_CATEGORIES = [
  {
    id: 'vaccination',
    title: 'Vaccination',
    subtitle: 'Grippe · COVID · Pneumocoque',
    populationCible: '≥ 65 ans ou ALD',
    keys: ['grippe', 'covid', 'pneumocoque'],
  },
  {
    id: 'depistage',
    title: 'Dépistage',
    subtitle: 'Colorectal · Sein · Col de l’utérus',
    populationCible: 'Colorectal 50–74 ans ; sein / col utérus : femmes 25–65 ans',
    keys: ['colorectal', 'mammographie', 'colUterus'],
  },
  {
    id: 'suiviChronique',
    title: 'Suivi chronique',
    subtitle: 'HbA1c (tous les 6 mois)',
    populationCible: 'Patients diabétiques',
    keys: ['hba1c'],
  },
]

export const INDICATOR_LABELS = {
  grippe: 'Grippe',
  covid: 'COVID',
  pneumocoque: 'Pneumocoque',
  colorectal: 'Colorectal',
  mammographie: 'Mammographie',
  colUterus: 'Col utérus',
  hba1c: 'HbA1c',
  m9: 'M9',
  m24: 'M24',
  buccoDentaire: 'Bucco-dentaire',
}

export function monthsSince(isoDate) {
  if (!isoDate) return Infinity
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return Infinity
  const now = new Date()
  let months = (now.getFullYear() - d.getFullYear()) * 12
  months += now.getMonth() - d.getMonth()
  if (now.getDate() < d.getDate()) months -= 1
  return Math.max(0, months)
}

/** Forfait annuel « plein » illustratif avant chute 2 ans. */
export function fullForfaitEuros(patient) {
  if (patient.age >= 65 && patient.ald) return 100
  if (patient.age >= 65) return 70
  return 50
}

export function indicatorEligible(key, patient) {
  const { age, sexe, ald, diabetique } = patient
  switch (key) {
    case 'grippe':
    case 'covid':
    case 'pneumocoque':
      return age >= 65 || ald
    case 'colorectal':
      return age >= 50 && age <= 74
    case 'mammographie':
    case 'colUterus':
      return sexe === 'F' && age >= 25 && age <= 65
    case 'hba1c':
      return Boolean(diabetique)
    case 'm9':
    case 'm24':
      return age < 2
    case 'buccoDentaire':
      return age >= 3 && age <= 24
    default:
      return false
  }
}

export function missingIndicators(patient) {
  const done = patient.indicateursFaits ?? {}
  return INDICATOR_KEYS.filter(
    (key) => indicatorEligible(key, patient) && !done[key],
  )
}

export function missingPartVariableIndicators(patient) {
  const done = patient.indicateursFaits ?? {}
  return PART_VARIABLE_KEYS.filter(
    (key) => indicatorEligible(key, patient) && !done[key],
  )
}

/** Au moins un indicateur FMT « part variable » applicable (population cible). */
export function patientEligiblePrevention(patient) {
  return INDICATOR_KEYS.some((key) => indicatorEligible(key, patient))
}

/** Éligible à au moins un des indicateurs part variable du périmètre ROSP/FMT affiché. */
export function patientEligiblePartVariable(patient) {
  return PART_VARIABLE_KEYS.some((key) => indicatorEligible(key, patient))
}

/** Effectif liste — chiffres démo jusqu’au branchement back Go. */
export function patientsTotal(list) {
  return list.length
}

/**
 * Entonnoir : total, éligibles prévention, éligibles avec au moins un manquant.
 * Données brutes (non enrichies).
 */
export function funnelStats(list) {
  let eligiblePrevention = 0
  let withAnyGap = 0
  for (const p of list) {
    if (patientEligiblePartVariable(p)) {
      eligiblePrevention += 1
      if (missingPartVariableIndicators(p).length > 0) withAnyGap += 1
    }
  }
  return {
    total: list.length,
    eligiblePrevention,
    withAnyGap,
  }
}

/** Agrégats pour une famille (vaccination, dépistage, suivi chronique). */
export function statsPerCategory(list, keys) {
  let eligibleCount = 0
  let missingCount = 0
  for (const p of list) {
    const eligibleAny = keys.some((k) => indicatorEligible(k, p))
    if (!eligibleAny) continue
    eligibleCount += 1
    const hasGap = keys.some(
      (k) => indicatorEligible(k, p) && !(p.indicateursFaits ?? {})[k],
    )
    if (hasGap) missingCount += 1
  }
  return { eligibleCount, missingCount }
}

/** Une ligne par critère : éligibles vs manquants (sans montants). */
export function statsPerCriterion(list) {
  return INDICATOR_KEYS.map((key) => {
    let eligibleCount = 0
    let missingCount = 0
    for (const p of list) {
      if (!indicatorEligible(key, p)) continue
      eligibleCount += 1
      const done = p.indicateursFaits ?? {}
      if (!done[key]) missingCount += 1
    }
    return {
      key,
      label: INDICATOR_LABELS[key],
      eligibleCount,
      missingCount,
    }
  })
}

export function visitWarning(months) {
  if (!Number.isFinite(months)) return 'none'
  if (months >= MONTHS_VISIT_FORFAIT_LOSS) return 'loss'
  if (months >= MONTHS_VISIT_WARNING) return 'warn'
  return 'ok'
}

export function dryLossEuros(patient) {
  const m = monthsSince(patient.derniereVisite)
  if (m < MONTHS_VISIT_FORFAIT_LOSS) return 0
  const full = fullForfaitEuros(patient)
  return Math.max(0, full - FMT_FLOOR_NOT_SEEN_EUR)
}

export function preventionPotentialEuros(patient) {
  return missingPartVariableIndicators(patient).length * EUR_PREVENTION_PER_GAP
}

export function totalManqueAGagnerEuros(patient) {
  return dryLossEuros(patient) + preventionPotentialEuros(patient)
}

export function enrichPatient(patient) {
  const mois = monthsSince(patient.derniereVisite)
  return {
    ...patient,
    _moisDepuisVisite: mois,
    _alerteVisite: visitWarning(mois),
    _manquants: missingIndicators(patient),
    _manquantsPV: missingPartVariableIndicators(patient),
    _perteSeche: dryLossEuros(patient),
    _preventionPotentiel: preventionPotentialEuros(patient),
    _total: totalManqueAGagnerEuros(patient),
  }
}

export function aggregateKpis(patientsEnriched, cabinet) {
  let pertesSeches = 0
  let preventionPotentiel = 0
  let countC2S = 0
  for (const p of patientsEnriched) {
    pertesSeches += p._perteSeche
    preventionPotentiel += p._preventionPotentiel
    if (p.c2s) countC2S += 1
  }
  const zipActif = Boolean(cabinet?.jeuneInstalleZip)
  const majorationsLabel = `${countC2S} patient${countC2S > 1 ? 's' : ''} C2S · ZIP ${zipActif ? 'actif' : 'inactif'}`
  return { pertesSeches, preventionPotentiel, countC2S, zipActif, majorationsLabel }
}

export function reminderText(patient) {
  const nom = `${patient.prenom} ${patient.nom}`.trim()
  const lignes = [
    `Bonjour ${patient.prenom},`,
    '',
    'Votre médecin traitant vous invite à prendre rendez-vous pour un suivi de prévention et le maintien de votre forfait médecin traitant.',
  ]
  if (patient._alerteVisite === 'loss') {
    lignes.push('', 'Votre dernière consultation remonte à plus de 24 mois : un passage au cabinet est important pour votre suivi.')
  } else if (patient._alerteVisite === 'warn') {
    lignes.push('', 'Votre dernière consultation approche les 2 ans : pensez à programmer une visite.')
  }
  const gaps = patient._manquantsPV ?? missingPartVariableIndicators(patient)
  if (gaps.length) {
    lignes.push(
      '',
      `Actions suggérées : ${gaps.map((k) => INDICATOR_LABELS[k]).join(', ')}.`,
    )
  }
  lignes.push('', 'Cordialement,', 'Cabinet')
  return { title: `Rappel — ${nom}`, body: lignes.join('\n') }
}
