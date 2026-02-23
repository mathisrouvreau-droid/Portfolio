# Documentation – Open WebUI + Web Search (SearXNG)

**Déploiement Docker Compose derrière Traefik + Step-CA (ACME)**

**Auteur :** Mathis ROUVREAU
**Organisation :** FSP Groupe / AGIR RECOUVREMENT
**Date :** 05/02/2026

---

## 1. Contexte et objectifs

Cette documentation décrit le déploiement et la configuration d'une instance Open WebUI exposée en HTTPS derrière Traefik, avec génération automatique de certificats via Step-CA (ACME), et intégration d'une recherche Web basée sur SearXNG (avec Valkey/Redis) et un serveur MCP pour l'interfaçage.

Le document est aligné sur le docker-compose fourni (Traefik, n8n, Open WebUI, SearXNG, MCP SearXNG, Kimai).

### 1.1. Périmètre

- Reverse-proxy Traefik (HTTP→HTTPS, dashboard, provider Docker, provider file).
- ACME interne via Step-CA (certresolver : internal).
- Open WebUI (stockage persistant, confiance CA interne).
- Web Search via SearXNG (+ Valkey) et publication d'un endpoint MCP.
- n8n et Kimai : inclus comme services du stack (annexe / points d'attention).

### 1.2. Hypothèses

Le compose utilise la variable `${DOMAIN_NAME}` pour construire les FQDN publics. Dans la suite, on utilise les exemples suivants :

- `DOMAIN_NAME=ad.fsp-groupe.com` (exemple cohérent avec stepca.ad.fsp-groupe.com).
- Traefik dashboard : `traefik.ad.fsp-groupe.com` (FQDN explicitement présent).

---

## 2. Prérequis

### 2.1. Serveur hôte

- Linux (recommandé : Debian/Ubuntu) avec accès sudo.
- Docker Engine + plugin Docker Compose installés.
- Accès réseau vers Step-CA (HTTPS 9000) et vers les clients (80/443).
- Espace disque suffisant pour les volumes (Open WebUI, Valkey, MySQL).

#### Installation Docker (exemple Debian/Ubuntu)

```bash
# Exemple (adapter selon votre distribution)
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
# Docker Engine + compose plugin
# (référentiel officiel recommandé)
```

### 2.2. DNS et URLs

| **Service**      | **FQDN (via `${DOMAIN_NAME}`)**       | **Remarque**                     |
|------------------|----------------------------------------|----------------------------------|
| Traefik dashboard | `traefik.ad.fsp-groupe.com`           | Route dédiée (Host rule)         |
| n8n              | `n8n.${DOMAIN_NAME}`                  | Automatisation / webhooks        |
| Open WebUI       | `webui.${DOMAIN_NAME}`                | Interface Web                    |
| SearXNG          | `search.${DOMAIN_NAME}`               | Moteur de recherche / API        |
| MCP SearXNG      | `mcp-searxng.${DOMAIN_NAME}`          | Bridge MCP vers SearXNG          |
| Kimai            | `kimai.${DOMAIN_NAME}`                | Suivi de temps (annexe)          |
| Step-CA          | `stepca.ad.fsp-groupe.com:9000`       | CA interne ACME (hors compose)   |

### 2.3. Ports et flux réseau

| **Port**   | **Entrée**    | **Destination**  | **Usage**                        |
|------------|---------------|------------------|----------------------------------|
| 80/tcp     | Internet/LAN  | Traefik          | Redirection forcée vers HTTPS    |
| 443/tcp    | Internet/LAN  | Traefik          | Entrée TLS vers les services     |
| 5678/tcp   | Interne       | n8n              | Port applicatif (via Traefik)    |
| 8080/tcp   | Interne       | open-webui       | Port applicatif (via Traefik)    |
| 8080/tcp   | Interne       | searxng          | Port applicatif (via Traefik)    |
| 3000/tcp   | Interne       | mcp-searxng      | API MCP (via Traefik)            |
| 6379/tcp   | Interne       | searxng-redis    | Cache SearXNG (Valkey)           |
| 3306/tcp   | Interne       | kimai_bdd        | MySQL (Kimai)                    |
| 8001/tcp   | Interne       | kimai            | Port applicatif (via Traefik)    |

Les services applicatifs n'exposent pas de ports sur l'hôte : seul Traefik publie 80/443. Tout le trafic applicatif passe par le réseau Docker internal.

### 2.4. Préparation des répertoires et fichiers

- Créer l'arborescence `/docker/automat/` pour Traefik (dynamic, acme.json, certs).
- Créer `/docker/automat/searxng/settings.yml` (configuration minimale obligatoire).
- Déployer le certificat racine interne `root_ca.crt` dans `/docker/automat/certs/root_ca.crt`.

Exemple de structure :

```
/docker/automat/
├── acme.json
├── dynamic/
├── certs/
│   └── root_ca.crt
└── searxng/
    └── settings.yml
```

Points importants :

- `acme.json` doit être présent et protégé (`chmod 600`) sinon Traefik refusera d'écrire le stockage ACME.
- Le `root_ca.crt` est injecté dans Traefik et Open WebUI pour permettre la confiance vers Step-CA.

---

## 3. Architecture (vue d'ensemble)

Le schéma logique est le suivant : le client accède en HTTPS à Traefik (entrypoint websecure). Traefik résout un certificat via Step-CA (ACME) et route vers les conteneurs sur le réseau internal.

- **Traefik** : reverse-proxy + TLS + ACME interne + redirection HTTP→HTTPS.
- **Open WebUI** : application Web (port 8080 interne) avec stockage persistant.
- **SearXNG** : moteur Web + cache, dépendant de Valkey/Redis.
- **MCP SearXNG** : endpoint MCP (port 3000 interne) parlant à SearXNG (`http://searxng:8080`).
- **n8n** : automatisations (webhooks via Traefik).
- **Kimai + MySQL** : suivi de temps (annexe).

### 3.1. Réseaux Docker

| **Réseau** | **Subnet**      | **Qui y est connecté** | **Rôle**                                          |
|------------|-----------------|------------------------|---------------------------------------------------|
| proxy      | 172.30.0.0/16   | traefik                | Optionnel : séparation de trafic / futur usage     |
| internal   | 172.31.0.0/16   | tous les services      | Communication inter-services + backend Traefik     |

---

## 4. Déploiement (Docker Compose)

### 4.1. Variables d'environnement (.env)

Le compose utilise au minimum :

```env
DOMAIN_NAME=ad.fsp-groupe.com
```

Recommandation : stocker les secrets dans un `.env` non versionné (ou un gestionnaire de secrets).

### 4.2. Démarrage

1. Se placer dans le répertoire du `docker-compose.yml`.
2. Créer les fichiers requis (`acme.json`, `settings.yml` SearXNG, `root_ca.crt`).
3. Démarrer la stack :
4. Vérifier l'état des conteneurs :

```bash
docker compose up -d
docker compose ps
```

---

## 5. Traefik – Reverse proxy + TLS (Step-CA ACME)

### 5.1. Points clés de configuration

- Activation du provider Docker (`exposedByDefault=false`) : seuls les conteneurs labellisés sont exposés.
- Activation du provider file : `/etc/traefik/dynamic` (pour middlewares/headers).
- EntryPoints : `web` (:80) et `websecure` (:443) + redirection HTTP→HTTPS.
- CertResolver `internal` : ACME pointant vers Step-CA (tlschallenge).
- Injection de la CA interne dans le conteneur (`root_ca.crt` → `stepca.crt`, `update-ca-certificates`).

### 5.2. Vérifications rapides

- Accès dashboard : `https://traefik.ad.fsp-groupe.com`
- Logs Traefik en DEBUG : utile pour diagnostiquer ACME/routing.

```bash
docker logs -f traefik
```

### 5.3. Exemple de middleware (fichiers dynamiques)

Le répertoire `/docker/automat/dynamic` peut contenir des middlewares (ex : headers, auth). Exemple (à adapter) :

```yaml
http:
  middlewares:
    security-headers:
      headers:
        frameDeny: true
        contentTypeNosniff: true
        browserXssFilter: true
```

---

## 6. Open WebUI

### 6.1. Publication via Traefik

Le service est publié en HTTPS via `Host(`webui.${DOMAIN_NAME}`)` et le port interne 8080.

### 6.2. Persistance et confiance CA

- Volume `open-webui:/app/backend/data` pour persister la base et les données.
- Injection du `root_ca.crt` pour faire confiance aux services internes en TLS (Step-CA).
- `WEBUI_URL=https://webui.${DOMAIN_NAME}` recommandé pour éviter les soucis de session derrière HTTPS.

### 6.3. Post-configuration (dans l'interface)

- Configurer le provider LLM (ex : Ollama local, OpenAI, Azure OpenAI, etc.).
- Activer/paramétrer la recherche Web (section 9).
- Configurer l'ingestion de documents / RAG (dépôts, uploads, collections).

---

## 7. SearXNG (Web Search) + Valkey

### 7.1. Dépendances et volumes

- **searxng-redis** (Valkey) : stockage cache.
- **SearXNG** : `/docker/automat/searxng` monté dans `/etc/searxng` (`settings.yml`).
- **Cache** : volume `searxng_cache` monté dans `/var/cache/searxng`.

### 7.2. URL publique

La variable `SEARXNG_BASE_URL` est définie à :

```env
SEARXNG_BASE_URL=https://search.${DOMAIN_NAME}/
```

Côté Traefik : `Host(`search.${DOMAIN_NAME}`)` → service searxng port 8080.

### 7.3. Exemple minimal de settings.yml

Le fichier `/docker/automat/searxng/settings.yml` doit exister. Ci-dessous un exemple minimal (à adapter).

```yaml
use_default_settings: true
server:
  secret_key: "CHANGE_ME_LONG_RANDOM"
  limiter: true
  method: "GET"
redis:
  url: redis://searxng-redis:6379/0
```

---

## 8. MCP SearXNG

Le conteneur mcp-searxng expose un endpoint (port 3000) et consomme SearXNG via `SEARXNG_URL=http://searxng:8080`.

- FQDN publié : `https://mcp-searxng.${DOMAIN_NAME}`
- Utile si votre intégration Open WebUI / workflows utilise un connecteur MCP.

---

## 9. Configuration Web Search dans Open WebUI (avec SearXNG)

### 9.1. Endpoint à renseigner

Dans Open WebUI, configurer la recherche Web en pointant vers :

- URL publique : `https://search.${DOMAIN_NAME}`
- Ou URL interne : `http://searxng:8080` (si l'application le permet).

Recommandation : préférer l'URL publique HTTPS si l'application est sensible aux mixed-content.

### 9.2. Tests

- Ouvrir `https://search.${DOMAIN_NAME}` et effectuer une recherche manuelle.
- Vérifier que Open WebUI inclut des sources/citations issues du Web Search.

```bash
curl -I https://search.${DOMAIN_NAME}
curl -I https://webui.${DOMAIN_NAME}
```

---

## 10. n8n (annexe)

n8n est publié via Traefik (`Host(`n8n.${DOMAIN_NAME}`)` → port 5678). Le compose définit `N8N_PROTOCOL=http` et `WEBHOOK_URL=http://n8n.${DOMAIN_NAME}/`.

Point d'attention :

- Si vos webhooks doivent être consommés en HTTPS à l'extérieur, `WEBHOOK_URL` devrait généralement être en `https`.
- `N8N_SECURE_COOKIE=false` peut éviter certains problèmes derrière proxy, mais réduit la sécurité des cookies.

---

## 11. Kimai (annexe)

Kimai (apache) et sa base MySQL sont inclus dans la stack. Kimai est publié via Traefik sur `kimai.${DOMAIN_NAME}`.

Point d'attention :

- Le label Traefik Kimai référence `tls.certresolver=mytlschallenge`, alors que Traefik déclare un resolver nommé `internal`.
- Pour éviter une erreur de certificat, aligner le certresolver Kimai sur `internal` (ou déclarer `mytlschallenge` dans Traefik).

---

## 12. Exploitation et troubleshooting

### 12.1. Commandes utiles

```bash
# Suivi des conteneurs
docker compose ps

# Logs
docker logs -f traefik
docker logs -f open-webui
docker logs -f searxng
docker logs -f mcp-searxng
```

### 12.2. Erreurs fréquentes (checklist)

- **502/404 via Traefik** : vérifier les labels (Host rules) et les ports internes des services.
- **Certificats non générés** : vérifier l'accessibilité Step-CA, la confiance `root_ca.crt`, et les logs Traefik.
- **Boucles HTTP/HTTPS** : vérifier `WEBUI_URL` et les redirections Traefik.
- **SearXNG inaccessible** : vérifier `settings.yml`, dépendance Valkey, et `SEARXNG_BASE_URL`.
- **Kimai** : certresolver incohérent (voir section 11).

---

## 13. Annexes

### 13.1. docker-compose.yml (copie)

```yaml
services:
  traefik:
    image: traefik:latest
    container_name: traefik
    restart: always
    command:
      - sh
      - -c
      - |
        cp /usr/local/share/ca-certificates/root_ca.crt /usr/local/share/ca-certificates/stepca.crt &&
        update-ca-certificates &&
        traefik \
          --log.level=DEBUG \
          --accesslog=true \
          --api.dashboard=true \
          --providers.docker=true \
          --providers.docker.exposedbydefault=false \
          --providers.file.directory=/etc/traefik/dynamic \
          --providers.file.watch=true \
          --entrypoints.web.address=:80 \
          --entrypoints.websecure.address=:443 \
          --entrypoints.websecure.http.tls=true \
          --entrypoints.web.http.redirections.entrypoint.to=websecure \
          --entrypoints.web.http.redirections.entrypoint.scheme=https \
          --entrypoints.web.http.redirections.entrypoint.permanent=true \
          --certificatesresolvers.internal.acme.caServer=https://stepca.ad.fsp-groupe.com:9000/acme/acme/directory \
          --certificatesresolvers.internal.acme.email=admin@fsp-groupe.com \
          --certificatesresolvers.internal.acme.storage=/etc/traefik/acme.json \
          --certificatesresolvers.internal.acme.tlschallenge=true
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /docker/automat/dynamic:/etc/traefik/dynamic:ro
      - /docker/automat/acme.json:/etc/traefik/acme.json
      - /docker/automat/certs/root_ca.crt:/usr/local/share/ca-certificates/root_ca.crt:ro
    networks:
      - proxy
      - internal
    labels:
      - traefik.enable=true
      - traefik.http.routers.traefik.rule=Host(`traefik.ad.fsp-groupe.com`)
      - traefik.http.routers.traefik.entrypoints=websecure
      - traefik.http.routers.traefik.tls=true
      - traefik.http.routers.traefik.service=api@internal

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: always
    depends_on:
      - traefik
    labels:
      - traefik.enable=true
      - traefik.http.routers.n8n.rule=Host(`n8n.${DOMAIN_NAME}`)
      - traefik.http.routers.n8n.entrypoints=websecure
      - traefik.http.routers.n8n.tls=true
      - traefik.http.routers.n8n.tls.certresolver=internal
      - traefik.http.routers.n8n.service=n8n@docker
      - traefik.http.services.n8n.loadbalancer.server.port=5678
    environment:
      - N8N_HOST=n8n.${DOMAIN_NAME}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=http://n8n.${DOMAIN_NAME}/
      - GENERIC_TIMEZONE=Europe/Paris
      - N8N_SECURE_COOKIE=false
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - internal

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: unless-stopped
    depends_on:
      - traefik
      - n8n
    labels:
      - traefik.enable=true
      - traefik.http.routers.webui.rule=Host(`webui.${DOMAIN_NAME}`)
      - traefik.http.routers.webui.entrypoints=websecure
      - traefik.http.routers.webui.tls=true
      - traefik.http.routers.webui.tls.certresolver=internal
      - traefik.http.routers.webui.service=webui@docker
      - traefik.http.services.webui.loadbalancer.server.port=8080
    environment:
      - ENV=dev
      - WEBUI_PORT=8080
      # Bonus conseillé pour éviter les soucis de session derrière HTTPS:
      - WEBUI_URL=https://webui.${DOMAIN_NAME}
    volumes:
      - open-webui:/app/backend/data
      - /docker/automat/certs/root_ca.crt:/usr/local/share/ca-certificates/root_ca.crt:ro
    command:
      - sh
      - -c
      - |
        cp /usr/local/share/ca-certificates/root_ca.crt /usr/local/share/ca-certificates/stepca.crt &&
        update-ca-certificates &&
        /app/backend/start.sh
    networks:
      - internal

  # =========================
  # SearXNG (moteur + API)
  # =========================
  searxng-redis:
    image: valkey/valkey:8-alpine
    container_name: searxng-redis
    restart: unless-stopped
    command: valkey-server --save 30 1 --loglevel warning
    volumes:
      - searxng_valkey:/data
    networks:
      - internal

  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    restart: unless-stopped
    depends_on:
      - traefik
      - searxng-redis
    volumes:
      - /docker/automat/searxng:/etc/searxng:rw
      - searxng_cache:/var/cache/searxng:rw
    environment:
      - SEARXNG_BASE_URL=https://search.${DOMAIN_NAME}/
    networks:
      - internal
    labels:
      - traefik.enable=true
      - traefik.http.routers.searxng.rule=Host(`search.${DOMAIN_NAME}`)
      - traefik.http.routers.searxng.entrypoints=websecure
      - traefik.http.routers.searxng.tls=true
      - traefik.http.routers.searxng.tls.certresolver=internal
      - traefik.http.services.searxng.loadbalancer.server.port=8080

  # =========================
  # MCP server pour SearXNG
  # =========================
  mcp-searxng:
    image: isokoliuk/mcp-searxng:latest
    container_name: mcp-searxng
    restart: unless-stopped
    depends_on:
      - searxng
    environment:
      - SEARXNG_URL=http://searxng:8080
      - MCP_HTTP_PORT=3000
    networks:
      - internal
    labels:
      - traefik.enable=true
      - traefik.http.routers.mcpsearxng.rule=Host(`mcp-searxng.${DOMAIN_NAME}`)
      - traefik.http.routers.mcpsearxng.entrypoints=websecure
      - traefik.http.routers.mcpsearxng.tls=true
      - traefik.http.routers.mcpsearxng.tls.certresolver=internal
      - traefik.http.services.mcpsearxng.loadbalancer.server.port=3000

  # =========================
  # Kimai (Suivi de temps)
  # =========================
  kimai_bdd:
    image: mysql:8.3
    container_name: kimai_bdd
    restart: unless-stopped
    command: --default-storage-engine=innodb
    environment:
      MYSQL_DATABASE: kimai
      MYSQL_USER: kimaiuser
      MYSQL_PASSWORD: kimaipassword
      MYSQL_ROOT_PASSWORD: changemeplease
    volumes:
      - kimai_bdd_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-p$$MYSQL_ROOT_PASSWORD"]
      interval: 20s
      start_period: 10s
      timeout: 10s
      retries: 3
    networks:
      - internal

  kimai:
    image: kimai/kimai2:apache
    container_name: kimai
    restart: unless-stopped
    depends_on:
      - traefik
      - kimai_bdd
    environment:
      - ADMINMAIL=admin@kimai.local
      - ADMINPASS=changemeplease
      - DATABASE_URL=mysql://kimaiuser:kimaipassword@kimai_bdd/kimai?charset=utf8mb4&serverVersion=8.3.0
    volumes:
      - kimai_data:/opt/kimai/var/data
      - kimai_plugins:/opt/kimai/var/plugins
      - /home/adm001/local.yaml:/opt/kimai/config/packages/local.yaml
    networks:
      - internal
    labels:
      - traefik.enable=true
      - traefik.http.routers.kimai.rule=Host(`kimai.${DOMAIN_NAME}`)
      - traefik.http.routers.kimai.entrypoints=websecure
      - traefik.http.routers.kimai.tls=true
      - traefik.http.routers.kimai.tls.certresolver=mytlschallenge
      - traefik.http.services.kimai.loadbalancer.server.port=8001

networks:
  proxy:
    driver: bridge
    ipam:
      config:
        - subnet: 172.30.0.0/16
  internal:
    driver: bridge
    ipam:
      config:
        - subnet: 172.31.0.0/16

volumes:
  n8n_data:
  open-webui:
  searxng_valkey:
  searxng_cache:
  kimai_bdd_data:
  kimai_data:
  kimai_plugins:
```

### 13.2. Notes de sécurité (recommandations)

- Activer une authentification sur le dashboard Traefik (middleware basic-auth) et/ou restreindre par IP.
- Protéger SearXNG (limiter, headers, éventuellement basic-auth) si l'instance est exposée.
- Utiliser des secrets forts (SearXNG `secret_key`, mots de passe MySQL/Kimai, etc.).
- Éviter `ENV=dev` en production si non nécessaire (Open WebUI).
