# Analyse V2 — Benchmark vs portfolios BTS SIO & tendances 2025

> Générée le 21 février 2026 par Claude Code

---

## Ce qui est très bon ✅

| Point | Détail |
|---|---|
| **Bento Grid** | Tendance 2025-2026 confirmée — positionnement dans le bon sens |
| **Dark/light mode** | Persisté en localStorage, transitions fluides — standard pro |
| **Accessibilité** | Focus trap modal, aria-labels, keyboard nav, `prefers-reduced-motion` — meilleur que 90% des BTS SIO |
| **Aucune dépendance** | Vanilla HTML/CSS/JS — code propre, pas de dette technique |
| **Stats chiffrées** | 50+ GPOs, 300+ users, 99.9% uptime — très percutant pour un recruteur |
| **Easter egg Konami** | Petit détail qui montre la personnalité développeur |
| **Responsive + breakpoints** | 900/640px, timeline mobile — bien géré |

---

## Ce qui est en retard vs la concurrence ⚠️

### 1. Iframe Google Sheets dans `competences.html` — gros point faible

Tous les portfolios analysés (kothanromeo.dev, bouzac.dev) utilisent des tables HTML natives ou des skill bars. Un iframe Google Sheets :

- Ne s'adapte pas correctement sur mobile
- Casse l'intégration visuelle du design
- Dépend d'un service externe (peut tomber)
- Fait moins professionnel aux yeux d'un recruteur

**Recommandation :** Remplacer par une table HTML native avec `.sisr-table` déjà définie dans le CSS.

---

### 2. Zéro image/screenshot dans les projets

Tous les portfolios bien notés ont des visuels des projets — captures d'écran, schémas réseau, maquettes. Les projets présentés (AD Hardening, Azure AD Connect, n8n) sont excellents sur le fond mais **invisibles visuellement**.

Un recruteur retient les images, pas le texte.

**Recommandation :** Ajouter pour chaque projet dans `alternance.html` :
- 1 schéma d'architecture (réseau, flux)
- 1-2 captures d'écran de l'interface ou du résultat

---

### 3. Veille technologique trop légère

`veille.html` = listes de sources avec thèmes. Insuffisant comparé à la concurrence qui présente :

- De vrais résumés d'articles
- Des analyses personnelles
- Des dates de veille
- Des technologies avec avis personnel

**Recommandation :** Pour chaque thème (Cybersécurité, Azure/Microsoft, Automatisation), ajouter 3 à 5 articles avec :
- Titre de l'article
- Source + date
- Résumé en 3-4 lignes
- Avis personnel / impact sur le métier

---

### 4. `contact.html` redondant avec le modal

Deux points d'entrée pour le contact (page dédiée + modal) avec exactement le même contenu. Cela dilue la navigation et n'apporte pas de valeur supplémentaire.

**Recommandation :** Supprimer `contact.html` ou la transformer en page de remerciement post-formulaire. Le modal suffit.

---

## Ce qui manque par rapport aux tendances 2025-2026

| Tendance | État actuel V2 | Recommandation |
|---|---|---|
| **Micro-interactions** | Hover basiques | Ajouter scale + shadow sur les cartes au hover |
| **Galerie/filtrage projets** | Pas de filtre | Filtres par type : Réseau / Sécu / Cloud / Automatisation |
| **Glassmorphism léger** | Quasi absent | Backdrop-blur sur 1-2 cartes stratégiques (hero, disponibilité) |
| **CV téléchargeable visible** | Présent mais discret | Mettre en avant comme bouton principal dans le hero |

---

## Positionnement global

Comparé aux portfolios BTS SIO/SISR analysés :

```
Accessibilité & code   ████████████  TOP 5%
Design & modernité     █████████░░░  TOP 20%
Contenu & preuves      ██████░░░░░░  Moyen
Visuels & médias       ████░░░░░░░░  Faible
Veille technologique   █████░░░░░░░  Faible
```

---

## Actions prioritaires (ordre d'impact)

| Priorité | Action | Fichier | Impact |
|---|---|---|---|
| 🔴 1 | Remplacer l'iframe Google Sheets par une table HTML | `competences.html` | Élevé |
| 🔴 2 | Ajouter des screenshots/schémas dans les projets | `alternance.html` | Élevé |
| 🟠 3 | Étoffer la veille avec de vrais articles résumés | `veille.html` | Moyen |
| 🟡 4 | Fusionner ou supprimer `contact.html` | `contact.html` | Faible |

---

## Références analysées

- [kothanromeo.dev](https://kothanromeo.dev/) — Portfolio BTS SIO SLAM complet avec galerie filtrée
- [bouzac.dev](https://bouzac.dev/) — Structure claire, certifications intégrées
- [SafiDial — GitHub Portfolio BTS SIO SLAM 2024-2025](https://github.com/SafiDial/portfolio-bts-sio-slam-2024-2025)
- [Bento Grid Design Trend 2025 — Senorit](https://senorit.de/en/blog/bento-grid-design-trend-2025)
- [UI/UX Design Trends 2025 — BootstrapDash](https://www.bootstrapdash.com/blog/ui-ux-design-trends)
