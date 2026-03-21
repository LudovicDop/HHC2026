import { useEffect, useMemo, useState } from 'react'

const KNOWN_FROM_PAGE = {
  'PAT-004': { id: 'PAT-004', nom: 'MARTIN Marie', age: 52, sexe: 'F' },
  'PAT-005': { id: 'PAT-005', nom: 'DUPONT Jean', age: 65, sexe: 'M' },
}

const INITIAL_MEDICAL_ALERTS = [
  {
    id: 'med-1',
    titre: 'Rappel vaccinal — Tétanos / Polio',
    detail: 'Dernière dose documentée en 2014. Proposer une mise à jour selon le calendrier vaccinal et tracer dans le dossier.',
  },
  {
    id: 'med-2',
    titre: 'NT-proBNP élevé (400 pg/mL)',
    detail: 'Valeur au-dessus du seuil habituel. Corréler au contexte clinique et envisager un adressage spécialisé si indiqué.',
  },
]

const INITIAL_QUICK_ACTIONS = [
  {
    id: 'qa-1',
    titre: 'Renouveler ordonnance (maladie chronique)',
    detail: 'Traitement au long cours stable — brouillon de renouvellement prêt à valider.',
    ctaLabel: 'Préparer',
  },
  {
    id: 'qa-2',
    titre: 'Créer courrier d’adressage cardiologue',
    detail: 'Modèle structuré avec synthèse des derniers bilans et motifs d’orientation.',
    ctaLabel: 'Créer',
  },
]

const INITIAL_ROSP_ALERTS = [
  {
    id: 'rosp-1',
    titre: 'Mammographie de dépistage en retard',
    detail: 'Dernier examen datant de plus de 24 mois. Proposer un créneau de rattrapage et tracer l’action dans le dossier prévention.',
  },
  {
    id: 'rosp-2',
    titre: 'Mammographie en retard (suivi ROSP)',
    detail: 'Critères régionaux ROSP non satisfaits. Vérifier éligibilité CPAM et documenter le conseil donné au patient.',
  },
]

function mapPatientFromExtension(patientId) {
  return KNOWN_FROM_PAGE[patientId] ?? null
}

const accentBar = {
  rose: 'border-l-rose-500',
  emerald: 'border-l-emerald-600',
  slate: 'border-l-slate-500',
}

function CollapsibleSection({
  sectionId,
  title,
  count,
  accent = 'slate',
  defaultOpen = true,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const showCount = typeof count === 'number' && count > 0

  return (
    <section
      className={`min-w-0 rounded-xl border border-slate-200 border-l-4 bg-white transition-all duration-300 ${accentBar[accent]}`}
      aria-labelledby={`${sectionId}-trigger`}
    >
      <button
        type="button"
        id={`${sectionId}-trigger`}
        className="flex w-full min-w-0 items-center gap-3 px-3 py-3.5 text-left transition-colors duration-300 hover:bg-slate-50/90 sm:px-4 sm:py-4"
        aria-expanded={open}
        aria-controls={`${sectionId}-panel`}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
            {title}
          </span>
          {showCount && (
            <span className="mt-1 block text-[11px] text-slate-400 sm:inline sm:mt-0 sm:ml-2">
              {count} élément{count > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ease-out ${open ? 'rotate-180' : ''}`}
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
          <div className="border-t border-slate-100 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">{children}</div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  // TODO LUDO: Intégration API — useEffect ici : fetch FastAPI quand patient.id change (ou après PATIENT_DETECTED),
  // puis setPatient, setMedicalAlerts, setQuickActions, setRospAlerts ; setLoading(true/false) + gestion erreurs.
  const [loading, setLoading] = useState(false)
  const [patient, setPatient] = useState({
    id: 'PAT-004',
    nom: 'MARTIN Marie',
    age: 52,
    sexe: 'F',
  })
  const [medicalAlerts, setMedicalAlerts] = useState(INITIAL_MEDICAL_ALERTS)
  const [quickActions, setQuickActions] = useState(INITIAL_QUICK_ACTIONS)
  const [rospAlerts, setRospAlerts] = useState(INITIAL_ROSP_ALERTS)

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

  const antecedentsResume = useMemo(
    () =>
      'HTA contrôlée · tabagisme sevré depuis 2019 · antécédent familial cancer du sein (mère). Allergies : aucune connue.',
    [],
  )

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        `}
      </style>

      <div
        className="min-h-[100dvh] min-w-0 overflow-x-hidden bg-slate-50 text-slate-900 antialiased"
        style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
      >
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

        <div className="mx-auto flex min-h-[100dvh] w-full min-w-0 max-w-full flex-col sm:max-w-lg lg:max-w-xl">
          <header className="border-b border-slate-200/80 bg-slate-50 px-4 pb-5 pt-6 sm:px-5 sm:pb-6 sm:pt-7">
            <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
              <div className="min-w-0">
                <h1 className="text-[clamp(1.45rem,4.5vw,1.75rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-slate-900">
                  BioTrack
                </h1>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Prévention · dossier · conformité CPAM
                </p>
              </div>
              <span className="inline-flex w-fit shrink-0 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                Analyse IA active
              </span>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 px-4 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] pt-4 sm:gap-5 sm:px-5 sm:pb-32 sm:pt-5">
            <CollapsibleSection
              sectionId="patient"
              title="Patient actif"
              accent="slate"
              defaultOpen
            >
              <div
                className={`space-y-4 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}
                aria-busy={loading}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{patient.nom}</p>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                    {patient.id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                  <span>{patient.age} ans</span>
                  <span className="hidden text-slate-300 sm:inline">·</span>
                  <span>Sexe {patient.sexe}</span>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Antécédents (résumé)
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{antecedentsResume}</p>
                </div>
              </div>
            </CollapsibleSection>

            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-5">
              {medicalAlerts.length > 0 && (
                <CollapsibleSection
                  sectionId="medical"
                  title="Alertes médicales"
                  count={medicalAlerts.length}
                  accent="rose"
                  defaultOpen
                >
                  <ul className="space-y-2.5 sm:space-y-3">
                    {medicalAlerts.map((alert, index) => (
                      <li
                        key={alert.id}
                        className="animate-fade-in rounded-lg border border-slate-200 border-l-[3px] border-l-rose-500 bg-slate-50/40 px-3 py-3 transition-all duration-300 hover:border-slate-300/90 hover:bg-white sm:rounded-xl sm:border-l-4 sm:px-4 sm:py-4 opacity-0"
                        style={{ animationDelay: `${80 + index * 70}ms` }}
                      >
                        <p className="text-sm font-semibold text-slate-900">{alert.titre}</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{alert.detail}</p>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              {quickActions.length > 0 && (
                <CollapsibleSection
                  sectionId="quick"
                  title="Actions rapides"
                  count={quickActions.length}
                  accent="emerald"
                  defaultOpen
                >
                  <ul className="space-y-2.5 sm:space-y-3">
                    {quickActions.map((action, index) => (
                      <li
                        key={action.id}
                        className="animate-fade-in rounded-lg border border-slate-200 border-l-[3px] border-l-emerald-600 bg-slate-50/40 px-3 py-3 transition-all duration-300 hover:border-slate-300/90 hover:bg-white sm:rounded-xl sm:border-l-4 sm:px-4 sm:py-4 opacity-0"
                        style={{
                          animationDelay: `${80 + (medicalAlerts.length + index) * 70}ms`,
                        }}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{action.titre}</p>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{action.detail}</p>
                          </div>
                          <button
                            type="button"
                            className="w-full shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-[11px] font-semibold text-white transition-all duration-300 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-2 active:scale-[0.98] sm:w-auto sm:self-start sm:py-1.5"
                            onClick={() => {
                              /* TODO LUDO: ouvrir modèle / onglet LGC / message extension */
                            }}
                          >
                            {action.ctaLabel}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              )}

              <CollapsibleSection
                sectionId="rosp"
                title="Actions de prévention requises (ROSP)"
                count={rospAlerts.length > 0 ? rospAlerts.length : undefined}
                accent="slate"
                defaultOpen
              >
                {rospAlerts.length > 0 ? (
                  <ul className="space-y-2.5 sm:space-y-3">
                    {rospAlerts.map((alert, index) => (
                      <li
                        key={alert.id}
                        className="animate-fade-in rounded-lg border border-slate-200 border-l-[3px] border-l-rose-500 bg-slate-50/40 px-3 py-3 transition-all duration-300 hover:border-slate-300/90 hover:bg-white sm:rounded-xl sm:border-l-4 sm:px-4 sm:py-4 opacity-0"
                        style={{
                          animationDelay: `${80 + (medicalAlerts.length + quickActions.length + index) * 70}ms`,
                        }}
                      >
                        <p className="text-sm font-semibold text-slate-900">{alert.titre}</p>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{alert.detail}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div
                    className="animate-fade-in rounded-xl border border-teal-100/90 bg-teal-50 px-4 py-8 text-center opacity-0 [animation-delay:80ms] transition-all duration-300 sm:rounded-2xl sm:px-5 sm:py-10"
                    role="status"
                  >
                    <div
                      className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-teal-200/70 bg-white/90 text-teal-600 transition-all duration-300 sm:h-12 sm:w-12"
                      aria-hidden
                    >
                      <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="mt-4 text-sm font-semibold leading-snug text-teal-700 sm:mt-5">
                      Dossier à jour. Aucune action de prévention ROSP prioritaire détectée.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-teal-700/85">
                      Les contrôles automatiques ne signalent pas d’écart urgent sur les indicateurs suivis.
                    </p>
                  </div>
                )}
              </CollapsibleSection>
            </div>
          </main>

          <div className="sticky bottom-0 z-10 border-t border-slate-200/90 bg-slate-50/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-50/85 sm:px-5 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              className="w-full rounded-xl bg-slate-800 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:scale-[0.99] min-h-[48px] sm:min-h-0"
            >
              Générer le rapport CPAM
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
