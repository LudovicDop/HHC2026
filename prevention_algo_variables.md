# Algorithme de prévention — Variables cliniques à surveiller

Documentation des indicateurs à extraire et surveiller par pathologie pour un système de prévention automatisé en médecine générale.

---

## Sommaire

- [Insuffisance cardiaque / Post-IDM](#insuffisance-cardiaque--post-idm)
- [Diabète type 2](#diabète-type-2)
- [Cancer du sein (suivi post-traitement)](#cancer-du-sein-suivi-post-traitement)
- [Pathologie cervicale / HPV](#pathologie-cervicale--hpv)
- [Prévention générale](#prévention-générale-tout-patient)
- [Référentiel des variables](#référentiel-des-variables)
- [Logique de priorité des alertes](#logique-de-priorité-des-alertes)
- [Structure JSON patient suggérée](#structure-json-patient-suggérée)

---

## Insuffisance cardiaque / Post-IDM

| Indicateur | Seuil d'alerte | Rythme de contrôle |
|---|---|---|
| LDL (g/L) | > 0.55 si post-IDM / > 0.70 si haut risque CV | À chaque bilan, min. annuel |
| DFG (mL/min) | < 45 → alerte, < 30 → critique | Tous les 3–6 mois selon IRC |
| Créatinine (µmol/L) | Hausse > 20% → alerte | Idem DFG |
| Kaliémie (mmol/L) | > 5.0 sous IEC/ARM | Tous les 3–6 mois |
| NTproBNP (pg/mL) | > seuil labo selon âge | Si décompensation suspectée |
| FEVG (%) | < 40% → IC systolique, suivi cardio renforcé | Échocardiographie si dégradation |
| TA systolique (mmHg) | > 130 cible recommandée | Chaque consultation |
| FC (bpm) | > 70 sous bêtabloquant → sous-dosage | Chaque consultation |
| Vaccin grippe | Absent si campagne en cours (sept–nov) | Annuel — obligatoire ALD |
| Microalbuminurie (mg/g) | > 30 → atteinte rénale débutante | Annuel |

**Médicaments déclenchant une surveillance renforcée :** IEC, ARA2, ARM (spironolactone, éplérénone), diurétiques de l'anse.

---

## Diabète type 2

| Indicateur | Seuil d'alerte | Rythme de contrôle |
|---|---|---|
| HbA1c (%) | > 7.0 standard / > 8.0 sujet âgé ou fragile | Tous les 3 mois si déséquilibré, sinon 6 mois |
| Glycémie à jeun (g/L) | > 1.26 à 2 reprises = diabète non contrôlé | À chaque bilan |
| DFG (mL/min) | < 45 → adapter Metformine / SGLT2 | Annuel minimum |
| Microalbuminurie (mg/g) | > 30 → néphropathie débutante | Annuel |
| LDL (g/L) | > 0.70 si haut risque CV associé | Annuel |
| TA (mmHg) | > 130/80 cible recommandée | Chaque consultation |
| Fond d'œil | Absence > 24 mois | Annuel si rétinopathie connue, sinon tous les 2 ans |
| Vaccin grippe | Absent si campagne en cours | Annuel — indication ALD |
| Examen podologique | Non tracé > 12 mois | Annuel |

**Médicaments à surveiller :** Metformine (adapter si DFG < 45), SGLT2 (contre-indiqués si DFG < 20), sulfamides (risque hypoglycémie).

---

## Cancer du sein (suivi post-traitement)

| Indicateur | Seuil d'alerte | Rythme de contrôle |
|---|---|---|
| Mammographie | Absence > 12 mois | Annuel (surveillance active) |
| Bilan lipidique — LDL | Non réalisé > 12 mois si inhibiteur d'aromatase | Annuel — effet pro-athérogène |
| Ostéodensitométrie (T-score) | Non réalisée > 24 mois si inhibiteur d'aromatase | Tous les 2 ans |
| Consultation gynécologique | Non tracée > 12 mois si Tamoxifène | Annuel |
| Échographie pelvienne | Non tracée > 12 mois si Tamoxifène | Annuel — risque cancer de l'endomètre |
| TSH | Non dosée > 12 mois si hypothyroïdie chimio-induite | Annuel |
| Frottis cervical | Selon âge et protocole standard | 3 ans (ou 5 ans co-test HPV) |

**Traitements déclenchant une surveillance spécifique :**
- `Tamoxifène` → gynéco + écho pelvienne annuels
- `Inhibiteur d'aromatase` (anastrozole, létrozole, exémestane) → bilan lipidique + DXA annuels
- `Dénosumab` → calcémie, vitamine D

---

## Pathologie cervicale / HPV

| Indicateur | Seuil d'alerte | Rythme de contrôle |
|---|---|---|
| Frottis cervico-utérin | Absence > 36 mois (ou 60 mois si co-test HPV négatif) | Selon résultat et âge (25–65 ans) |
| Statut HPV | HPV 16/18 → haut risque, surveillance renforcée | À chaque frottis |
| Colposcopie | Non réalisée si CIN1+ ou ASC-US + HPV HR | Dans les 6 mois après indication |
| Statut tabagique | Fumeur actif + HPV HR → risque majoré | À chaque consultation |
| Résultat anatomopathologique | CIN1, CIN2, CIN3 → escalade de prise en charge | Selon grade |

**HPV à haut risque oncogène :** 16, 18, 31, 33, 45, 52, 58.

---

## Prévention générale (tout patient)

| Indicateur | Population cible | Seuil d'alerte | Rythme |
|---|---|---|---|
| Vaccin grippe | ≥ 65 ans, ALD, obésité, BPCO, asthme, IC, DT2 | Absent si campagne en cours | Annuel (sept–nov) |
| Test immunologique fécal (FIT) | 50–74 ans sans antécédent CCR | Absent > 24 mois | Tous les 2 ans |
| Coloscopie | Antécédent personnel ou familial CCR | > 10 ans depuis dernière | Selon résultat |
| Mammographie dépistage | Femme 50–74 ans | Absence > 24 mois | Tous les 2 ans |
| Frottis cervical | Femme 25–65 ans | Absence > 36 mois | 3 ans (5 ans co-test) |
| IMC | Tout patient | > 30 → obésité, > 35 → obésité sévère | À chaque consultation |
| Tabac | Tout patient | Fumeur actif → counseling systématique | À chaque consultation |
| TA | Tout patient adulte | > 140/90 → HTA, > 130/80 si DT2/IC | À chaque consultation |

---

## Référentiel des variables

Liste complète des champs à stocker dans le modèle patient pour alimenter l'algorithme.

```json
{
  "biologie": {
    "ldl_g_l": "float",
    "hdl_g_l": "float",
    "triglycerides_g_l": "float",
    "hba1c_pourcentage": "float | null",
    "glycemie_a_jeun_g_l": "float",
    "creatinine_umol_l": "int",
    "dfg_ckd_epi_ml_min": "int",
    "kaliemie_mmol_l": "float",
    "microalbuminurie_mg_g": "float | null",
    "ntprobnp_pg_ml": "float | null",
    "tsh_miu_l": "float | null",
    "date_derniere_prise_de_sang": "date"
  },
  "examens": {
    "date_echocardiographie": "date | null",
    "fevg_pourcentage": "int | null",
    "date_fond_oeil": "date | null",
    "statut_fond_oeil": "string | null",
    "date_mammographie": "date | null",
    "date_frottis": "date | null",
    "statut_frottis": "string | null",
    "statut_hpv": "string | null",
    "date_colposcopie": "date | null",
    "date_coloscopie": "date | null",
    "date_fit": "date | null",
    "date_osteodensitometrie": "date | null",
    "tscore_dxa": "float | null",
    "date_echo_pelvienne": "date | null"
  },
  "vaccins": {
    "date_vaccin_grippe": "date | null",
    "date_vaccin_pneumocoque": "date | null"
  },
  "profil": {
    "age": "int",
    "sexe": "M | F",
    "imc": "float",
    "fumeur": "boolean",
    "pathologies": "string[]",
    "traitements": "string[]"
  }
}
```

---

## Logique de priorité des alertes

```
CRITIQUE  →  Risque vital ou décompensation imminente
HAUTE     →  Écart aux recommandations, action dans < 4 semaines
MODÉRÉE   →  À planifier à la prochaine consultation
INFO      →  Rappel préventif, pas d'urgence
```

### Règles de déclenchement

| Code | Condition | Priorité |
|---|---|---|
| `LDL-POSTIDM` | ldl > 0.55 ET pathologie contient `post-idm` | CRITIQUE |
| `LDL-HAUTRISQUE` | ldl > 0.70 ET pathologie contient `haut-risque-cv` | HAUTE |
| `KALIEMIE-IEC-ARM` | kaliemie > 5.0 ET traitement contient IEC ou ARM | CRITIQUE |
| `BILAN-RENAL-RETARD` | date_prise_de_sang > 6 mois ET (DFG < 45 OU traitement IEC+ARM) | CRITIQUE |
| `BILAN-RENAL-RETARD` | date_prise_de_sang > 12 mois (hors IRC sévère) | HAUTE |
| `HBA1C-DESEQUILIBRE` | hba1c > 8.0 ET pathologie contient `diabete` | CRITIQUE |
| `HBA1C-RETARD` | date_hba1c > 6 mois ET pathologie contient `diabete` | HAUTE |
| `GRIPPE-ALD` | date_vaccin_grippe < sept année en cours ET patient ALD/65+/IC/DT2/BPCO/asthme | HAUTE |
| `GRIPPE-ALD-BPCO` | idem + BPCO stade ≥ II | CRITIQUE |
| `MAMMO-SUIVI-KSEIN` | date_mammographie > 12 mois ET pathologie contient `cancer-sein` | CRITIQUE |
| `MAMMO-DEPISTAGE` | date_mammographie > 24 mois ET femme 50–74 ans | HAUTE |
| `COLPOSCOPIE` | colposcopie absente ET (CIN1+ OU ASC-US + HPV HR) | HAUTE |
| `FIT-CCR` | (date_fit > 24 mois OU fit absent) ET age 50–74 ET pas de coloscopie récente | HAUTE |
| `FOND-OEIL-DT2` | date_fond_oeil > 24 mois ET pathologie contient `diabete` | HAUTE |
| `OSTEO-IA` | date_osteodensitometrie > 24 mois ET traitement inhibiteur aromatase | HAUTE |
| `GYNEO-TAMOX` | date_echo_pelvienne > 12 mois ET traitement contient tamoxifene | HAUTE |
| `TABAC-HPV` | fumeur = true ET statut_hpv contient HPV HR | HAUTE |

---

## Structure JSON patient suggérée

Exemple complet d'un objet patient pour l'algorithme :

```json
{
  "id": "PAT-XXXX",
  "identite": {
    "prenom": "string",
    "nom": "string",
    "age": 68,
    "sexe": "M",
    "est_medecin_traitant": true
  },
  "profil_risque": {
    "imc": 29.4,
    "fumeur": false,
    "pathologies": ["post-idm", "insuffisance-cardiaque", "hta", "dyslipidemie"],
    "traitements": ["bisoprolol", "ramipril", "furosemide", "atorvastatine", "aspirine", "eplerenone"]
  },
  "biologie": {
    "date": "2024-09-05",
    "ldl_g_l": 1.62,
    "hba1c_pourcentage": null,
    "dfg_ckd_epi_ml_min": 52,
    "creatinine_umol_l": 118,
    "kaliemie_mmol_l": 4.9,
    "microalbuminurie_mg_g": 62
  },
  "examens": {
    "date_echocardiographie": null,
    "date_fond_oeil": null,
    "date_mammographie": null,
    "date_frottis": null,
    "date_colposcopie": null,
    "date_coloscopie": "2021-03-14",
    "date_fit": null,
    "date_osteodensitometrie": null
  },
  "vaccins": {
    "date_vaccin_grippe": "2022-10-28"
  },
  "alertes_generees": [
    {
      "code": "LDL-POSTIDM",
      "libelle": "LDL à 1.62 g/L — objectif < 0.55 g/L pour patient post-IDM",
      "priorite": "CRITIQUE",
      "date_generation": "2025-01-01"
    },
    {
      "code": "GRIPPE-ALD",
      "libelle": "Vaccin grippe 2024-2025 non réalisé",
      "priorite": "HAUTE",
      "date_generation": "2025-01-01"
    }
  ]
}
```

---

*Référentiel établi sur la base des recommandations HAS, ESC, SFD et ROSP 2024.*
