**Domaine :** ad.fsp-groupe.com\
**DC source (actuel) :** SRV-DC-001.ad.fsp-groupe.com\
**DC cible (nouveau \"primaire\") :** SRV-DC-002.ad.fsp-groupe.com\
**Azure AD Connect :** installé sur les deux serveurs, actif
aujourd\'hui sur SRV-DC-001\
\
**Version :** 2.0 --- Date : 29/01/2026 --- Rédacteur : Mathis ROUVREAU\
**Durée estimée :** 30-45 minutes

# Sommaire

1\. Objet & portée

2\. Pré-requis

> 2.1. Vérifications rapides pré-bascule
>
> 2.2. Sauvegardes

3\. Transfert des rôles FSMO vers SRV-DC-002

4\. Configuration du service de temps (PDC Emulator)

5\. Bascule Azure AD Connect

6\. Vérifications post-bascule

7\. Modification DNS clients (optionnel)

8\. Plan de retour arrière

Annexe A --- Script de validation rapide

Annexe B --- Journal des actions

# 1. Objet & portée

Faire de SRV-DC-002 le contrôleur de domaine \"principal\" en
transférant les rôles FSMO, en configurant le service de temps (PDC
Emulator), et en rendant Azure AD Connect actif sur SRV-DC-002.

**Contexte :** Les deux contrôleurs de domaine sont déjà opérationnels
et en réplication. Cette procédure concerne uniquement le transfert des
rôles opérationnels.

**Note importante :** Dans Active Directory, il n\'existe pas de
contrôleur \"principal\" ou \"secondaire\" au sens strict. Cette
procédure désigne simplement SRV-DC-002 comme détenteur des rôles FSMO
et serveur AAD Connect actif.

**Durée estimée :** 30 à 45 minutes

# 2. Pré-requis

## 2.1. Vérifications rapides pré-bascule

Vérifier que tout est opérationnel avant de commencer :

> \# Vérifier la réplication AD\
> repadmin /replsummary\
> \
> \# Vérifier les rôles FSMO actuels\
> netdom query fsmo\
> \
> \# Vérifier Azure AD Connect actuel\
> Import-Module ADSync\
> Get-ADSyncScheduler

**Résultat attendu :** Réplication OK, 5 rôles FSMO sur SRV-DC-001, AAD
Connect actif sur SRV-DC-001.

## 2.2. Sauvegardes

**IMPORTANT :** Effectuer des sauvegardes avant toute manipulation.

-   Snapshot des machines virtuelles SRV-DC-001 et SRV-DC-002 (si VM)

-   OU Sauvegarde État du système (System State) des deux DC

-   Export de la configuration Azure AD Connect :

> Get-ADSyncServerConfiguration -Path
> \"C:\\Backup\\AADConnect\_\$(Get-Date -f yyyyMMdd).json\"

# 3. Transfert des rôles FSMO vers SRV-DC-002

Transférer les 5 rôles FSMO de SRV-DC-001 vers SRV-DC-002.

**Note :** Nous utilisons ntdsutil pour effectuer un TRANSFER (transfert
propre) et non un SEIZURE, car les deux DC sont en ligne.

> \# Se connecter sur SRV-DC-002 en PowerShell Admin\
> \
> \# Vérifier les rôles FSMO actuels (doivent être sur SRV-DC-001)\
> netdom query fsmo\
> \
> \# Transférer les 5 rôles via ntdsutil\
> ntdsutil\
> roles\
> connections\
> connect to server SRV-DC-002\
> quit\
> transfer schema master\
> transfer naming master\
> transfer PDC\
> transfer RID master\
> transfer infrastructure master\
> quit\
> quit\
> \
> \# Vérifier le transfert\
> netdom query fsmo

**Résultat attendu :** Les 5 rôles FSMO sont maintenant sur
SRV-DC-002.ad.fsp-groupe.com

**Durée :** \~5 minutes

**En cas d\'erreur :** Vérifier que la réplication fonctionne
correctement avec \"repadmin /replsummary\" avant de réessayer.

# 4. Configuration du service de temps (PDC Emulator)

Puisque le rôle PDC Emulator a changé de serveur, il faut reconfigurer
le service de temps Windows (W32Time).

## Étape 1 : Configurer SRV-DC-002 comme source NTP

> \# Se connecter sur SRV-DC-002\
> \
> \# Configurer la synchronisation avec les serveurs NTP externes\
> w32tm /config /manualpeerlist:\"0.fr.pool.ntp.org 1.fr.pool.ntp.org\"
> \`\
> /syncfromflags:manual /reliable:yes /update\
> \
> \# Redémarrer le service\
> net stop w32time && net start w32time\
> \
> \# Forcer la synchronisation\
> w32tm /resync /force\
> \
> \# Vérifier la configuration\
> w32tm /query /status\
> w32tm /query /source

**Note :** Si vous utilisez une source NTP interne (autre serveur de
temps), remplacer les serveurs pool.ntp.org par votre serveur NTP.

## Étape 2 : Reconfigurer SRV-DC-001

> \# Se connecter sur SRV-DC-001\
> \
> \# Désactiver le mode \"reliable\" (n\'est plus le PDC)\
> w32tm /config /reliable:no /update\
> \
> \# Redémarrer le service\
> net stop w32time && net start w32time\
> \
> \# Vérifier que SRV-DC-001 synchronise maintenant avec SRV-DC-002\
> w32tm /query /source

**Résultat attendu :** SRV-DC-002 synchronise avec les serveurs NTP
externes (ou votre serveur NTP interne), SRV-DC-001 synchronise avec
SRV-DC-002.

**Durée :** \~5 minutes

# 5. Bascule Azure AD Connect

**Important :** Cette section suppose qu\'Azure AD Connect est déjà
installé et configuré de manière identique sur les deux serveurs. Si ce
n\'est pas le cas, il faudra l\'installer sur SRV-DC-002 avant cette
étape.

## Étape 1 : Vérifier la configuration actuelle

> \# Sur SRV-DC-001\
> Import-Module ADSync\
> Get-ADSyncScheduler\
> \
> \# Vérifier que les deux serveurs ont la même version AAD Connect\
> \# Sur SRV-DC-001\
> Get-ItemProperty \"HKLM:\\SOFTWARE\\Microsoft\\Azure AD Connect\" \|
> Select DisplayVersion\
> \# Sur SRV-DC-002\
> Get-ItemProperty \"HKLM:\\SOFTWARE\\Microsoft\\Azure AD Connect\" \|
> Select DisplayVersion

## Étape 2 : Passer SRV-DC-001 en Staging Mode

Sur SRV-DC-001, ouvrir Azure AD Connect et suivre ces étapes :

1\. Cliquer sur \"Configure\"

2\. Sélectionner \"Configure staging mode\"

3\. Cliquer sur \"Next\"

4\. Cocher \"Enable staging mode\"

5\. Cliquer sur \"Next\" puis \"Configure\"

6\. Attendre la fin de la configuration

**⚠️ Important :** La synchronisation s\'arrête immédiatement sur
SRV-DC-001.

## Étape 3 : Désactiver le Staging Mode sur SRV-DC-002

Sur SRV-DC-002, ouvrir Azure AD Connect et suivre ces étapes :

1\. Cliquer sur \"Configure\"

2\. Sélectionner \"Configure staging mode\"

3\. Cliquer sur \"Next\"

4\. Décocher \"Enable staging mode\"

5\. Cliquer sur \"Next\" puis \"Configure\"

6\. Attendre la fin de la configuration

## Étape 4 : Forcer une synchronisation

> \# Sur SRV-DC-002\
> Import-Module ADSync\
> \
> \# Vérifier le planificateur\
> Get-ADSyncScheduler\
> \
> \# Lancer une synchronisation complète\
> Start-ADSyncSyncCycle -PolicyType Initial\
> \
> \# Attendre quelques minutes puis vérifier l\'état\
> Get-ADSyncConnectorRunStatus

## Étape 5 : Vérifications

-   Ouvrir Synchronization Service Manager (miisclient.exe) sur
    SRV-DC-002

-   Vérifier qu\'aucune erreur n\'apparaît dans l\'onglet \"Operations\"

-   Se connecter au portail Entra ID (https://entra.microsoft.com)

-   Aller dans \"Microsoft Entra Connect\" → \"Connect Sync\"

-   Vérifier la date de dernière synchronisation (doit être récente)

-   Vérifier qu\'aucune erreur n\'est présente

**Résultat attendu :** SRV-DC-002 est actif et synchronise avec Entra
ID, SRV-DC-001 est en Staging Mode, aucune erreur de synchronisation.

**Durée :** \~15-20 minutes (incluant la synchronisation initiale)

# 6. Vérifications post-bascule

Effectuer les vérifications suivantes pour s\'assurer que tout
fonctionne correctement :

## 6.1. Vérifier les rôles FSMO

> \# Vérifier que les 5 rôles sont sur SRV-DC-002\
> netdom query fsmo

## 6.2. Vérifier la réplication AD

> \# Vérifier qu\'il n\'y a pas d\'erreurs de réplication\
> repadmin /replsummary

## 6.3. Vérifier le service de temps

> \# Sur SRV-DC-002 (doit synchroniser avec NTP externe)\
> w32tm /query /status\
> w32tm /query /source\
> \
> \# Sur SRV-DC-001 (doit synchroniser avec SRV-DC-002)\
> w32tm /query /source

## 6.4. Vérifier Azure AD Connect

> \# Sur SRV-DC-002\
> Import-Module ADSync\
> Get-ADSyncScheduler\
> Get-ADSyncConnectorRunStatus\
> \
> \# Vérifier dans le portail Entra ID\
> \# → https://entra.microsoft.com → Microsoft Entra Connect

## 6.5. Tests fonctionnels (recommandé)

Effectuer quelques tests rapides :

-   Connexion d\'un utilisateur sur un poste de travail

-   Accès à un partage réseau

-   Application des GPO (gpupdate /force sur un poste test)

-   Vérifier les événements dans l\'observateur d\'événements des DC

**Durée :** \~10 minutes

# 7. Modification DNS clients (optionnel)

**Note :** Cette étape est optionnelle. Si les deux DC fonctionnent
correctement en réplication, il n\'est pas obligatoire de modifier
l\'ordre DNS des clients.

Si vous souhaitez que les clients contactent prioritairement SRV-DC-002,
vous pouvez :

## Option 1 : Via DHCP (recommandé)

1.  Ouvrir la console DHCP

2.  Modifier l\'Option 006 (DNS Servers) de chaque étendue DHCP

3.  Placer l\'IP de SRV-DC-002 en premier

4.  Placer l\'IP de SRV-DC-001 en second

## Option 2 : Serveurs avec IP statique

Pour les serveurs avec IP statique, modifier manuellement les paramètres
DNS dans les propriétés de la carte réseau (mettre IP de SRV-DC-002 en
DNS préféré).

# 8. Plan de retour arrière

**En cas de problème :** Si vous rencontrez des erreurs critiques
(réplication cassée, authentification impossible, erreurs Azure AD
Connect), voici la procédure de rollback :

## 8.1. Retour Azure AD Connect

> \# Sur SRV-DC-002 : activer Staging Mode\
> \# (Via Azure AD Connect → Configure → Enable staging mode)\
> \
> \# Sur SRV-DC-001 : désactiver Staging Mode\
> \# (Via Azure AD Connect → Configure → Désactiver staging mode)\
> \
> \# Forcer une synchronisation sur SRV-DC-001\
> Import-Module ADSync\
> Start-ADSyncSyncCycle -PolicyType Initial

## 8.2. Retour des rôles FSMO

> \# Retransférer les rôles vers SRV-DC-001\
> Import-Module ActiveDirectory\
> Move-ADDirectoryServerOperationMasterRole -Identity
> \"SRV-DC-001.ad.fsp-groupe.com\" \`\
> -OperationMasterRole
> SchemaMaster,DomainNamingMaster,PDCEmulator,RIDMaster,InfrastructureMaster
> \`\
> -Confirm:\$false\
> \
> \# Vérifier\
> netdom query fsmo

## 8.3. Retour du service de temps

> \# Sur SRV-DC-001 (redevient PDC)\
> w32tm /config /manualpeerlist:\"0.fr.pool.ntp.org 1.fr.pool.ntp.org\"
> \`\
> /syncfromflags:manual /reliable:yes /update\
> net stop w32time && net start w32time\
> \
> \# Sur SRV-DC-002\
> w32tm /config /reliable:no /update\
> net stop w32time && net start w32time

**Durée du rollback :** \~15-20 minutes

# Annexe A --- Script de validation rapide

Script PowerShell à exécuter sur SRV-DC-002 après la migration pour
valider rapidement :

> \# Script de validation post-migration\
> \# À exécuter sur SRV-DC-002\
> \
> Write-Host \"=== VALIDATION POST-MIGRATION ===\" -ForegroundColor
> Cyan\
> \
> \# 1. Vérifier les rôles FSMO\
> Write-Host \"\`n\[1/5\] Rôles FSMO\...\" -ForegroundColor Yellow\
> netdom query fsmo\
> \
> \# 2. Vérifier la réplication\
> Write-Host \"\`n\[2/5\] Réplication AD\...\" -ForegroundColor Yellow\
> repadmin /replsummary\
> \
> \# 3. Vérifier le service de temps\
> Write-Host \"\`n\[3/5\] Service de temps\...\" -ForegroundColor
> Yellow\
> w32tm /query /status\
> w32tm /query /source\
> \
> \# 4. Vérifier Azure AD Connect\
> Write-Host \"\`n\[4/5\] Azure AD Connect\...\" -ForegroundColor
> Yellow\
> Import-Module ADSync\
> Get-ADSyncScheduler\
> Get-ADSyncConnectorRunStatus \| Select ConnectorName, RunState\
> \
> \# 5. Vérifier les événements récents\
> Write-Host \"\`n\[5/5\] Événements critiques\...\" -ForegroundColor
> Yellow\
> Get-EventLog -LogName \"Directory Service\" -EntryType Error -Newest 5
> -ErrorAction SilentlyContinue\
> Get-EventLog -LogName \"System\" -Source \"NETLOGON\" -EntryType Error
> -Newest 5 -ErrorAction SilentlyContinue\
> \
> Write-Host \"\`n=== VALIDATION TERMINÉE ===\" -ForegroundColor Green\
> Write-Host \"Si aucune erreur ci-dessus, la migration est réussie !\"
> -ForegroundColor Green

# Annexe B --- Journal des actions

Tableau à compléter pendant l\'exécution de la migration :

  ---------------------------------------------------------------------------
  Heure             Action                Résultat          Commentaires
  ----------------- --------------------- ----------------- -----------------
  10:00             Début de la           ✓ OK              Ouverture de la
                    maintenance                             fenêtre de
                                                            bascule

  10:05             Vérifications         ✓ OK              Réplication OK, 5
                    pré-migration                           rôles FSMO sur
                                                            SRV-DC-001

  10:10             Sauvegarde/Snapshot   ✓ OK              Snapshots VM
                                                            réalisés sur
                                                            DC-001 et DC-002

  10:15             Transfert rôles FSMO  ✓ OK              5 rôles
                                                            transférés vers
                                                            SRV-DC-002 via
                                                            ntdsutil

  10:20             Configuration W32Time ✓ OK              NTP externe
                    SRV-DC-002                              configuré,
                                                            synchro OK

  10:25             Configuration W32Time ✓ OK              Reliable:no,
                    SRV-DC-001                              synchro avec
                                                            SRV-DC-002

  10:30             AAD Connect :         ✓ OK              Staging mode
                    SRV-DC-001 → Staging                    activé sur DC-001

  10:35             AAD Connect :         ✓ OK              Staging mode
                    SRV-DC-002 → Actif                      désactivé,
                                                            nouveau compte
                                                            MSOL créé

  10:40             Synchronisation AAD   ✓ OK              Synchro Delta OK,
                    Connect                                 connecteur Busy
                                                            puis terminé

  10:45             Vérifications finales ✓ OK              FSMO sur DC-002,
                                                            réplication 0
                                                            erreurs, staging
                                                            False

  10:50             Fin de la maintenance ✓ OK              Bascule terminée
                                                            avec succès
  ---------------------------------------------------------------------------

**Légende :** ✓ OK = Succès \| ⚠ = Attention \| ✗ = Erreur

**Réalisé par :** Mathis ROUVREAU

**Date :** 26/02/2026

**Validation :** OK --- Bascule validée
