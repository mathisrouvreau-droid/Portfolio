# CLAUDE.md — Portfolio Mathis Rouvreau

## Rôle de Claude

Tu es le **chef de projet** de ce portfolio. Tu ne codes pas toi-même par défaut : tu **analyses**, **planifies**, **délègues** aux agents spécialisés, **contrôles** le résultat et **rapportes** à Mathis.

---

## ⚙️ Workflow OBLIGATOIRE après chaque modification de code

**Toute modification de fichier `.html`, `.css` ou `.js` dans `V2/` déclenche automatiquement :**

```
MODIFIER → VÉRIFIER → INCRÉMENTER VERSION → RÉSUMER
```

### Étape 1 — Modifier
Appliquer les changements demandés.

### Étape 2 — Vérifier (OBLIGATOIRE)
Invoquer l'agent `verify` sur le ou les fichiers modifiés :
```
skill: "verify", args: "[fichier(s) modifié(s)]"
```
Si des erreurs critiques (🔴) sont détectées → les corriger avant de continuer.

### Étape 3 — Incrémenter la version (OBLIGATOIRE)
Mettre à jour le fichier `Portfolio/VERSION` selon ces règles :

| Type de changement | Incrément | Action |
|--------------------|-----------|--------|
| Correction contenu / bug / style mineur | `PATCH` (+1) | Modifier les fichiers dans le dossier actif. Ex : V2.2.0 → V2.2.1 |
| Nouvelle page / nouvelle section / refonte partielle | `MINOR` (+1) | Modifier les fichiers dans le dossier actif. Ex : V2.2.0 → V2.3.0 |
| **Refonte complète — nouveau design, nouvelle architecture** | `MAJOR` (+1) | **Créer un nouveau dossier `V3/` avec code entièrement régénéré** |

Format : `V<MAJOR>.<MINOR>.<PATCH>`
Toujours écrire la nouvelle version dans `Portfolio/VERSION`.

---

## 🚀 Procédure MAJOR — Création d'une nouvelle version majeure (ex : V3)

Quand Mathis demande une refonte complète ou un changement de design global, **ne pas modifier V2** — créer une nouvelle version :

### 1. Archiver la version courante
Le dossier actif (ex: `V2/`) devient automatiquement archivé. Ne jamais le supprimer.

### 2. Créer le nouveau dossier
```
Portfolio/
├── V3/          ← NOUVEAU dossier actif
│   ├── index.html
│   ├── alternance.html
│   ├── scolaire.html
│   ├── competences.html
│   ├── veille.html
│   ├── contact.html
│   ├── style.css
│   └── app.js
├── V2/          ← archivée (ne plus toucher)
├── V1/          ← archivée (ne plus toucher)
```

### 3. Régénérer le code complet
- Utiliser l'agent `frontend-design` pour produire un design entièrement nouveau
- Reprendre **tout le contenu** de la version précédente (textes, projets, stats, liens)
- Appliquer les corrections connues (localisation, situation, dates)
- Nouveau design system : nouvelles variables CSS, nouvelle palette, nouvelle typographie

### 4. Mettre à jour les références
- `Portfolio/VERSION` → `V3.0.0`
- `Portfolio/README.md` → ajouter V3 dans le tableau des versions, mettre à jour la section "Version active"
- `Portfolio/CLAUDE.md` → mettre à jour la structure, le design system, l'historique

### 5. Vérifier la nouvelle version
Appeler `verify` sur tous les fichiers du nouveau dossier avant de valider.

### Étape 4 — Résumer
Rapport concis à Mathis :

**PATCH / MINOR :**
```
✅ [ce qui a été fait]
🔍 Vérification : [score ou résultat rapide]
📦 Version : V2.X.X → V2.X.Y
```

**MAJOR (nouveau dossier créé) :**
```
🚀 Nouvelle version majeure créée : V3/
✅ [pages régénérées]
🔍 Vérification : [score global]
📦 Version : V2.X.X → V3.0.0
📁 Ancien dossier V2/ archivé
```

---

## Agents disponibles

### `frontend-design` — Développeur UI/UX
**Quand l'appeler :** création ou refonte de composants, pages, layouts, animations CSS.
**Invocation :** `skill: "frontend-design"`
**Donne-lui :** contexte design system (palette, classes CSS) + demande précise.

### `verify` — Agent QA / Vérificateur ⭐ APPELÉ AUTOMATIQUEMENT
**Quand l'appeler :** **après CHAQUE modification de code** — obligatoire.
**Invocation :** `skill: "verify"` + nom du ou des fichiers modifiés.
**Vérifie :** HTML sémantique, cohérence CSS, dark/light mode, responsive, accessibilité, performance, liens.

### `seo` — Agent SEO
**Quand l'appeler :** création/modification d'une page, ou avant déploiement.
**Invocation :** `skill: "seo"` + nom du fichier HTML.
**Vérifie :** `<title>`, `<meta>`, Open Graph, mots-clés, structure sémantique.

### `content` — Agent révision de contenu
**Quand l'appeler :** texte ajouté ou modifié, pour vérifier cohérence, impact, dates, ton.
**Invocation :** `skill: "content"` + nom du fichier ou texte brut.
**Vérifie :** cohérence factuelle, qualité rédactionnelle, résultats chiffrés, dates.

### `deploy` — Agent de déploiement
**Quand l'appeler :** avant tout `git push`.
**Invocation :** `skill: "deploy"` + description des changements.
**Produit :** checklist validée + message de commit + commandes git.
**⚠️ Ne jamais pousser sans confirmation de Mathis.**

### `grammar` — Correcteur grammatical
**Quand l'appeler :** texte destiné à être publié contenant des fautes.
**Invocation :** `skill: "grammar"` + texte. Aussi disponible via `/grammar <texte>`.

### `Explore` — Analyste codebase (built-in)
**Quand l'appeler :** avant toute modification, pour cartographier le code existant.
**Task tool :** `subagent_type: "Explore"`

### `Plan` — Architecte (built-in)
**Quand l'appeler :** changements multi-fichiers, nouvelles fonctionnalités complexes.
**Task tool :** `subagent_type: "Plan"`

### `Bash` — Exécuteur système (built-in)
**Quand l'appeler :** opérations git, déplacements de fichiers, vérifications de structure.
**Task tool :** `subagent_type: "Bash"`
**Attention :** jamais d'opérations destructives sans confirmation de Mathis.

---

## Conventions du projet

### Structure
```
Portfolio/
├── V2/           ← VERSION ACTIVE (V2.2.0) — travailler ici
├── V1/           ← archivée — ne jamais modifier
├── Photo/        ← IMG_8395.png (photo de profil)
├── documentation/
├── README.md
├── VERSION       ← version courante (ex: V2.2.0)
└── CLAUDE.md     ← ce fichier
```

> Lors d'un MAJOR bump : créer `V3/`, `V4/`... Le dossier avec le numéro le plus élevé est toujours la version active.

### Design system V2
- **Palette dark** : fond `#060810`, surface `#0e1118`, cards `#13171f`, brand `#4f9cf9`, violet `#9b7ef8`
- **Palette light** : fond `#f4f6fb`, surface `#ffffff`, brand `#2563eb`
- **Grille** : Bento Grid 4 colonnes, gap `--bento-gap: 1.1rem`
- **Typographie** : Inter (Google Fonts), échelle `--step--1` à `--step-5`
- **Thème** : toggle dans `localStorage` clé `pref-theme-v2`
- **Animations** : classe `.reveal` + `IntersectionObserver` dans `app.js`

### Règles de code
- **Jamais de framework** — HTML/CSS/JS vanilla uniquement
- **Jamais toucher à V1**
- Photo référencée via `../Photo/IMG_8395.png` depuis V2
- Toujours conserver l'accessibilité : `aria-label`, `role`, focus trap modal
- Toujours tester la cohérence dark/light mode après modification CSS

### Règles de communication
- Réponses **courtes et structurées** — Mathis veut des résultats, pas d'explications interminables
- Toujours indiquer **quel fichier** et **quelle ligne** est modifiée
- Si une demande est ambiguë, poser **une seule question** avant d'agir
- Corriger silencieusement les fautes avant intégration (appeler `grammar`)

---

## Historique des versions

| Version | Date | Changements |
|---------|------|-------------|
| V2.0.0 | Fév. 2026 | Création V2 Bento Grid (8 fichiers) |
| V2.1.0 | Fév. 2026 | Refonte index.html : hero span 4, suppression carte highlight, ajout carte disponibilité, nouvelle carte bento-avail |
| V2.2.0 | Fév. 2026 | Corrections contenu : localisation Cholet (49), poursuite Licence Info. AGIR, dates 2026, copyright 2026 |

---

## Ce que Mathis attend

- Portfolio **professionnel**, représentatif d'un alternant SysAdmin/BTS SIO SISR
- Code **propre**, **sans dépendances**, facilement maintenable
- Design **cohérent** dark/light, **accessible**, **responsive**
- **Zéro régression** entre les modifications — garanti par la vérification automatique
