import { useEffect, useMemo, useState } from 'react'

/** Mocks page / message extension — même logique d’éligibilité que fmtModel (éviter import fmt-dashboard). */
const KNOWN_FROM_PAGE = {
  'PAT-004': {
    id: 'PAT-004',
    nom: 'MARTIN Marie',
    age: 52,
    sexe: 'F',
    ald: false,
    diabetique: false,
    indicateursFaits: { mammographie: true },
  },
  'PAT-005': {
    id: 'PAT-005',
    nom: 'DUPONT Jean',
    age: 65,
    sexe: 'M',
    ald: true,
    diabetique: false,
    indicateursFaits: { grippe: true, covid: true },
  },
}

const INDICATOR_LABELS = {
  grippe: 'Grippe',
  covid: 'COVID',
  pneumocoque: 'Pneumocoque',
  colorectal: 'Colorectal',
  mammographie: 'Sein (mammographie)',
  colUterus: 'Col de l’utérus',
  hba1c: 'HbA1c (≤ 6 mois)',
}

const PART_CATEGORIES = [
  {
    sectionId: 'pv-vaccination',
    title: 'Vaccination',
    populationCible: 'Population cible : ≥ 65 ans ou ALD',
    accent: 'teal',
    keys: ['grippe', 'covid', 'pneumocoque'],
  },
  {
    sectionId: 'pv-depistage',
    title: 'Dépistage',
    populationCible: 'Colorectal 50–74 ans ; sein / col utérus : femmes 25–65 ans',
    accent: 'orange',
    keys: ['colorectal', 'mammographie', 'colUterus'],
  },
  {
    sectionId: 'pv-suivi',
    title: 'Suivi chronique',
    populationCible: 'Patients diabétiques — HbA1c tous les 6 mois',
    accent: 'green',
    keys: ['hba1c'],
  },
]

function mapPatientFromExtension(patientId) {
  return KNOWN_FROM_PAGE[patientId] ?? null
}

function indicatorEligible(key, patient) {
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
    default:
      return false
  }
}

/** @returns {'ok' | 'missing' | 'na'} */
function indicatorStatus(key, patient) {
  if (!indicatorEligible(key, patient)) return 'na'
  if (patient.indicateursFaits?.[key]) return 'ok'
  return 'missing'
}

const STATUS_LABELS = {
  ok: 'À jour',
  missing: 'Manquant',
  na: 'Non concerné',
}

function StatusBadge({ status }) {
  const base =
    'inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide'
  if (status === 'ok') {
    return (
      <span
        className={`${base} border-emerald-200/90 bg-[var(--kpi-maj-bg)] text-[var(--kpi-maj)]`}
      >
        {STATUS_LABELS.ok}
      </span>
    )
  }
  if (status === 'missing') {
    return (
      <span
        className={`${base} border-red-200/90 bg-[var(--kpi-loss-bg)] text-[var(--kpi-loss)]`}
      >
        {STATUS_LABELS.missing}
      </span>
    )
  }
  return (
    <span
      className={`${base} border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_70%,var(--surface))] text-[var(--muted)]`}
    >
      {STATUS_LABELS.na}
    </span>
  )
}

const accentBar = {
  teal: 'border-l-[color:var(--accent)]',
  orange: 'border-l-[color:var(--kpi-prev)]',
  green: 'border-l-[color:var(--kpi-maj)]',
  slate: 'border-l-[color:var(--muted)]',
}

function CollapsibleSection({
  sectionId,
  title,
  subtitle,
  accent = 'slate',
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section
      className={`min-w-0 rounded-[14px] border border-[var(--border)] border-l-4 bg-[var(--surface)] shadow-[var(--shadow)] transition-all duration-300 ${accentBar[accent]}`}
      aria-labelledby={`${sectionId}-trigger`}
    >
      <button
        type="button"
        id={`${sectionId}-trigger`}
        className="flex w-full min-w-0 items-center gap-3 px-3 py-3.5 text-left transition-colors duration-300 hover:bg-[color-mix(in_srgb,var(--bg)_40%,transparent)] sm:px-4 sm:py-4"
        aria-expanded={open}
        aria-controls={`${sectionId}-panel`}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] sm:text-xs">
            {title}
          </span>
          {subtitle ? (
            <span className="mt-1 block text-[11px] leading-snug text-[var(--muted)] sm:text-xs">{subtitle}</span>
          ) : null}
        </div>
        <svg
          className={`h-5 w-5 shrink-0 text-[var(--muted)] transition-transform duration-300 ease-out ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="1.75"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id={`${sectionId}-panel`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-[var(--border)] px-3 pb-3 pt-2 sm:px-4 sm:pb-4">{children}</div>
        </div>
      </div>
    </section>
  )
}

function IndicatorRows({ keys, patient }) {
  return (
    <ul className="space-y-2.5">
      {keys.map((key) => {
        const status = indicatorStatus(key, patient)
        return (
          <li
            key={key}
            className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_55%,var(--surface))] px-3 py-2.5 sm:px-4 sm:py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--text)]">{INDICATOR_LABELS[key]}</p>
              {status === 'na' ? (
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
                  Hors population cible pour cet indicateur.
                </p>
              ) : null}
            </div>
            <StatusBadge status={status} />
          </li>
        )
      })}
    </ul>
  )
}

const defaultPatient = {
  id: 'PAT-004',
  nom: 'MARTIN Marie',
  age: 52,
  sexe: 'F',
  ald: false,
  diabetique: false,
  indicateursFaits: { mammographie: true },
}

export default function App() {
  // TODO LUDO: Intégration API — fetch FastAPI quand patient.id change (ou après PATIENT_DETECTED),
  // puis setPatient avec profil complet (indicateursFaits, ald, diabetique) ; gestion chargement / erreurs.
  const [patient, setPatient] = useState(defaultPatient)

  const isExtensionContext =
    typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id)

  useEffect(() => {
    if (!isExtensionContext || !chrome.runtime?.onMessage) return

    const listener = (message) => {
      if (message?.type === 'PATIENT_DETECTED' && message.patientId) {
        const next = mapPatientFromExtension(message.patientId)
        if (next) setPatient(next)
        else
          setPatient((p) => ({
            ...p,
            id: message.patientId,
          }))
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [isExtensionContext])

  const patientSummary = useMemo(
    () =>
      [
        `${patient.age} ans`,
        `Sexe ${patient.sexe}`,
        patient.ald ? 'ALD' : null,
        patient.diabetique ? 'Diabète' : null,
      ]
        .filter(Boolean)
        .join(' · '),
    [patient.age, patient.sexe, patient.ald, patient.diabetique],
  )

  return (
    <div className="min-h-[100dvh] min-w-0 overflow-x-hidden bg-[var(--bg)] text-[var(--text)] antialiased">
      {!isExtensionContext && (
        <div
          className="border-b border-amber-200/90 bg-amber-50 px-3 py-2 text-center text-[11px] text-amber-950 sm:px-4"
          role="status"
        >
          Prévisualisation :{' '}
          <code className="rounded bg-white/90 px-1 py-0.5 font-mono text-[10px]">npm run dev</code>{' '}
          — panneau réel via l’icône d’extension Chrome.
        </div>
      )}

      <div className="flex min-h-[100dvh] w-full min-w-0 max-w-full flex-col px-3 pb-6 pt-4 sm:px-4 sm:pb-8 sm:pt-5">
        <header className="border-b border-[var(--border)] bg-[var(--bg)] pb-4 sm:pb-5">
          <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
            <div className="min-w-0">
              <h1 className="text-[clamp(1.35rem,4.2vw,1.65rem)] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--text)]">
                MedTrack AI
              </h1>
              <p className="mt-1.5 text-xs font-medium text-[var(--muted)]">
                Part variable · vaccination · dépistage · suivi diabète
              </p>
            </div>
            <span className="inline-flex w-fit shrink-0 rounded-full border border-teal-200/90 bg-[var(--row-selected)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)] shadow-[var(--shadow)]">
              Analyse active
            </span>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 pt-4 sm:gap-5 sm:pt-5">
          <CollapsibleSection sectionId="patient" title="Patient actif" accent="slate" defaultOpen>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">{patient.nom}</p>
                <span className="rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_50%,var(--surface))] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--muted)]">
                  {patient.id}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)]">{patientSummary}</p>
            </div>
          </CollapsibleSection>

          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-5">
            {PART_CATEGORIES.map((cat) => (
              <CollapsibleSection
                key={cat.sectionId}
                sectionId={cat.sectionId}
                title={cat.title}
                subtitle={cat.populationCible}
                accent={cat.accent}
                defaultOpen
              >
                <IndicatorRows keys={cat.keys} patient={patient} />
              </CollapsibleSection>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
