# Documentation Technique — PPE3 MDS49
**Maison Départementale des Sports 49**
*SIO2 — ROUVREAU Mathis, RAIMBAULT Evan, TOUZEAU Julien*

---

## Sommaire

1. [Introduction](#1-introduction)
2. [Contexte et Objectifs](#2-contexte-et-objectifs)
3. [Configuration du Routeur RDC](#3-configuration-du-routeur-rdc)
4. [Routeur MDS49](#4-routeur-mds49)
5. [Switch](#5-switch)
6. [Serveur Windows 2019 — AD / DHCP / DNS](#6-serveur-windows-2019--ad--dhcp--dns)
7. [Serveur Web Debian — Apache2](#7-serveur-web-debian--apache2)
8. [Serveur Zabbix](#8-serveur-zabbix)
9. [Borne WiFi](#9-borne-wifi)
10. [Serveur Radius](#10-serveur-radius)
11. [Tests Réalisés](#11-tests-réalisés)
12. [Captures d'Écran](#12-captures-décran)

---

## 1. Introduction

Cette documentation présente l'intégralité de la mise en œuvre du projet PPE3 au sein de la Maison Départementale des Sports 49 (MDS49). Le but du projet est de concevoir une infrastructure réseau sécurisée, segmentée et fonctionnelle conforme au cahier des charges. Toutes les configurations présentes dans ce document proviennent exclusivement des captures réelles et du travail effectué sur l'infrastructure.

---

## 2. Contexte et Objectifs

L'infrastructure réseau **MDS49** repose sur une architecture segmentée et sécurisée visant à séparer les flux internes, les zones sensibles et les services exposés. Le réseau interne est divisé en **quatre sous-réseaux utilisateurs**, chacun représenté par un VLAN correspondant à un comité (Administratif, Volley, Escrime, Partenaires). Ces VLAN sont transportés via un switch d'accès et un routeur de distribution qui assure le routage inter-VLAN au sein du bâtiment.

Un **contrôleur de domaine Active Directory** sous Windows Server 2019 est responsable de l'authentification et de la centralisation des utilisateurs. Un **serveur Web interne**, positionné en DMZ, héberge les pages institutionnelles et peut être joint depuis l'extérieur grâce au NAT/PAT réalisé par le routeur MDS49 (routeur central).

La supervision est assurée via un **serveur Zabbix**, permettant de suivre l'état du réseau, des serveurs et équipements actifs. Enfin, une **borne WiFi** fournit deux SSID : l'un pour les partenaires (VLAN 100), et un second sécurisé par **WPA2-Enterprise via un serveur Radius**, connecté à l'Active Directory.

### Arborescence de MDS49.local

```
MDS49.local
└── UO_Employés
    ├── Gr_Employés
    ├── UO_Bureaux_Administratifs
    │   └── Gr_Bureaux_Administratifs / Commun : Commun_Bureaux_Administratifs
    │       ├── BODIN Hélène / Perso : Bodinh
    │       └── SALAIN Claire / Perso : Salainc
    ├── UO_Comité_Escrime
    │   └── Gr_Comité_Escrime / Commun : Commun_Comité_Escrime
    │       ├── HERVOUET Paul / Perso : Hervouetp
    │       └── VERNEUIL Alice / Perso : Verneuila
    ├── UO_Comité_Volley
    │   └── Gr_Comité_Volley / Commun : Commun_Comité_Volley
    │       ├── CHALLAIN Marc / Perso : Challainm
    │       └── FOURMOND Matthieu / Perso : Fourmondm
    └── UO_Partenaires
        └── Gr_Partenaires / Commun : Commun_Partenaires
            └── DUBLINEAU Cécile / Perso : Dublineauc
```

Lien Trello (méthode Agile) : https://trello.com/invite/b/68dfbbd5fbfa584f19dc53a8/ATTI67643ad9d0d509f1dc56a13924497f181BAC131A/ap3

### Objectifs du projet

- Isolation réseau par VLAN (Volley, Escrime, Administratif, DMZ, Wifi Partenaires)
- Mise en place d'un serveur AD/DHCP/DNS Windows Server 2019
- Routage inter-VLAN + OSPF
- Mise en place d'un serveur web interne + un serveur web externe
- Mise en place d'un NAT/PAT sur le routeur de bordure
- Mise en place d'ACL filtrant les flux entre VLAN
- Supervision Zabbix
- Tests internes et externes

---

## 3. Configuration du Routeur RDC

Ce routeur assure le routage interne du bâtiment entre les VLAN et envoie le trafic vers le routeur central.

Des sous-interfaces sont configurées sur **Gig0/0/0**, chacune associée à un VLAN :

| VLAN | Sous-réseau | Passerelle | Interface |
|------|-------------|------------|-----------|
| 10 (Volley) | 172.16.0.0/18 | 172.16.63.254 | g0/0/0.10 |
| 20 (Escrime) | 172.16.64.0/18 | 172.16.127.254 | g0/0/0.20 |
| 100 (Partenaires) | 172.16.192.0/18 | 172.16.255.254 | g0/0/0.100 |
| 30 (Administratif) | 172.16.128.0/18 | 172.16.191.254 | g0/0/0.30 |

Le routeur RDC prend en charge l'interconnexion des VLAN, les sous-interfaces 802.1Q, le DHCP relay, des ACL de filtrage et des routes statiques.

Un **ip-helper** est configuré pour chaque sous-réseau afin que le DHCP puisse se diffuser sur les autres sous-réseaux en fonction de l'adresse réseau.

Les routes du routeur ont été configurées en **OSPF**.

### ACL de filtrage inter-VLAN

```cisco
access-list 1 deny 172.16.0.0 0.0.64.255
access-list 1 permit any

interface g0/0/1
 ip access-group 1 in
```

---

## 4. Routeur MDS49

Le routeur MDS49 (routeur central) réalise :
- Le routage entre DMZ, entreprise et Internet
- Le NAT/PAT
- Les ACL standards et étendues

### Interfaces du routeur MDS49

| Interface | Adresse | Fonction |
|-----------|---------|----------|
| g0/0/1 | 192.168.0.1/30 | Vers Routeur_RDC |
| g0/0/0 | 10.54.0.254/24 | DMZ |
| s0/1/0 | 100.100.100.1/30 | Vers Internet |

Une ACL est appliquée sur l'interface GigabitEthernet0/0/0 : `ip access-group WEB in`

Les routes ont été configurées en **OSPF** sur le routeur.

### ACL configurées

- **2 ACL standard** : autorisent les sous-réseaux et le serveur web (10.54.0.100) à accéder au serveur web externe. Ces ACL sont liées au NAT/PAT.
- **1 ACL étendue** : permet à tous les hôtes (internes ou externes) d'accéder uniquement au service HTTP du serveur interne (10.54.0.100).

---

## 5. Switch

Le switch interconnecte les différents postes et serveurs sur des VLANs séparés :

| VLAN | Nom |
|------|-----|
| 10 | Volley |
| 20 | Escrime |
| 30 | Administratif |
| 100 | Partenaires |

Un port Trunk est configuré sur le port **GigabitEthernet 1/0/24**.

```cisco
interface GigabitEthernet1/0/1 à 1/0/7
 switchport access vlan 10
 switchport mode access

interface GigabitEthernet1/0/8 à 1/0/14
 switchport access vlan 20
 switchport mode access

interface GigabitEthernet1/0/15 à 1/0/21
 switchport access vlan 30
 switchport mode access

interface GigabitEthernet1/0/22
 switchport access vlan 100
 switchport mode access

interface GigabitEthernet1/0/24
 switchport mode trunk
```

---

## 6. Serveur Windows 2019 — AD / DHCP / DNS

### Active Directory

L'Active Directory repose sur le domaine **MDS49.local**, créé lors de l'installation de Windows Server 2019. Plusieurs **Unités d'Organisation (OU)** ont été définies : Bureaux_Administratifs, Comité_Volley, Comité_Escrime et Partenaires. Chaque OU contient un groupe de sécurité associé (GR_Bureaux_Administratifs, GR_Comité_Volley, GR_Comité_Escrime, GR_Partenaires).

Les utilisateurs sont créés selon la nomenclature **nom + première lettre du prénom** (ex : `challainm`).

Chaque utilisateur dispose d'un **répertoire personnel** et d'un **répertoire commun** en fonction de son groupe. Seuls les responsables peuvent écrire dans le répertoire commun ; les autres employés ont uniquement le droit de lecture.

### GPO

Une GPO a été créée pour **interdire l'accès au panneau de configuration** aux utilisateurs. Ce paramètre se situe dans :
> Configuration utilisateur > Stratégies > Modèles d'administration > Panneau de configuration
> — paramètre : **"Interdire l'accès au Panneau de configuration et l'application Paramètres du PC"**

### DHCP

Le rôle **DHCP** est activé sur le serveur AD afin de fournir automatiquement les adresses IP aux clients. Deux **réservations** ont été faites : pour le serveur de supervision Zabbix et pour le serveur Windows.

Comme le DHCP ne se trouve pas sur le même réseau que tous les VLAN, un **DHCP Relay (IP Helper address)** est configuré sur le routeur RDC.

### DNS

Le rôle **DNS** est installé automatiquement, fournissant les services de résolution internes au domaine.

---

## 7. Serveur Web Debian — Apache2

Un serveur Debian héberge le site Web interne. Il est placé dans la **DMZ 10.54.0.0/24** :
- Serveur Web : **10.54.0.100**
- Passerelle DMZ : **10.54.0.254**

### Installation d'Apache2

```bash
apt install apache2 -y
```

### NAT/PAT

Le routeur MDS49 réalise un **NAT/PAT** de l'adresse publique `8.8.8.1:80` vers l'adresse privée `10.54.0.100:80`, permettant un accès externe sécurisé et contrôlé.

---

## 8. Serveur Zabbix

Le serveur Zabbix supervise :
- Le serveur AD
- Le serveur web (DMZ)
- Les routeurs
- Le switch

Pour le **serveur AD** et le **serveur Web interne**, le Zabbix agent est installé directement.

Pour les **routeurs**, des commandes SNMP ont été ajoutées pour permettre à Zabbix de connaître l'état des appareils :

```cisco
snmp-server community RO
```

Pour le **switch**, la configuration est identique aux routeurs, en remplaçant `RO` par `SW`.

---

## 9. Borne WiFi

Une borne WiFi Cisco a été configurée dans le **VLAN 100** avec le SSID **accesspoint**.

- Nom de la borne : **cisco**
- Adresse IP : **172.16.255.253**

Une configuration pour le Radius a également été initiée sur la borne.

---

## 10. Serveur Radius

Le serveur Radius (FreeRadius) est installé sous Debian. Il est intégré à l'Active Directory grâce à **Winbind**.

Fonctionnalités :
- Authentification **802.1X**
- Contrôle d'accès dynamique via AD

---

## 11. Tests Réalisés

### 11.1. Plan de test — Site web externe

| Champ | Détail |
|-------|--------|
| **Test Fonctionnel** | [CT-FUNC] Test d'installation de l'application |
| **Objectif** | Afficher une page web à travers un navigateur internet |
| **Éléments à tester** | Serveur Web |
| **Prérequis** | Une station sous Debian 12 avec Apache2 et une station cliente sous Windows. Les deux stations ne sont pas sur le même réseau mais communiquent entre elles. Sur le client, un navigateur est ouvert et le serveur web est démarré. |
| **Initialisation** | Les deux postes sont sous tension et le serveur web est démarré. Sur le client, un navigateur est ouvert. |
| **Scénario** | Sur le client, dans le navigateur, taper **10.54.0.100** dans la barre de navigation. |
| **Résultats attendus** | Affichage de la page web |
| **Résultats obtenus** | Affichage de la page web |
| **OK / NOK** | ✅ OK |
| **Rapport de test** | Testé par : Julien — Le 24/11/2025 |
| **Total** | 100/100% — Seuil de conformité 100% |

---

### 11.2. Plan de test — Site web interne

| Champ | Détail |
|-------|--------|
| **Test Fonctionnel** | [CT-FUNC] Test d'installation de l'application |
| **Objectif** | Afficher une page web à travers un navigateur internet |
| **Éléments à tester** | Serveur Web externe |
| **Prérequis** | Une station sous Debian 12 avec Apache2 et une station cliente sous Windows. Les deux stations ne sont pas sur le même réseau mais communiquent entre elles. Sur le client, un navigateur est ouvert et le serveur web est démarré. |
| **Initialisation** | Les deux postes sont sous tension et le serveur web est démarré. Sur le client, un navigateur est ouvert. |
| **Scénario** | Sur le client, dans le navigateur, taper **200.200.200.200** dans la barre de navigation. |
| **Résultats attendus** | Affichage de la page web |
| **Résultats obtenus** | Affichage de la page web |
| **OK / NOK** | ✅ OK |
| **Rapport de test** | Testé par : Evan — Le 24/11/2025 |
| **Total** | 100/100% — Seuil de conformité 100% |

---

### 11.3. Plan de test — VLAN

| Champ | Détail |
|-------|--------|
| **Test Fonctionnel** | [CT-FUNC] Test d'installation de l'application |
| **Objectif** | Tester la non communication inter-VLAN |
| **Éléments à tester** | Communication inter-VLAN |
| **Prérequis** | Deux postes clients sous Windows 11 |
| **Initialisation** | Les deux postes sont connectés sur des VLANs différents, le cmd d'ouvert sur le poste du VLAN Volley à l'adresse 172.16.0.3 et le poste du VLAN Escrime à l'adresse 172.16.64.2 |
| **Scénario** | |

| Id | Démarche | Résultats attendus | Résultats obtenus | OK/NOK |
|----|----------|-------------------|-------------------|--------|
| 1 | Le poste du VLAN Volley tape la commande `ping 172.16.64.2` | Échec du ping (pas de communication inter-VLAN) | Échec du ping | ✅ OK |
| 2 | Le poste du VLAN Escrime tape la commande `ping 172.16.64.2` | Succès du ping (même VLAN) | Succès du ping | ✅ OK |

**Total : 100/100% — Seuil de conformité 100%**
**Rapport de test** : Testé par Mathis — Le 24/11/2025

---

### 11.4. Plan de test — DHCP

| Champ | Détail |
|-------|--------|
| **Test Fonctionnel** | [CT-FUNC] Test d'installation de l'application |
| **Objectif** | Tester la distribution d'adresses |
| **Éléments à tester** | DHCP |
| **Prérequis** | Un serveur DHCP allumé, une machine cliente sous Windows 11 |
| **Initialisation** | Le serveur DHCP est allumé et le client Windows est en configuration dynamique |

| Id | Démarche | Résultats attendus | Résultats obtenus | OK/NOK |
|----|----------|-------------------|-------------------|--------|
| 1 | Sur la machine Windows branchée sur le VLAN Administration, le cmd est ouvert et l'utilisateur tape la commande `ipconfig /all` | Adresse IP dans la plage VLAN Admin | Adresse IP attribuée | ✅ OK |
| 2 | Sur la machine Windows branchée sur le VLAN Volley, commande `ipconfig /all` | Adresse IP dans la plage VLAN Volley | Adresse IP attribuée | OK |
| 3 | Sur la machine Windows branchée sur le VLAN Escrime, commande `ipconfig /all` | Adresse IP dans la plage VLAN Escrime | Adresse IP attribuée | OK |
| 4 | Sur la machine Windows branchée sur le VLAN Wifi, commande `ipconfig /all` | Adresse IP dans la plage VLAN Wifi | Adresse IP attribuée | OK |

**Total : 100/100% — Seuil de conformité 100%**
**Rapport de test** : Testé par Julien — Le 24/11/2025

---

### 11.5. Plan de test — NAT/PAT

| Champ | Détail |
|-------|--------|
| **Test Fonctionnel** | [CT-FUNC] Test d'installation de l'application |
| **Objectif** | Translater les adresses IP |
| **Éléments à tester** | NAT/PAT |
| **Prérequis** | Un routeur Cisco (Routeur_MDS49) allumé, une machine Windows contenant le logiciel PuTTY |
| **Initialisation** | Une connexion SSH a été créée entre la machine Windows et le routeur au niveau 1, c'est-à-dire en tant qu'utilisateur, une machine précédemment accédée au serveur web externe. |

| Id | Démarche | Résultats attendus | Résultats obtenus | OK/NOK |
|----|----------|-------------------|-------------------|--------|
| 1 | Sur la machine Windows, dans la fenêtre PuTTY, taper la commande `show ip nat translations` | Affichage des traductions NAT actives | Traductions NAT visibles | ✅ OK |

**Total : 100/100% — Seuil de conformité 100%**
**Rapport de test** : Testé par Mathis — Le 24/11/2025

---

## 12. Captures d'Écran

Les captures suivantes documentent les configurations et résultats réels :

- `Capture_routeur_MDS49_NAT_PAT.png` — Configuration NAT/PAT du routeur MDS49
- `Capture_switch_part1.png` — Configuration du switch (partie 1)
- `Capture_switch_part2.png` — Configuration du switch (partie 2)
- `IMG_2584.jpeg` — Photo de l'infrastructure physique
- `UO_Bureaux_Administratifs.jpeg` — OU Bureaux Administratifs dans l'AD
- `UO_Comité_Escrime.jpeg` — OU Comité Escrime dans l'AD
- `UO_Comité_Volley.jpeg` — OU Comité Volley dans l'AD
- `UO_Partenaire.jpeg` — OU Partenaires dans l'AD

---

*Document réalisé par ROUVREAU Mathis, RAIMBAULT Evan et TOUZEAU Julien — SIO2 — MDS49 PPE3*
