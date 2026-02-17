# Portfolio Mathis Rouvreau — BTS SIO SISR (Version Enrichie 2025)

## 🎯 Vue d'ensemble

Portfolio professionnel enrichi pour l'épreuve E6 du BTS SIO option SISR. Cette version représente un niveau de qualité senior avec des fonctionnalités avancées, un design moderne et une expérience utilisateur optimale.

## 📁 Structure des fichiers

```
portfolio/
├── index.html              # Page d'accueil (Hero, À propos, Stats, Réalisations)
├── alternance.html         # Projets en entreprise (AGIR Recouvrement)
├── scolaire.html          # Projets de formation BTS
├── competences.html       # Compétences techniques avec barres de progression
├── veille.html            # Veille technologique structurée
├── contact.html           # Formulaire + coordonnées + FAQ
├── style.css              # Styles complets (~1000 lignes)
├── app.js                 # JavaScript enrichi (~350 lignes)
├── README.md              # Ce fichier
├── img/                   # Images des projets
│   ├── projet-ad-1.jpg
│   ├── projet-ad-2.jpg
│   ├── projet-ad-3.jpg
│   ├── azure-sync-1.jpg
│   ├── azure-sync-2.jpg
│   ├── azure-sync-3.jpg
│   ├── n8n-workflow-1.jpg
│   ├── n8n-workflow-2.jpg
│   └── n8n-workflow-3.jpg
├── Photo/
│   └── IMG_8395.png       # Photo de profil
└── assets/
    └── CV_Mathis_Rouvreau.pdf  # CV téléchargeable
```

## ✨ Nouvelles fonctionnalités ajoutées

### 🎨 Design & UX

#### Page d'accueil (index.html)
- ✅ **Hero modernisé** avec gradient de texte animé
- ✅ **Section statistiques** (50+ GPO, 300+ utilisateurs, 99.9% disponibilité)
- ✅ **Section Technologies** avec badges interactifs
- ✅ **Impact metrics** sur chaque réalisation (gain de temps, réduction vulnérabilités)
- ✅ **Footer structuré** avec 3 colonnes (Profil, Navigation, Contact)
- ✅ **Bouton CV téléchargeable** dans le hero
- ✅ **Scroll indicator** animé en bas du hero

#### Page Alternance (alternance.html)
- ✅ **Présentation entreprise complète** (AGIR Recouvrement)
  - Secteur d'activité
  - Structure & équipe IT
  - Rôle et périmètre
  - Environnement technique
- ✅ **Projets détaillés** avec méthodologie complète :
  - **Stoïk (Cybersécurité)** : Audit, durcissement AD, Azure hardening
  - **Azure AD Connect** : Hybrid Join, MFA, Conditional Access
  - **n8n Exchange** : Workflow automatisé avec approbation
- ✅ **Grilles d'impact** pour chaque projet (métriques chiffrées)
- ✅ **Tags de compétences** mobilisées
- ✅ **Galeries d'images** avec compteur (1/3, 2/3, 3/3)
- ✅ **Navigation clavier** dans les galleries (flèches gauche/droite)

#### Page Compétences (competences.html)
- ✅ **6 catégories de compétences** :
  - Administration Systèmes
  - Réseaux & Infrastructure
  - Cybersécurité
  - Cloud & Services Microsoft
  - Automatisation & DevOps
  - Outils & Méthodologie
- ✅ **Barres de progression** animées avec 5 niveaux (Débutant → Expert)
- ✅ **Section Certifications** (BTS SIO, AZ-900 en préparation, Formation cybersécurité)
- ✅ **Soft skills** en grille de 6 cartes
- ✅ **Grille officielle SISR** (iframe Google Sheets + lien externe)

#### Page Veille (veille.html)
- ✅ **3 thématiques détaillées** :
  - 🛡️ Cybersécurité (CERT-FR, ZATAZ, BleepingComputer)
  - 🧠 IA & Automatisation (n8n, PowerShell, Graph API)
  - ☁️ Cloud / Azure (Microsoft Learn, M365 Roadmap)
- ✅ **Méthodologie de veille** en timeline (4 étapes)
- ✅ **Dernières lectures** en accordéon avec résumé + impact
- ✅ **Sources avec liens** vers les sites officiels

#### Page Scolaire (scolaire.html)
- ✅ **Statistiques** des projets (15+ projets, 100% validés)
- ✅ **4 catégories de projets** :
  - Administration Systèmes (AD, Virtualisation, Serveur fichiers)
  - Réseaux & Infrastructure (VLAN, VPN, Supervision)
  - Cybersécurité (Audit, MFA, Pare-feu)
  - Développement Web & Outils (Site web, GLPI, SQL)
- ✅ **Icônes thématiques** pour chaque projet
- ✅ **Références au référentiel** (badges B1.1, B2.3, etc.)
- ✅ **Section compétences transversales**

#### Page Contact (contact.html)
- ✅ **Formulaire enrichi** avec dropdown "Objet"
- ✅ **Coordonnées complètes** (email, LinkedIn, localisation)
- ✅ **Bouton "Copier l'email"** avec feedback visuel
- ✅ **Badge disponibilité** (vert avec date)
- ✅ **Réseaux sociaux** (LinkedIn, GitHub, Twitter placeholder)
- ✅ **FAQ accordéon** (4 questions fréquentes)

### ⚙️ Fonctionnalités JavaScript

#### Interactions avancées
- ✅ **Navigation clavier** dans les galleries (←/→)
- ✅ **Compteur de photos** dynamique (1/3, 2/3...)
- ✅ **Bouton retour en haut** (apparaît après 500px de scroll)
- ✅ **Animation des barres de compétences** au scroll
- ✅ **Smooth scroll** pour tous les liens d'ancrage
- ✅ **Validation formulaire** avec messages d'erreur
- ✅ **Préchargement images** au survol des accordéons
- ✅ **Easter egg** (Konami Code = effet rainbow)
- ✅ **Console branding** avec message personnalisé

#### Accessibilité
- ✅ **ARIA labels** sur tous les éléments interactifs
- ✅ **Gestion no-js** (menu toujours visible sans JS)
- ✅ **Respect prefers-reduced-motion**
- ✅ **Focus visible** sur tous les boutons/liens
- ✅ **Alt text** sur toutes les images

### 🎨 Styles CSS

#### Système de design
- ✅ **Variables CSS** pour dark/light mode
- ✅ **Échelle typographique fluide** (clamp pour responsive)
- ✅ **Palette de couleurs** cohérente (brand, accent, success, warning)
- ✅ **Animations** subtiles et performantes
- ✅ **Gradients** pour les éléments clés (brand, stats)

#### Composants
- ✅ **Cards** avec hover effects
- ✅ **Bad