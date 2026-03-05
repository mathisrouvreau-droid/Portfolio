# Documentation — Déploiement Vaultwarden en interne
**FSP Groupe — Service Informatique**  
**Rédigé par :** mrouvreau@fsp-groupe.com  
**Date :** Février 2026

---

## Sommaire

1. [Présentation](#présentation)
2. [Prérequis](#prérequis)
3. [Architecture](#architecture)
4. [Déploiement Docker](#déploiement-docker)
5. [Configuration LDAP](#configuration-ldap)
6. [Configuration Traefik](#configuration-traefik)
7. [Déploiement de l'extension Edge via Intune](#déploiement-de-lextension-edge-via-intune)
8. [Administration Vaultwarden](#administration-vaultwarden)
9. [Points importants et sécurité](#points-importants-et-sécurité)

---

## 1. Présentation

**Vaultwarden** est une implémentation open source et légère du serveur Bitwarden. Il permet d'héberger en interne un gestionnaire de mots de passe sécurisé pour l'ensemble des collaborateurs.

| Élément | Détail |
|---|---|
| Solution | Vaultwarden (compatible Bitwarden) |
| URL interne | https://bitwarden.ad.fsp-groupe.com |
| Accès admin | https://bitwarden.ad.fsp-groupe.com/admin |
| Reverse proxy | Traefik |
| Synchronisation comptes | LDAP (Active Directory) |
| Déploiement extension | Microsoft Intune |

---

## 2. Prérequis

Avant de déployer Vaultwarden, les éléments suivants doivent être en place :

- **Docker** et **Docker Compose** installés sur le serveur hôte
- **Traefik** configuré avec un réseau Docker `automat_internal` et un certificate resolver `internal` (PKI interne)
- **Certificat SSL interne** valide pour le domaine `bitwarden.ad.fsp-groupe.com`
- **Active Directory** accessible pour la synchronisation LDAP
- **Variable d'environnement** `DOMAIN_NAME` définie sur le serveur hôte (ex: `ad.fsp-groupe.com`)
- **Microsoft Intune** pour le déploiement de l'extension sur les postes

---

## 3. Architecture

```
Postes clients (Edge)
        │
        │ HTTPS
        ▼
    Traefik (Reverse Proxy)
        │ TLS terminé / certificat PKI interne
        ▼
    Vaultwarden (port 80 interne)
        │
        ├── Volume : vaultwarden_data (données persistantes)
        │
        └── Vaultwarden LDAP Sync
                │
                └── Active Directory (synchronisation des comptes)
```

---

## 4. Déploiement Docker

### 4.1 Structure des fichiers

```
/docker/automat/
├── docker-compose.yml
└── vaultwarden_ldap/
    └── config.toml
```

### 4.2 Fichier docker-compose.yml

```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    environment:
      - DOMAIN=https://bitwarden.${DOMAIN_NAME}
      - ADMIN_TOKEN=zEHjSu4PcQskIGHPo3b8
      - SIGNUPS_ALLOWED=false
      - INVITATIONS_ALLOWED=true
      - LOG_LEVEL=info
    volumes:
      - vaultwarden_data:/data
    networks:
      - automat_internal
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.vaultwarden.rule=Host(`bitwarden.${DOMAIN_NAME}`)"
      - "traefik.http.routers.vaultwarden.entrypoints=websecure"
      - "traefik.http.routers.vaultwarden.tls=true"
      - "traefik.http.routers.vaultwarden.tls.certresolver=internal"
      - "traefik.http.services.vaultwarden.loadbalancer.server.port=80"

  vaultwarden_ldap:
    image: vividboarder/vaultwarden_ldap:latest
    container_name: vaultwarden_ldap
    restart: unless-stopped
    depends_on:
      - vaultwarden
    volumes:
      - /docker/automat/vaultwarden_ldap/config.toml:/config.toml:ro
    networks:
      - automat_internal

volumes:
  vaultwarden_data:

networks:
  automat_internal:
    external: true
    name: automat_internal
```

### 4.3 Variables d'environnement importantes

| Variable | Valeur | Description |
|---|---|---|
| `DOMAIN` | https://bitwarden.${DOMAIN_NAME} | URL publique de l'instance |
| `ADMIN_TOKEN` | zEHjSu4PcQskIGHPo3b8 | Token d'accès à l'interface d'administration |
| `SIGNUPS_ALLOWED` | false | Inscription libre désactivée |
| `INVITATIONS_ALLOWED` | true | Invitation par l'admin uniquement |
| `LOG_LEVEL` | info | Niveau de journalisation |

> ⚠️ **Sécurité :** L'`ADMIN_TOKEN` doit être conservé de manière sécurisée. Ne jamais le partager ni le versionner dans un dépôt Git public.

### 4.4 Démarrage du service

```bash
# Se placer dans le répertoire
cd /docker/automat/

# Démarrer les conteneurs
docker compose up -d

# Vérifier que les conteneurs tournent
docker compose ps

# Consulter les logs
docker compose logs -f vaultwarden
```

---

## 5. Configuration LDAP

La synchronisation LDAP est assurée par le conteneur `vaultwarden_ldap` via le fichier `config.toml`.

### 5.1 Fichier config.toml

```toml
# URL de l'instance Vaultwarden
vaultwarden_url = "http://vaultwarden"

# Token admin Vaultwarden
vaultwarden_admin_token = "zEHjSu4PcQskIGHPo3b8"

# Activer la création des utilisateurs
create_if_not_exists = true

# Configuration LDAP
ldap_host = "ldap://ton-serveur-ad.fsp-groupe.com"
ldap_bind_dn = "CN=svc-vaultwarden,OU=ServiceAccounts,DC=ad,DC=fsp-groupe,DC=com"
ldap_bind_password = "MotDePasseServiceAccount"
ldap_base_dn = "OU=Utilisateurs,DC=ad,DC=fsp-groupe,DC=com"
ldap_filter = "(&(objectClass=person)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))"
ldap_mail_field = "mail"
```

> 💡 Adapte les valeurs `ldap_host`, `ldap_bind_dn`, `ldap_bind_password` et `ldap_base_dn` à ton environnement Active Directory.

---

## 6. Configuration Traefik

Vaultwarden utilise le réseau Docker `automat_internal` et est exposé via Traefik avec les paramètres suivants :

| Paramètre | Valeur |
|---|---|
| Règle d'hôte | `bitwarden.ad.fsp-groupe.com` |
| Entrypoint | `websecure` (HTTPS 443) |
| TLS | Activé via certificate resolver `internal` |
| Port interne | 80 |

Aucune configuration supplémentaire dans Traefik n'est nécessaire, tout est géré via les labels Docker du compose.

---

## 7. Déploiement de l'extension Edge via Intune

### 7.1 Profil Settings Catalog

**Chemin :** Intune > Devices > Configuration profiles > Create profile  
**Nom du profil :** `Edge - Bitwarden Force Install`  
**Plateforme :** Windows 10 and later  
**Type :** Settings catalog

Paramètres configurés :

| Paramètre | Valeur |
|---|---|
| Control which extensions are installed silently | Enabled |
| Control which extensions are installed silently (User) | Enabled |
| ID extension | `nngceckbapebfimnlniiiahkandclblb;https://edge.microsoft.com/extensionwebstorebase/v1/crx` |
| Configure extension management settings | Enabled |
| Configure extension management settings (User) | Enabled |

JSON de configuration des extensions :
```json
{
  "nngceckbapebfimnlniiiahkandclblb": {
    "installation_mode": "force_installed",
    "update_url": "https://edge.microsoft.com/extensionwebstorebase/v1/crx",
    "runtime_allowed_hosts": ["https://bitwarden.ad.fsp-groupe.com"]
  }
}
```

### 7.2 Script PowerShell — Préconfiguration du serveur

**Chemin :** Intune > Devices > Scripts > Add > Windows 10 and later  
**Nom :** `Bitwarden - Préconfiguration Vaultwarden`

Paramètres du script :

| Paramètre | Valeur |
|---|---|
| Exécuter avec les credentials de l'utilisateur connecté | Non |
| Appliquer la vérification de signature | Non |
| Exécuter en PowerShell 64 bits | Oui |

Contenu du script :
```powershell
$config = '{"environment":{"base":"https://bitwarden.ad.fsp-groupe.com"}}'

# Ecriture HKLM
$regPathLM = "HKLM:\SOFTWARE\Policies\Microsoft\Edge\3rdparty\extensions\nngceckbapebfimnlniiiahkandclblb\policy"
if (-not (Test-Path $regPathLM)) {
    New-Item -Path $regPathLM -Force | Out-Null
}
Set-ItemProperty -Path $regPathLM -Name "serverConfig" -Value $config -Type String

# Ecriture HKCU
$regPathCU = "HKCU:\SOFTWARE\Policies\Microsoft\Edge\3rdparty\extensions\nngceckbapebfimnlniiiahkandclblb\policy"
if (-not (Test-Path $regPathCU)) {
    New-Item -Path $regPathCU -Force | Out-Null
}
Set-ItemProperty -Path $regPathCU -Name "serverConfig" -Value $config -Type String

Write-Output "Configuration Bitwarden appliquée avec succès."
```

### 7.3 Assignation

Les deux éléments (profil + script) sont assignés au groupe **GGS_FSP_Informatique** pour les tests, avant déploiement à l'ensemble des utilisateurs.

---

## 8. Administration Vaultwarden

### 8.1 Accès au panneau d'administration

```
https://bitwarden.ad.fsp-groupe.com/admin
Token : zEHjSu4PcQskIGHPo3b8
```

### 8.2 Inviter un utilisateur

1. Connectez-vous au panneau d'administration
2. Allez dans **Users**
3. Cliquez sur **Invite User**
4. Entrez l'adresse email du collaborateur
5. Le collaborateur reçoit un email d'invitation avec un lien de création de compte

> ⚠️ Les inscriptions libres sont désactivées (`SIGNUPS_ALLOWED=false`). Seul l'administrateur peut créer des comptes via invitation.

---

## 9. Points importants et sécurité

| Point | Détail |
|---|---|
| **Mot de passe maître** | Non réinitialisable et non renouvelable — l'utilisateur doit absolument le retenir |
| **ADMIN_TOKEN** | À conserver précieusement, donne accès total à l'administration |
| **Sauvegardes** | Le volume Docker `vaultwarden_data` doit être sauvegardé régulièrement |
| **Accès réseau** | L'instance n'est accessible que depuis le réseau interne ou VPN |
| **Certificat SSL** | Certificat PKI interne — doit être déployé sur tous les postes clients |
| **Inscriptions** | Désactivées, uniquement par invitation admin |

### 9.1 Sauvegarde des données

```bash
# Sauvegarder le volume vaultwarden_data
docker run --rm \
  -v vaultwarden_data:/data \
  -v /backup:/backup \
  alpine tar czf /backup/vaultwarden_$(date +%Y%m%d).tar.gz /data
```

---

*Documentation rédigée par le Service Informatique FSP Groupe — Février 2026*
