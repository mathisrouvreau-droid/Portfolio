# Script Oral — BTS SIO SISR

## Slide 1 — Titre

> Bonjour, je m'appelle Mathis Rouvreau, je suis en BTS SIO option SISR, et je réalise mon alternance chez AGIR Recouvrement à Cholet en tant qu'administrateur systèmes et réseaux.

---

## Slide 2 — Parcours en 3 piliers

> Pendant ces deux ans, j'ai travaillé sur trois axes principaux. D'abord, deux projets scolaires — l'AP2 MACODEMY, une infra réseau complète pour un établissement scolaire fictif, et l'AP3 MDS49, une infrastructure sécurisée pour la Maison Départementale des Sports. Et en parallèle, mon alternance chez AGIR, une entreprise de recouvrement de créances du Groupe FSP, environ 130 salariés.

---

## Slide 3 — Organigramme

> Chez AGIR, le service IT est composé de 6 personnes. Le DSI, une assistante DSI, une cheffe de projet, un administrateur réseau, un technicien support, et moi en tant qu'alternant. J'ai travaillé en autonomie sur plusieurs projets, avec le soutien de l'administrateur réseau au quotidien.

---

## Slide 4 — Conception réseau

> La première compétence que je veux vous présenter, c'est la conception d'infrastructures réseau. En AP2, j'ai mis en place une segmentation VLAN pour séparer trois services — administration, professeurs et élèves — avec un Active Directory centralisé, du DHCP multi-scopes et du DNS interne. En AP3, on est allé plus loin avec du routage OSPF, du NAT/PAT et un serveur web en DMZ. L'ensemble des tests de connectivité étaient conformes à 100%.

---

## Slide 5 — Sécurité & supervision

> Ensuite, la sécurisation et la supervision. Pendant mon stage chez AGIR, j'ai travaillé trois mois sur le projet Stoïk — un audit complet de l'Active Directory. J'ai utilisé BloodHound et PingCastle pour identifier les vulnérabilités, puis j'ai déployé plus de 50 GPO de sécurité, activé le MFA pour tous les utilisateurs, et mis en place des accès conditionnels sur Azure AD. Résultat : le Secure Score est passé de 78 à 85%, et les vulnérabilités AD ont baissé de 45%. En parallèle, sur l'AP3, j'ai mis en place Zabbix pour la supervision SNMP et un serveur FreeRADIUS pour l'authentification WiFi en 802.1X.

---

## Slide 6 — Automatisation

> J'ai aussi automatisé des processus IT. Chez AGIR, la gestion des délégations de boîtes mail Exchange se faisait manuellement, avec des risques d'erreur et des oublis de révocation. J'ai créé un workflow complet avec n8n : un formulaire de demande, une approbation par le manager par mail, l'exécution automatique via Graph API et PowerShell, une confirmation, et une révocation automatique à expiration. Ça a permis d'économiser environ 2 heures par semaine, plus de 150 demandes ont été traitées, et zéro erreur humaine.

---

## Slide 7 — Déploiement & IA

> J'ai aussi déployé des services conteneurisés. J'ai mis en place Open WebUI, une plateforme d'intelligence artificielle interne connectée aux données de l'entreprise, avec SearXNG pour la recherche. J'ai également déployé Vaultwarden, un gestionnaire de mots de passe synchronisé avec l'Active Directory. Le tout avec Docker Compose, Traefik en reverse proxy avec du HTTPS automatisé via une PKI interne Step-CA. Au total, 7 services déployés, zéro port applicatif exposé. J'ai aussi formé le service IT au prompt engineering, au RAG et au protocole MCP.

---

## Slide 8 — Continuité de service

> Enfin, la continuité de service. J'ai réalisé la bascule du contrôleur de domaine principal — le SRV-DC-001 vers le SRV-DC-002 — sans aucune interruption de service. Ça a impliqué le transfert des 5 rôles FSMO avec ntdsutil, la reconfiguration du service de temps W32Time, et la migration de l'instance Azure AD Connect. Les 120 comptes utilisateurs ont continué à se synchroniser normalement. Tout a été documenté pour que l'opération soit reproductible.

---

## Slide 9 — Conclusion

> Pour conclure, ces deux années de BTS et d'alternance m'ont permis d'acquérir des compétences solides en administration systèmes, sécurité, automatisation et gestion d'infrastructure — le tout validé par des réalisations concrètes en entreprise. L'année prochaine, je poursuis en licence informatique en alternance chez AGIR, avec pour objectif à terme un master ou une école spécialisée en cybersécurité. Merci pour votre attention, je suis disponible pour vos questions.
