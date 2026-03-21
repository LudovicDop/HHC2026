import { useEffect, useMemo, useState } from 'react'

/*
 * TODO LUDO — Intégration API FastAPI
 * Brancher ici un useEffect (dépendances : patient.id, token/session si besoin) qui :
 *   - appelle votre backend (fetch / client généré) pour charger le dossier patient ;
 *   - met à jour `setPatient(...)` avec la réponse normalisée ;
 *   - met à jour `setRospAlerts(...)` avec la liste ROSP renvoyée par l’API ;
 *   - pilote `setLoading(true/false)` autour des requêtes et gère les erreurs (toast / état d’erreur).
 * Les messages `chrome.runtime.onMessage` (PATIENT_DETECTED) peuvent déclencher le même fetch
 * lorsque l’ID change depuis le LGC.
 */

const KNOWN_FROM_PAGE = {
  'PAT-004': { id: 'PAT-004', nom: 'MARTIN Marie', age: 52, sexe: 'F' },
  'PAT-005': { id: 'PAT-005', nom: 'DUPONT Jean', age: 65, sexe: 'M' },
}

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

export default function App() {
  const [loading, setLoading] = useState(false)
  const [patient, setPatient] = useState({
    id: 'PAT-004',
    nom: 'MARTIN Marie',
    age: 52,
    sexe: 'F',
  })
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

  useEffect(() => {
    // TODO LUDO: remplacer cet effet par fetch FastAPI (patient + rospAlerts) ; les setters restent les points d’entrée.
  }, [setLoading, setRospAlerts])

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
        className="min-h-screen bg-slate-50 text-slate-900 antialiased"
        style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
      >
        {!isExtensionContext && (
          <div
            className="border-b border-amber-200/90 bg-amber-50 px-4 py-2 text-center text-[11px] text-amber-950"
            role="status"
          >
            Prévisualisation :{' '}
            <code className="rounded bg-white/90 px-1 py-0.5 font-mono text-[10px]">npm run dev</code>{' '}
            — panneau réel via l’icône d’extension Chrome.
          </div>
        )}

        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
          <header className="border-b border-slate-200/80 bg-slate-50 px-5 pb-6 pt-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-[1.65rem] font-bold leading-none tracking-tight text-slate-900">
                  BioTrack
                </h1>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Prévention · dossier · conformité CPAM
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-indigo-200/80 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-800">
                Analyse IA active
              </span>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-5 px-5 pb-28 pt-5">
            <section
              className={`rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 ${
                loading ? 'opacity-60' : 'opacity-100 hover:border-slate-300/90'
              }`}
              aria-busy={loading}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient actif
                </h2>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                  {patient.id}
                </span>
              </div>
              <p className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{patient.nom}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span>{patient.age} ans</span>
                <span className="text-slate-300">·</span>
                <span>Sexe {patient.sexe}</span>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Antécédents (résumé)
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{antecedentsResume}</p>
              </div>
            </section>

            <div className="flex-1">
              {rospAlerts.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions de Prévention Requises (ROSP)
                  </h2>
                  <ul className="space-y-3">
                    {rospAlerts.map((alert, index) => (
                      <li
                        key={alert.id}
                        className="animate-fade-in rounded-xl border border-rose-100 bg-white py-4 pl-4 pr-4 shadow-sm transition-all duration-300 hover:border-rose-200/80 hover:shadow-[0_2px_12px_rgba(225,29,72,0.06)] opacity-0"
                        style={{ animationDelay: `${80 + index * 70}ms` }}
                      >
                        <div className="border-l-4 border-rose-500 pl-4">
                          <p className="text-sm font-semibold text-slate-900">{alert.titre}</p>
                          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{alert.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  className="animate-fade-in rounded-2xl border border-teal-100 bg-teal-50 px-5 py-10 text-center opacity-0 [animation-delay:80ms]"
                  role="status"
                >
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-teal-200/80 bg-white text-teal-600"
                    aria-hidden
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="mt-5 text-sm font-semibold text-teal-800">
                    Dossier à jour. Aucune action de prévention ROSP prioritaire détectée.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-teal-700/90">
                    Les contrôles automatiques ne signalent pas d’écart urgent sur les indicateurs suivis.
                  </p>
                </div>
              )}
            </div>
          </main>

          <div className="sticky bottom-0 border-t border-slate-200/90 bg-slate-50/95 px-5 py-4 backdrop-blur-sm">
            <button
              type="button"
              className="w-full rounded-xl bg-slate-800 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 active:scale-[0.99]"
            >
              Générer le rapport CPAM
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
