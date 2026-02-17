# Documentation Portfolio — Mathis ROUVREAU
**BTS SIO SISR — Portfolio professionnel**

---

## Sommaire

1. [Présentation du portfolio](#1-présentation-du-portfolio)
2. [Structure des fichiers](#2-structure-des-fichiers)
3. [Pages du portfolio](#3-pages-du-portfolio)
4. [Technologies utilisées](#4-technologies-utilisées)
5. [Projets scolaires documentés](#5-projets-scolaires-documentés)
6. [Projets d'alternance documentés](#6-projets-dalternance-documentés)
7. [Fonctionnalités techniques](#7-fonctionnalités-techniques)

---

## 1. Présentation du portfolio

Portfolio personnel de **Mathis ROUVREAU**, étudiant en 2ème année de **BTS SIO option SISR** (Solutions d'Infrastructure, Systèmes et Réseaux). Il présente les compétences, projets scolaires et réalisations en alternance dans les domaines de l'administration systèmes & réseaux, la cybersécurité et l'automatisation.

**Alternance :** AGIR Recouvrement — Administrateur systèmes & réseaux

---

## 2. Structure des fichiers

```
Portfolio/
├── index.html                              # Page d'accueil
├── alternance.html                         # Projets en alternance (AGIR Recouvrement)
├── scolaire.html                           # Projets scolaires (MACODEMY + PPE3 MDS49)
├── competences.html                        # Compétences BTS SIO SISR
├── veille.html                             # Veille technologique
├── contact.html                            # Formulaire de contact
├── style.css                               # Feuille de styles principale
├── app.js                                  # Scripts JS (navigation, thème, scroll)
├── Photo/
│   └── IMG_8395.png                        # Photo de profil
├── Documentation_technique_MACODEMY.md    # Doc technique projet MACODEMY (SIO1)
├── Documentation_Technique_MDS49_PPE3.md  # Doc technique projet PPE3 MDS49 (SIO2)
└── DOCUMENTATION_PORTFOLIO.md             # Ce fichier
```

---

## 3. Pages du portfolio

### 3.1 Accueil (`index.html`)

Page principale du portfolio. Contient :
- **Hero section** : présentation, photo de profil, boutons CTA (projets, contact, CV)
- **À propos** : 3 blocs thématiques (Réseaux, Systèmes, Automatisation)
- **Stats** : chiffres clés (50+ GPO, 300+ utilisateurs, 15+ projets, 99.9% disponibilité)
- **Réalisations marquantes** : timeline avec 3 projets phares d'alternance
- **Technologies & Outils** : stack technique organisée par catégorie
- **Citation**

### 3.2 Alternance (`alternance.html`)

Présentation de l'entreprise AGIR Recouvrement et des 3 projets majeurs sous forme d'accordéon dépliable :

| Projet | Durée | Domaine |
|--------|-------|---------|
| Stoïk – Cybersécurité & GPO | 3 mois | Sécurité AD / Azure |
| Infrastructure hybride Azure AD Connect | 2 mois | Cloud / Hybrid Join |
| Automatisation Exchange via n8n | 1 mois | Automatisation / API |

### 3.3 Scolaire (`scolaire.html`)

Présentation des deux projets d'infrastructure réalisés en BTS SIO :

**Projet MACODEMY (SIO 1ère année)** — 6 activités :
- Serveur Windows Server 2019 (AD/DHCP/DNS)
- Répertoires réseau & lecteurs partagés
- GPO (fond d'écran + déploiement logiciels)
- Infrastructure réseau VLANs, OSPF & ACL
- Serveur Web Debian Apache2 en DMZ
- Intégration postes clients Windows 10

**Projet PPE3 MDS49 (SIO 2ème année)** — 7 activités :
- Infrastructure multi-VLANs & routage OSPF
- Routeur central NAT/PAT & ACL étendues
- Serveur Windows 2019 AD/DHCP/DNS & GPO
- Serveur Web Debian Apache2 en DMZ
- Supervision Zabbix (agents + SNMP)
- Borne WiFi & WPA2-Enterprise (FreeRadius)
- Plans de tests & validation (100% conformes)

### 3.4 Compétences (`competences.html`)

Référentiel des compétences BTS SIO SISR par blocs (B1 à B5).

### 3.5 Veille (`veille.html`)

Articles de veille technologique sur les sujets IT d'actualité.

### 3.6 Contact (`contact.html`)

Formulaire de contact et liens (email, LinkedIn).

---

## 4. Technologies utilisées

### Front-end

| Technologie | Usage |
|-------------|-------|
| HTML5 | Structure sémantique des pages |
| CSS3 | Mise en forme, animations, thème clair/sombre |
| JavaScript (Vanilla) | Navigation mobile, toggle thème, scroll, accordéons |
| Google Fonts (Inter) | Typographie |

### Fonctionnalités CSS notables

- **Thème clair/sombre** via variables CSS et classe sur `<html>`
- **Design responsive** mobile-first
- **Composants réutilisables** : `.card`, `.badge`, `.btn`, `.project-card`, `.stat-card`, `.soft-skill-card`
- **Animations** : `.reveal` (entrée au scroll via IntersectionObserver)
- **Accordéon** : `.ac-item` / `.ac-trigger` / `.ac-panel` pour les projets d'alternance

---

## 5. Projets scolaires documentés

### 5.1 Projet MACODEMY

> *Hugo PASDOIT, Mathis ROUVREAU, Evan RAIMBAULT — SIO 1ère année*

**Objectif :** Optimisation de la gestion du parc informatique d'un établissement fictif.

**Architecture réseau :**
```
Réseau Local : 172.16.0.0/16
  VLAN 10 (Administratif) : 172.16.10.0/24
  VLAN 20 (Enseignants)   : 172.16.20.0/24
  VLAN 30 (Étudiants)     : 172.16.30.0/24

Serveur AD/DHCP/DNS : 172.16.1.1 (Windows Server 2019)
DMZ : 192.168.10.0/24
  Serveur Web Debian : 192.168.10.1 (Apache2)
```

**Réalisations principales :**
- Active Directory `macodemy.local` (3 OU, groupes de sécurité, utilisateurs format `nomp`)
- DHCP 3 étendues + DHCP Relay via routeur Cisco
- DNS : zone `macodemy.local` → 192.168.10.1
- GPO : fond d'écran, Firefox, Chrome
- Lecteurs réseau : Perso, Commun (par service), Ressources (droits différenciés)
- Routage OSPF + ACL inter-VLANs
- Serveur web Apache2 en DMZ (accès via `http://macodemy.local`)
- Intégration postes Windows 10 (22H2) au domaine

---

### 5.2 Projet PPE3 — MDS49

> *Mathis ROUVREAU, Evan RAIMBAULT, Julien TOUZEAU — SIO 2ème année*
> *Gestion de projet : méthode Agile (Trello)*

**Objectif :** Infrastructure réseau sécurisée et segmentée pour la Maison Départementale des Sports 49.

**Architecture réseau :**
```
Réseau MDS49.local
  VLAN 10 (Volley)         : 172.16.0.0/18    — passerelle 172.16.63.254
  VLAN 20 (Escrime)        : 172.16.64.0/18   — passerelle 172.16.127.254
  VLAN 30 (Administratif)  : 172.16.128.0/18  — passerelle 172.16.191.254
  VLAN 100 (Partenaires)   : 172.16.192.0/18  — passerelle 172.16.255.254

  Routeur RDC         : 192.168.0.2/30 (vers MDS49)
  Routeur MDS49       : 192.168.0.1/30 | DMZ 10.54.0.254/24 | Internet s0/1/0
  DMZ                 : 10.54.0.0/24
    Serveur Web       : 10.54.0.100 (Apache2 / Debian)
  WinServer 2019      : (AD + DHCP + DNS) domaine MDS49.local
  Serveur Zabbix      : supervision (agents + SNMP)
  Borne WiFi Cisco    : 172.16.255.253 (VLAN 100)
  Serveur Radius      : FreeRadius + Winbind (Debian)
```

**Réalisations principales :**
- 4 VLANs segmentés + trunk switch Cisco (GigabitEthernet1/0/24)
- Routage OSPF inter-routeurs
- NAT/PAT : `8.8.8.1:80` → `10.54.0.100:80`
- ACL standard et étendues (filtrage inter-VLAN, accès web)
- Active Directory `MDS49.local` : 4 OU (comités), utilisateurs, répertoires perso/communs
- GPO : interdiction panneau de configuration
- Supervision Zabbix (SNMP routeurs/switch, agents AD et Web)
- WPA2-Enterprise via FreeRadius (802.1X) intégré à l'AD
- Plans de tests : 5 scénarios, 100% de conformité

**Compétences SISR couvertes :**

| Bloc | Compétence | Activité |
|------|-----------|---------|
| B1.2 | Exploiter des serveurs | AD, DHCP, DNS, Apache2 |
| B1.5 | Exploiter un service d'annuaire | Active Directory |
| B2.2 | Maintenir la sécurité d'une infrastructure | Droits NTFS, GPO, ACL |
| B2.4 | Assurer la cybersécurité d'une infrastructure | RADIUS, WPA2-Enterprise |
| B3.2 | Gérer un réseau IP | VLANs, OSPF, routage |
| B3.3 | Sécuriser les accès réseaux IP | ACL, NAT/PAT, 802.1X |
| B3.4 | Administrer et superviser le réseau | Zabbix, SNMP |
| B4.1 | Concevoir une solution en réponse à un besoin | Architecture réseau |
| B5.1 | Recenser et identifier les ressources numériques | Plans de tests, documentation |

---

## 6. Projets d'alternance documentés

### 6.1 Stoïk — Cybersécurité & GPO (3 mois)

Durcissement de l'infrastructure Active Directory d'AGIR Recouvrement suite à un audit interne.

- Audit BloodHound & PingCastle
- GPO de sécurité (RDP, SMBv1, PowerShell ConstrainedLanguage)
- Réorganisation OU, révision droits NTFS, PAW
- Azure AD : MFA 100%, Secure Score 45% → 82%, DLP, labels sensibilité

**Résultats :** -75% vulnérabilités critiques, 100% utilisateurs MFA, 50+ GPO configurées

### 6.2 Infrastructure hybride Azure AD Connect (2 mois)

Synchronisation de l'AD on-premise avec Azure AD pour une gestion hybride unifiée.

- Azure AD Connect (Password Hash Sync + Seamless SSO)
- Hybrid Azure AD Join (Windows 10/11)
- Politiques d'accès conditionnel, migration Exchange Online
- Scripts PowerShell de gestion en masse

**Résultats :** 300+ comptes synchronisés, 60+ appareils Hybrid Join, 0 incident majeur

### 6.3 Automatisation Exchange via n8n (1 mois)

Workflow n8n automatisant l'intégralité du cycle de vie des délégations Exchange.

- Formulaire de demande → validation manager → application droits PS/Graph API → notification → révocation auto
- Traçabilité SQLite, OAuth2, retry automatique
- Rapport hebdomadaire IT

**Résultats :** 8h/semaine gagnées, 0 erreur humaine, 150+ demandes traitées

---

## 7. Fonctionnalités techniques

### Navigation & UX

- **Menu hamburger** sur mobile (toggle via `data-open`)
- **Bouton thème** clair/sombre (persistance `localStorage`)
- **Bouton retour en haut** (`back-to-top`) visible au scroll
- **Animations au scroll** via `IntersectionObserver` (classe `.reveal`)
- **Accordéon** sur la page alternance (aria-expanded)

### Composants HTML/CSS réutilisables

| Classe | Description |
|--------|-------------|
| `.project-card` | Carte de projet (icône, titre, description, détails, badges) |
| `.company-presentation` | Bloc de présentation entreprise/contexte |
| `.stat-card` | Carte statistique (chiffre + label) |
| `.soft-skill-card` | Carte compétence transversale |
| `.badge` / `.tech-badge` | Badges technologie/compétence |
| `.timeline` / `.tl-item` | Frise chronologique |
| `.ac-item` | Élément accordéon |
| `.impact-grid` | Grille résultats/impact |

---

*Documentation rédigée par Mathis ROUVREAU — BTS SIO SISR — 2025/2026*
