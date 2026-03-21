/**
 * Modèle FMT 2026 — ROSP / indicateurs de prévention (part variable).
 * Règles d’éligibilité simplifiées pour prototype (âge, flags mock) ; affinage possible via API.
 */

/** Âge en mois si renseigné ; sinon approximation âge × 12 si ≥ 6 ans ; sinon null (indicateurs mois-only = non éligible). */
export function monthsOfAge(patient) {
  if (Number.isFinite(patient.ageMois)) return patient.ageMois
  if (!Number.isFinite(patient.age)) return null
  if (patient.age >= 6) return patient.age * 12
  return null
}

export function indicatorIsDone(patient, key) {
  const d = patient.indicateursFaits ?? {}
  if (key === 'sein') return Boolean(d.sein ?? d.mammographie)
  return Boolean(d[key])
}

export const INDICATOR_KEYS = [
  'grippe',
  'covid',
  'pneumocoque',
  'ror',
  'meningocoqueC',
  'hpv',
  'sein',
  'colUterus',
  'colorectal',
  'glycemieJeun',
  'mrc',
  'hba1c',
  'm9',
  'm24',
  'buccoDentaire',
]

export const INDICATOR_LABELS = {
  grippe: 'Vaccination grippe',
  covid: 'Vaccination COVID-19',
  pneumocoque: 'Vaccination pneumocoque (VPC20)',
  ror: 'Vaccination ROR',
  meningocoqueC: 'Vaccination méningocoque C',
  hpv: 'Vaccination HPV',
  sein: 'Dépistage cancer du sein',
  colUterus: 'Dépistage cancer du col de l’utérus',
  colorectal: 'Dépistage cancer colorectal',
  glycemieJeun: 'Dépistage diabète (glycémie à jeun)',
  mrc: 'Dépistage MRC (créatinine / albuminurie)',
  hba1c: 'Suivi diabète (HbA1c ≤ 6 mois)',
  m9: 'Consultation M9 (certificat de santé)',
  m24: 'Consultation M24 (certificat de santé)',
  buccoDentaire: 'Examen bucco-dentaire annuel (3–24 ans)',
}

/** Trois piliers : dashboard + sidebar (mêmes `keys`). */
export const PART_VARIABLE_CATEGORIES = [
  {
    id: 'vaccination',
    title: 'Vaccination',
    subtitle: 'Grippe · COVID · Pneumocoque · ROR · Méningocoque C · HPV',
    populationCible:
      'Grippe / COVID : 65 ans ou + ou à risque grippe/COVID sévère (6 mois ou +). Pneumocoque : 18 ans ou + à risque. ROR 16–35 mois ; méningocoque C 5–23 mois ; HPV 11–15 ans.',
    keys: ['grippe', 'covid', 'pneumocoque', 'ror', 'meningocoqueC', 'hpv'],
    sidebarAccent: 'teal',
  },
  {
    id: 'depistage',
    title: 'Dépistage',
    subtitle: 'Sein · Col utérus · Colorectal · Glycémie (MCVA) · MRC',
    populationCible:
      'Sein : femmes 50–74 ans. Col : femmes 25–65 ans. Colorectal : 50–74 ans. Glycémie à jeun : 45 ans ou + MCVA. MRC : 18 ans ou + (MCVA / maladie de système / auto-immune).',
    keys: ['sein', 'colUterus', 'colorectal', 'glycemieJeun', 'mrc'],
    sidebarAccent: 'orange',
  },
  {
    id: 'suiviEnfance',
    title: 'Suivi chronique & enfance',
    subtitle: 'HbA1c · M9 · M24 · Bucco-dentaire',
    populationCible:
      'HbA1c : patients diabétiques. M9 : 8–21 mois. M24 : 22–37 mois. Bucco-dentaire : 3–24 ans.',
    keys: ['hba1c', 'm9', 'm24', 'buccoDentaire'],
    sidebarAccent: 'green',
  },
]

export const PART_VARIABLE_KEYS = PART_VARIABLE_CATEGORIES.flatMap((c) => c.keys)

/** Sections sidebar : `sectionId` + accent Tailwind map côté App. */
export const SIDEBAR_PART_CATEGORIES = PART_VARIABLE_CATEGORIES.map((c) => ({
  sectionId: `pv-${c.id}`,
  title: c.title,
  populationCible: c.populationCible,
  accent: c.sidebarAccent,
  keys: c.keys,
}))

export function indicatorEligible(key, patient) {
  const age = patient.age
  const sexe = patient.sexe
  const m = monthsOfAge(patient)
  const ald = Boolean(patient.ald)
  const diabetique = Boolean(patient.diabetique)
  const risqueGrippe = Boolean(patient.risqueGrippeSevere)
  const risqueCovid = Boolean(patient.risqueCovidSevere)
  const risquePneumo = Boolean(patient.risquePneumocoqueSevere)
  const mcva = Boolean(patient.mcva)

  switch (key) {
    case 'grippe':
      return age >= 65 || ald || risqueGrippe || (Number.isFinite(m) && m >= 6 && risqueGrippe)
    case 'covid':
      return age >= 65 || ald || risqueCovid || (Number.isFinite(m) && m >= 6 && risqueCovid)
    case 'pneumocoque':
      return age >= 18 && (risquePneumo || ald)
    case 'ror':
      return Number.isFinite(m) && m >= 16 && m < 36
    case 'meningocoqueC':
      return Number.isFinite(m) && m >= 5 && m < 24
    case 'hpv':
      return sexe === 'F' && age >= 11 && age < 16
    case 'sein':
      return sexe === 'F' && age >= 50 && age <= 74
    case 'colUterus':
      return sexe === 'F' && age >= 25 && age <= 65
    case 'colorectal':
      return age >= 50 && age <= 74
    case 'glycemieJeun':
      return age >= 45 && mcva
    case 'mrc':
      return age >= 18 && (mcva || Boolean(patient.maladieSysteme) || Boolean(patient.maladieAutoimmune))
    case 'hba1c':
      return diabetique
    case 'm9':
      return Number.isFinite(m) && m >= 8 && m < 22
    case 'm24':
      return Number.isFinite(m) && m >= 22 && m < 38
    case 'buccoDentaire':
      return age >= 3 && age <= 24
    default:
      return false
  }
}

/** Ouvre la section sidebar s’il existe au moins un indicateur éligible non réalisé. */
export function categoryHasEligibleMissing(keys, patient) {
  return keys.some((k) => indicatorEligible(k, patient) && !indicatorIsDone(patient, k))
}
