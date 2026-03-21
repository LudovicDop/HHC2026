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
  return missingIndicators(patient).length * EUR_PREVENTION_PER_GAP
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
  if (patient._manquants.length) {
    lignes.push(
      '',
      `Actions suggérées : ${patient._manquants.map((k) => INDICATOR_LABELS[k]).join(', ')}.`,
    )
  }
  lignes.push('', 'Cordialement,', 'Cabinet')
  return { title: `Rappel — ${nom}`, body: lignes.join('\n') }
}
