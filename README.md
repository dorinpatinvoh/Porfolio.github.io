# Dorin PATINVOH — Portfolio Java / Angular

Site statique en HTML, CSS et JavaScript, sans build nécessaire. Les projets et études de cas restent lisibles sans JavaScript.

## Lancer et vérifier

Lancer `python3 -m http.server 8000`, puis ouvrir http://localhost:8000.

Contrôles : `npm ci`, `npx playwright install chromium`, `npm run check` et `npm test`.

Les tests vérifient les erreurs JavaScript, filtres, menus mobiles, débordements à 320/390/768/1440 px, isolation des brouillons locaux et réponses succès/erreur du formulaire (sans envoi réel). GitHub Actions les exécute sur les pushs vers main et les pull requests. Les polices et icônes externes sont bloquées dans ces tests.

## Modifier le contenu

- Les trois projets principaux et les études de cas sont dans index.html ; les compétences publiées sont dans portfolio-data.json.
- admin.html contient l’éditeur local : ajout de projets avec capture, compétences, import/export JSON. Ce n’est pas une administration authentifiée : aucun accès au serveur ni à GitHub. Aucun lien vers cet outil ne figure sur le site public.
- Les brouillons sont stockés dans ce navigateur. La page publique les ignore et affiche les données publiées.
- Pour publier les ajouts, exporter le JSON depuis l’éditeur, remplacer portfolio-data.json dans le dépôt puis committer.
- Dates d’expérience, résultats chiffrés, langues, visa et témoignages doivent être renseignés après validation. Le CV reprend les informations existantes sans inventer les périodes d’expérience.

## Contact et hébergement

**Netlify :** publier la racine du dépôt sans build. Activer la détection des formulaires dans Netlify, redéployer et vérifier que contact apparaît dans Forms. Le HTML contient data-netlify, form-name et un piège antispam. Sur un sous-domaine *.netlify.app, le JavaScript envoie les données encodées à /, confirme après une réponse réussie et conserve le texte en cas d’échec. Configurer les notifications email dans Netlify. La réception réelle doit être vérifiée sur le déploiement ; les tests utilisent des réponses simulées.

**GitHub Pages / local :** le bouton « Préparer mon email » ouvre la messagerie avec nom, adresse et message. Il ne prétend pas avoir envoyé l’email et laisse l’adresse directe disponible si aucune messagerie n’est configurée.

**Domaine personnalisé sur Netlify :** ajouter ce domaine à la condition contactNetlify dans js/script.js après avoir configuré Netlify Forms. Mettre à jour l’URL absolue og:image dans index.html. L’achat et la configuration DNS ne sont pas effectués par ce dépôt.

## Assets et éléments à compléter

- assets/cv-dorin-patinvoh.pdf : CV téléchargeable depuis l’accueil et le contact.
- images/profil.webp : portrait compressé ; l’original PNG est conservé.
- images/social-card.png et images/favicon.svg : partage social et favicon.
- Les cartes utilisent des illustrations typographiques, aucune fausse capture. Ajouter les captures autorisées et les liens de démo lorsqu’ils sont disponibles.
- SecureLedger n’est pas présenté comme un projet livré. Ajouter Docker ou des tests à un autre dépôt et déployer une démo nécessitent un travail propre à ces projets.
- Pour un audit Lighthouse réel : servir le site dans Chrome, ouvrir Lighthouse et tester Performance, Accessibility, Best Practices et SEO sur mobile et ordinateur. Aucun score n’est annoncé sans exécution.

## Validation de cette mise à jour

Le 24 octobre 2026 : tests Playwright réussis à 320, 390, 768 et 1440 px ; contrôles syntaxiques réussis ; CV A4 vérifié visuellement. Audit Lighthouse local : 99 en performance, 100 en accessibilité, bonnes pratiques et SEO sur les deux profils exécutés. Les serveurs de polices et icônes externes ont été bloqués pour cet audit ; ces scores ne décrivent pas le déploiement public et doivent être revérifiés avec ses ressources et son réseau réels. La réception effective des messages Netlify reste à vérifier après activation du service.
