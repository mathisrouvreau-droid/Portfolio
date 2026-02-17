# Optimisation de la Gestion du Parc Informatique
**MACODEMY** — Windows Server 2019 / Windows 10 / Debian / Cisco

> *Hugo, Mathis et Evan – Mise en place d'une administration MACODEMY*

---

## Sommaire

1. [Présentation](#présentation)
2. [Répartition des tâches](#répartition-des-tâches)
3. [Schématisation de la situation](#schématisation-de-la-situation)
4. [Mise en place du serveur Windows 2019](#mise-en-place-du-serveur-windows-2019)
5. [Mise en place du serveur Web sous Debian](#mise-en-place-du-serveur-web-sous-debian)
6. [Configuration des routeurs et switchs](#configuration-des-routeurs-et-switchs)
7. [Installation et intégration des postes clients](#installation-et-intégration-des-postes-clients)
8. [Résultat du projet sur un poste type](#résultat-du-projet-sur-un-poste-type)

---

## Présentation

Nous avons conçu un réseau pour l'établissement MACODEMY. Notre réseau est composé de 3 services (Administratif, Enseignants et Etudiants, divisés chacun en VLAN séparés). Nous possédons également un DMZ où se situe un serveur Web sous Debian.

Pour la gestion du parc informatique, nous avons un serveur sous Windows Server 2019 qui contient :
- un **Active Directory** pour la gestion des utilisateurs,
- un service **DHCP** pour distribuer des adresses IP automatiquement aux postes en fonction de leur VLAN,
- un service **DNS** pour rediriger les utilisateurs qui vont sur http://macodemy.local sur le serveur Web situé en DMZ.

Sur le serveur Windows Server 2019, nous avons également ajouté des **GPO** pour définir un fond d'écran personnalisé, ainsi qu'une GPO qui permet d'installer les navigateurs Mozilla Firefox et Google Chrome automatiquement.

Les éléments sont connectés via des switchs et des routeurs administrables.

Chaque personne de l'établissement possède un nom d'utilisateur sous la forme `nomp` et un mot de passe de première connexion : **`premco*963`**. Chaque personne possède un lecteur réseau **Perso** pour y stocker ses documents personnels, ainsi qu'un répertoire commun avec son service accessible en lecture/écriture. Il existe également un répertoire **Ressources**, dont :
- les administrateurs ont un contrôle total,
- les enseignants ont un droit de lecture/écriture,
- les étudiants ont un droit de lecture seulement.

---

## Répartition des tâches

### Planning prévu

| Étapes du parcours | Sem. 1 | Sem. 2 | Sem. 3 | Sem. 4 | Sem. 5 | Sem. 6 | Sem. 7 |
|---|---|---|---|---|---|---|---|
| Schéma réseaux logique | Evan | | | | | | |
| Maquette sur Packet Tracer | | Evan, Hugo, Mathis | | | | | Evan, Hugo, Mathis |
| Serveur AD WinServ2019 | | | | Hugo | | | |
| Création serveur web Debian | | | | Mathis | | | |
| Config des routeurs (VLAN, DMZ, Routage, OSPF, ACL) | | | | | Evan, Mathis | | |
| Création des clients | | | | Evan, Mathis | | | |
| Phase de test | | | | | | Evan, Hugo, Mathis | |
| Création de la doc | | | Hugo | | | | |

### Planning réalisé

| Étapes du parcours | Sem. 1 | Sem. 2 | Sem. 3 | Sem. 4 | Sem. 5 | Sem. 6 | Sem. 7 |
|---|---|---|---|---|---|---|---|
| Schéma réseaux logique | Evan | | | | | | |
| Maquette sur Packet Tracer | | Evan, Hugo, Mathis | | | | | Evan, Hugo, Mathis |
| Serveur AD WinServ2019 | | | | Hugo | | | |
| Création serveur web Debian | | | Mathis | | | | |
| Config des routeurs (VLAN, DMZ, Routage, OSPF, ACL) | | | | | Evan, Mathis | | |
| Création des clients | | | Evan, Mathis | | | | |
| Phase de test | | | | | | Evan, Hugo, Mathis | |
| Création de la doc | | | Hugo | | | | |

> **Note :** Mathis était absent en entreprise lors de la semaine 7.

---

## Schématisation de la situation

```
Réseau Local
  Adresse réseau : 172.16.0.0 /16
  VLAN 10 (Administratif) : 172.16.10.0
  VLAN 20 (Enseignants)   : 172.16.20.0
  VLAN 30 (Étudiant)      : 172.16.30.0

  [Routeur Local] 172.16.255.253
    └─ [Switch Local]
         ├─ Fa0/1 → VLAN 10 → PC Administratif
         ├─ Fa0/2 → VLAN 20 → PC Enseignants
         └─ Fa0/3 → VLAN 30 → PC Étudiant
    └─ [Server DHCP/AD/DNS] 172.16.1.1

DMZ
  192.168.10.1
  [Serveur Web Debian] → [Switch DMZ] → [Routeur DMZ] 172.16.255.254 / 192.168.10.254

[Routeur DMZ] ←→ [FAI] (Gig0/0)
```

---

## Mise en place du serveur Windows 2019

### Arborescence

```
macodemy.local
├── UO_ADMINISTRATIF
│   └── GR_ADMINISTRATIF → Rep. Administratifs
│       ├── Evan RAIMBAULT (raimbaulte) → Rep. Perso
│       ├── Hugo PASDOIT (pasdoith) → Rep. Perso
│       └── Mathis ROUVREAU (mouvreau) → Rep. Perso
├── UO_ENSEIGNANTS
│   └── GR_ENSEIGNANTS → Rep. Enseignants
│       ├── Francis DUBOIS (duboisf) → Rep. Perso
│       └── Madeleine FEUILLE (feuillem) → Rep. Perso
└── UO_ETUDIANTS
    └── GR_ETUDIANTS → Rep. Etudiants
        ├── Bernard BRIQUE (briqueb) → Rep. Perso
        └── Léo TARTE (tartel) → Rep. Perso
```

### Configuration du serveur

#### Installation du service AD DS

**Étape 1 – Ajouter le service AD DS**

Le service AD DS permet principalement de gérer les utilisateurs.

**Étape 2 – Promouvoir le serveur en contrôleur de domaine**

Paramètres importants :
- Opération de déploiement : **Ajouter une nouvelle forêt**
- Nom de domaine racine : `macodemy.local`
- Nom de domaine NetBIOS : `macodemy.local`

**Étape 3 – Créer les U.O, groupes et utilisateurs**

Création des Unités d'Organisation, des groupes et des utilisateurs afin que chaque personne puisse accéder à un poste et appartenir à un groupe.

**Étape 4 – Créer les répertoires Perso**

Afin que chaque utilisateur puisse enregistrer ses documents d'entreprise, on lui crée un espace Perso accessible uniquement par lui. Dans le lecteur D, on crée un dossier `Perso` partagé avec le groupe concerné, avec désactivation de l'héritage pour limiter l'accès individuel.

Dans le champ **« Dossier de base, connecter à »** du profil utilisateur, on entre :
```
\\WINSERVACODEMY\Perso\%username%
```

**Étape 5 – Créer les répertoires communs**

Des scripts de session sont créés pour mapper les lecteurs réseau partagés. Exemple de contenu d'un script :
```bat
NET USE K: \\WINSERVACODEMY\Commun_chefs_production
```

Les scripts sont copiés dans le dossier `NETLOGON` et référencés dans le champ **« Script d'ouverture de session »** du profil utilisateur.

Contenu du lecteur D :
```
D:\
├── Ressources
├── Perso
├── images
├── Commun_Etudiants
├── Commun_Enseignants
├── Commun_Administratif
└── Applications
```

---

#### Configuration du service DHCP

**Étape 1 – Installer le service DHCP**

Dans le gestionnaire de serveur : *Ajouter des rôles et des fonctionnalités* → **Serveur DHCP**.

**Étape 2 – Configuration des étendues**

Pour chaque VLAN, créer une nouvelle étendue via clic-droit sur **IPv4** → **Nouvelle étendue**.

| VLAN | Étendue | Plage IP |
|------|---------|----------|
| VLAN 10 | 172.16.10.0 | 172.16.10.1 – 172.16.10.200 |
| VLAN 20 | 172.16.20.0 | 172.16.20.x – … |
| VLAN 30 | 172.16.30.0 | 172.16.30.x – … |

Paramètres importants : plage d'adresses IP, masque de sous-réseau (`255.255.0.0`), adresse de passerelle (par VLAN).

---

#### Configuration du service DNS

**Étape 1 – Installer le service DNS**

Dans le gestionnaire de serveur : *Ajouter des rôles et des fonctionnalités* → **Serveur DNS**.

**Étape 2 – Configuration d'une nouvelle zone**

Pour rediriger `http://macodemy.local` vers `192.168.10.1` :
- Clic-droit sur **Zones de recherche directe** → **Nouvelle zone**
- Nom de la zone : `macodemy.local`

**Étape 3 – Enregistrements créés**

Deux enregistrements de type **Hôte (A)** sont créés :
- `macodemy.local` (dossier parent) → `192.168.10.1`
- `www` → `192.168.10.1`

Ainsi, `http://macodemy.local` et `http://www.macodemy.local` redirigent vers le serveur Web Debian situé en DMZ.

---

## Mise en place du serveur Web sous Debian

L'adresse IP de la machine est configurée en statique : **192.168.10.1**

**Installation d'Apache2 :**

```bash
# Mise à jour des paquets
sudo apt update

# Installation d'Apache2
sudo apt install apache2
```

**Configuration du nom de machine :**

```bash
# Modifier le nom d'hôte
nano /etc/hostname

# Associer le nom à l'IP locale
nano /etc/hosts
# Ajouter : 127.0.0.1   <nom_machine>
```

**Déploiement de la page web :**

Les fichiers de la page web sont placés dans `/var/www/html`.

**Configuration du VirtualHost :**

```bash
# Copier ou modifier le fichier de configuration
nano /etc/apache2/sites-available/000-default.conf
```

Contenu à adapter :
```apache
ServerName macodemy.local
DocumentRoot /var/www/html
```

Le site est ensuite accessible via `127.0.0.1`, `localhost` ou `192.168.10.1`.

---

## Configuration des routeurs et switchs

### Logiciel

Pour configurer les switchs et les routeurs, le logiciel **PuTTY** est utilisé pour se connecter via le port Console.

### Routeur Local

Configuration des interfaces virtuelles (sous-interfaces pour chaque VLAN), routes statiques, ACL, routage dynamique OSPF et agent relais DHCP.

**Interfaces virtuelles et ip route :**

```cisco
interface GigabitEthernet0/0
 ip address 172.16.1.254 255.255.255.0
 duplex auto
 speed auto

interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 172.16.10.254 255.255.255.0
 ip helper-address 172.16.1.1

interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 172.16.20.254 255.255.255.0
 ip helper-address 172.16.1.1

interface GigabitEthernet0/0.30
 encapsulation dot1Q 30
 ip address 172.16.30.254 255.255.255.0
 ip helper-address 172.16.1.1

interface Serial0/0/0
 ip address 172.16.255.253 255.255.255.252
 ip access-group 104 in

ip route 0.0.0.0 0.0.0.0 172.16.255.254
ip route 192.168.10.0 255.255.255.0 172.16.255.254
```

**Configuration des ACL** (bloquent tous les flux sauf accès au serveur Web, DHCP, DNS, AD) :

```cisco
access-list 101 deny   ip 172.16.30.0 0.0.0.255 172.16.10.0 0.0.0.255
access-list 101 permit ip any any
access-list 102 permit ip 172.16.30.0 0.0.0.255 172.16.30.0 0.0.0.255
access-list 102 permit ip 172.16.30.0 0.0.0.255 172.16.20.0 0.0.0.255
access-list 102 permit ip any any
access-list 103 permit tcp 172.16.0.0 0.0.255.255 host 192.168.10.1 eq www
access-list 103 permit tcp 172.16.0.0 0.0.255.255 host 192.168.10.1 eq 443
```

### Switch Local

Configuration des VLAN et du Trunk.

**Association d'un VLAN à un port :**

```cisco
interface FastEthernet0/1
 switchport access vlan 10
 switchport mode access

interface FastEthernet0/2
 switchport access vlan 20
 switchport mode access

interface FastEthernet0/3
 switchport access vlan 30
 switchport mode access
```

### Routeur DMZ

Configuration des adresses IP, routes statiques et OSPF.

```cisco
interface GigabitEthernet0/0
 ip address 192.168.10.254 255.255.255.0
 duplex auto
 speed auto

interface GigabitEthernet0/1
 no ip address
 shutdown

interface Serial0/0/0
 ip address 172.16.255.254 255.255.255.252

interface Serial0/0/1
 no ip address
 shutdown
 clock rate 2000000

router ospf 1
 network 172.0.0.0 0.255.255.255 area 0

ip route 0.0.0.0 0.0.0.0 172.16.255.253
ip route 172.16.1.0 255.255.255.0 172.16.255.253
ip route 172.16.10.0 255.255.255.0 172.16.255.253
ip route 172.16.20.0 255.255.255.0 172.16.255.253
ip route 172.16.30.0 255.255.255.0 172.16.255.253
```

### Switch DMZ

Aucune configuration particulière (un seul poste connecté : le serveur Web).

---

## Installation et intégration des postes clients

### Installation

1. Créer une clé USB bootable de **Windows 10 (22H2)** à partir de l'ISO Microsoft via **Rufus**.
2. Démarrer le poste sur la clé USB via le BIOS.
3. Réaliser une installation en **UEFI**.

### Intégration au domaine (WS2019)

Chaque poste est dans un VLAN différent et obtient son adresse IP automatiquement via le serveur DHCP.

**Étape 1 – Définir le serveur WinServ2019 comme DNS préféré**

`Panneau de configuration` → `Réseau et Internet` → `Centre Réseau et partage` → `Modifier les paramètres de la carte` → clic sur la carte réseau → `Propriétés` → `Protocole Internet version 4 (TCP/IPv4)` → cocher **Utiliser l'adresse de serveur DNS suivante** :

- Serveur DNS préféré : `172.16.1.1`

**Étape 2 – Joindre le PC au domaine**

`Clic droit sur Ordinateur` → `Propriétés` → `Modifier les paramètres` → `Modifier` → sélectionner **Domaine** → entrer : `MACODEMY` → valider avec les identifiants administrateur du domaine.

---

## Résultat du projet sur un poste type

Sur un poste client intégré au domaine, on retrouve dans l'explorateur de fichiers **3 lecteurs réseau** :

| Lecteur | Nom | Accès |
|---------|-----|-------|
| K: | Commun_etudiants (`\\WINSERVACODEMY`) | Lecture/Écriture (groupe) |
| P: | `tartel` (`\\WINSERVACODEMY`) – *Perso* | Accès exclusif à l'utilisateur |
| R: | Ressources (`\\WINSERVACODEMY`) | Lecture seule (étudiants) |

Le fond d'écran personnalisé MACODEMY est appliqué via GPO, et les navigateurs Firefox et Chrome sont installés automatiquement.

### Accès au site web interne

Depuis n'importe quel poste du réseau, la saisie de `http://macodemy.local` ou `http://www.macodemy.local` dans un navigateur affiche la page web hébergée sur le serveur Debian en DMZ.

### Test de cloisonnement VLAN (PING)

Les postes de VLAN différents ne peuvent pas communiquer directement entre eux (les ACL bloquent le trafic inter-VLAN non autorisé) :

```
C:\Users\pasdoith> ping 172.16.10.1

Envoi d'une requête 'Ping' 172.16.10.1 avec 32 octets de données :
Délai d'attente de la demande dépassé.
Délai d'attente de la demande dépassé.
Délai d'attente de la demande dépassé.
Délai d'attente de la demande dépassé.

Statistiques Ping pour 172.16.10.1 :
    Paquets : envoyés = 4, reçus = 0, perdus = 4 (perte 100%)

C:\Users\pasdoith> ipconfig
  Suffixe DNS : macodemy.local
  Adresse IPv4 : 172.16.30.2
  Masque de sous-réseau : 255.255.255.0
  Passerelle par défaut : 172.16.30.254
```

---

*Document réalisé par Hugo, Mathis et Evan — MACODEMY*
