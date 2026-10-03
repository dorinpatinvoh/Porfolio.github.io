"use strict";

// Les projets ci-dessous servent d'exemples initiaux. Les projets ajoutés depuis
// le formulaire et les compétences sont conservés localement dans le navigateur.
const PROJETS_PAR_DEFAUT = [
    {
        titre: "Avant Tout",
        categorie: "Frontend",
        role: "Développeur Frontend",
        description: "Application web interactive permettant la gestion et la priorisation des tâches quotidiennes.",
        technologies: ["React", "JavaScript", "CSS3", "Vite"],
        image: "images/projet1-cover.jpg",
        lienDemo: "https://votre-projet1.vercel.app",
        lienGithub: "https://github.com/votre-compte/projet-1"
    },
    {
        titre: "E-Commerce Market",
        categorie: "Fullstack",
        role: "Développeur Fullstack",
        description: "Plateforme e-commerce avec panier d'achat, authentification et passerelle de paiement intégrée.",
        technologies: ["Django", "Python", "PostgreSQL", "Tailwind"],
        image: "images/projet2-cover.jpg",
        lienDemo: "https://votre-projet2.com",
        lienGithub: "https://github.com/votre-compte/projet-2"
    },
    {
        titre: "Dashboard Analytics",
        categorie: "Frontend",
        role: "Frontend & Visualisation",
        description: "Tableau de bord de visualisation de métriques financières avec graphiques temps réel.",
        technologies: ["React", "Chart.js", "REST API"],
        image: "images/projet1-cover.jpg",
        lienDemo: "https://demo.com",
        lienGithub: "https://github.com/votre-compte/projet-3"
    }
];

const COMPETENCES_PAR_DEFAUT = [
    "HTML5 / CSS3",
    "JavaScript (ES6+)",
    "React",
    "Git & GitHub",
    "Responsive Design",
    "UI/UX Design"
];

const CLE_STOCKAGE = "portfolio-patinvoh-v1";
const TAILLE_MAX_IMAGE = 950_000; // taille approximative de l'image encodée
const TAILLE_MAX_SAUVEGARDE = 2_200_000;
const CATEGORIES = ["Frontend", "Fullstack", "Mobile"];

function normaliserLienWeb(valeur) {
    if (typeof valeur !== "string" || !valeur.trim()) return "";
    try {
        const url = new URL(valeur.trim());
        return url.protocol === "https:" ? url.href : "";
    } catch {
        return "";
    }
}

function normaliserLienGithub(valeur) {
    const lien = normaliserLienWeb(valeur);
    if (!lien) return "";
    const url = new URL(lien);
    return ["github.com", "www.github.com"].includes(url.hostname.toLowerCase()) ? lien : "";
}

function imageAutorisee(valeur) {
    if (typeof valeur !== "string") return false;
    return /^data:image\/(?:webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/i.test(valeur)
        || /^images\/[A-Za-z0-9_.-]+$/.test(valeur);
}

function genererId() {
    return window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `projet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normaliserProjet(projet) {
    if (!projet || typeof projet !== "object") return null;

    const titre = typeof projet.titre === "string" ? projet.titre.trim().slice(0, 80) : "";
    const description = typeof projet.description === "string" ? projet.description.trim().slice(0, 800) : "";
    const categorie = CATEGORIES.includes(projet.categorie) ? projet.categorie : "Frontend";
    const lienGithub = normaliserLienGithub(projet.lienGithub);
    const image = typeof projet.image === "string" ? projet.image : "";
    const technologies = Array.isArray(projet.technologies)
        ? projet.technologies
            .filter(tech => typeof tech === "string")
            .map(tech => tech.trim().slice(0, 30))
            .filter(Boolean)
            .slice(0, 12)
        : [];

    if (!titre || !description || !lienGithub || !imageAutorisee(image)) return null;
    if (image.startsWith("data:") && image.length > TAILLE_MAX_IMAGE) return null;

    return {
        id: typeof projet.id === "string" && projet.id ? projet.id.slice(0, 100) : genererId(),
        titre,
        categorie,
        role: typeof projet.role === "string" && projet.role.trim()
            ? projet.role.trim().slice(0, 80)
            : "Projet personnel",
        description,
        technologies,
        image,
        lienDemo: normaliserLienWeb(projet.lienDemo),
        lienGithub
    };
}

function normaliserCompetences(liste) {
    if (!Array.isArray(liste)) return [];
    const vues = new Set();
    return liste
        .filter(competence => typeof competence === "string")
        .map(competence => competence.trim().slice(0, 40))
        .filter(competence => {
            const cle = competence.toLocaleLowerCase("fr");
            if (!competence || vues.has(cle)) return false;
            vues.add(cle);
            return true;
        })
        .slice(0, 60);
}

function chargerDonneesLocales() {
    try {
        const texte = localStorage.getItem(CLE_STOCKAGE);
        if (!texte) return null;

        const donnees = JSON.parse(texte);
        if (!donnees || donnees.version !== 1) return null;

        const projets = Array.isArray(donnees.projets)
            ? donnees.projets.map(normaliserProjet).filter(Boolean)
            : [];
        const competences = Array.isArray(donnees.competences)
            ? normaliserCompetences(donnees.competences)
            : [...COMPETENCES_PAR_DEFAUT];

        return { projets, competences };
    } catch (erreur) {
        console.warn("Les données locales du portfolio n'ont pas pu être lues.", erreur);
        return null;
    }
}

const donneesLocales = chargerDonneesLocales();
let projetsAjoutes = donneesLocales ? donneesLocales.projets : [];
let competences = donneesLocales ? donneesLocales.competences : [...COMPETENCES_PAR_DEFAUT];

function enregistrerDonneesLocales() {
    const donnees = JSON.stringify({
        version: 1,
        projets: projetsAjoutes,
        competences
    });

    if (donnees.length > TAILLE_MAX_SAUVEGARDE) return false;

    try {
        localStorage.setItem(CLE_STOCKAGE, donnees);
        return true;
    } catch (erreur) {
        console.warn("Le navigateur n'a pas pu sauvegarder les données du portfolio.", erreur);
        return false;
    }
}

function afficherStatut(element, message, type = "info") {
    if (!element) return;
    element.textContent = message;
    element.className = `form-status is-${type}`;
}

// ========================================================
// Affichage des projets et filtres
// ========================================================
const projetsGrid = document.getElementById("projetsGrid");
const tousLesProjets = () => [
    ...PROJETS_PAR_DEFAUT.map(projet => ({ ...projet, local: false })),
    ...projetsAjoutes.map(projet => ({ ...projet, local: true }))
];

function creerLienProjet(url, libelle, classe, icone) {
    const lien = document.createElement("a");
    lien.className = `btn ${classe} btn-sm`;
    lien.href = url;
    lien.target = "_blank";
    lien.rel = "noopener noreferrer";

    if (icone) {
        const elementIcone = document.createElement("i");
        elementIcone.className = icone;
        elementIcone.setAttribute("aria-hidden", "true");
        lien.append(elementIcone, document.createTextNode(` ${libelle}`));
    } else {
        lien.textContent = libelle;
    }
    return lien;
}

function afficherProjets(filtre = "all") {
    if (!projetsGrid) return;

    const projetsFiltres = tousLesProjets().filter(projet =>
        filtre === "all" || projet.categorie.toLocaleLowerCase("fr") === filtre.toLocaleLowerCase("fr")
    );
    projetsGrid.replaceChildren();

    if (projetsFiltres.length === 0) {
        const message = document.createElement("p");
        message.className = "projets-vides";
        message.textContent = "Aucun projet dans cette catégorie pour le moment.";
        projetsGrid.appendChild(message);
        return;
    }

    projetsFiltres.forEach(projet => {
        const carte = document.createElement("article");
        carte.className = "projet-carte";

        const imageCadre = document.createElement("div");
        imageCadre.className = "projet-image-wrap";
        const image = document.createElement("img");
        image.src = projet.image;
        image.alt = `Aperçu du projet ${projet.titre}`;
        image.loading = "lazy";
        image.addEventListener("error", () => {
            const remplacement = document.createElement("div");
            remplacement.className = "projet-image-placeholder";
            const icone = document.createElement("i");
            icone.className = "far fa-image";
            icone.setAttribute("aria-hidden", "true");
            const texte = document.createElement("span");
            texte.textContent = "Ajoutez une capture du projet";
            remplacement.append(icone, texte);
            imageCadre.replaceChildren(remplacement);
        }, { once: true });
        imageCadre.appendChild(image);

        const corps = document.createElement("div");
        corps.className = "projet-corps";
        const role = document.createElement("span");
        role.className = "projet-role";
        role.textContent = projet.role;
        const titre = document.createElement("h3");
        titre.textContent = projet.titre;
        const description = document.createElement("p");
        description.className = "projet-description";
        description.textContent = projet.description;

        const technologies = document.createElement("div");
        technologies.className = "technologies";
        projet.technologies.forEach(technologie => {
            const etiquette = document.createElement("span");
            etiquette.textContent = technologie;
            technologies.appendChild(etiquette);
        });

        const liens = document.createElement("div");
        liens.className = "projet-liens";
        if (projet.lienDemo) {
            liens.appendChild(creerLienProjet(projet.lienDemo, "Voir la démo ↗", "btn-primary"));
        }
        if (projet.lienGithub) {
            liens.appendChild(creerLienProjet(projet.lienGithub, "Code", "btn-secondary", "fab fa-github"));
        }
        if (projet.local) {
            const supprimer = document.createElement("button");
            supprimer.className = "btn btn-remove btn-sm";
            supprimer.type = "button";
            supprimer.textContent = "Retirer";
            supprimer.setAttribute("aria-label", `Retirer ${projet.titre} de ce navigateur`);
            supprimer.addEventListener("click", () => supprimerProjet(projet.id));
            liens.appendChild(supprimer);
        }

        corps.append(role, titre, description, technologies, liens);
        carte.append(imageCadre, corps);
        projetsGrid.appendChild(carte);
    });
}

function supprimerProjet(id) {
    const projet = projetsAjoutes.find(element => element.id === id);
    if (!projet || !window.confirm(`Retirer « ${projet.titre} » de ce navigateur ?`)) return;

    const anciensProjets = projetsAjoutes;
    projetsAjoutes = projetsAjoutes.filter(element => element.id !== id);
    if (!enregistrerDonneesLocales()) {
        projetsAjoutes = anciensProjets;
        window.alert("La modification n’a pas pu être enregistrée dans ce navigateur.");
        return;
    }
    afficherProjets(document.querySelector(".filtre-btn.active")?.dataset.filter || "all");
}

const boutonsFiltres = document.querySelectorAll(".filtre-btn");
boutonsFiltres.forEach(bouton => {
    bouton.addEventListener("click", () => {
        boutonsFiltres.forEach(element => element.classList.remove("active"));
        bouton.classList.add("active");
        afficherProjets(bouton.dataset.filter || "all");
    });
});

// ========================================================
// Ajout d'un projet avec image redimensionnée
// ========================================================
const projectForm = document.getElementById("projectForm");
const projectImageInput = document.getElementById("projectImage");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewImg = document.getElementById("imagePreviewImg");
const projectFormStatus = document.getElementById("projectFormStatus");
const addProjectButton = document.getElementById("addProjectButton");
let urlApercuImage = "";

function nettoyerApercuImage() {
    if (urlApercuImage) URL.revokeObjectURL(urlApercuImage);
    urlApercuImage = "";
    if (imagePreviewImg) imagePreviewImg.removeAttribute("src");
    if (imagePreview) {
        imagePreview.hidden = true;
        imagePreview.classList.remove("is-visible");
    }
}

if (projectImageInput) {
    projectImageInput.addEventListener("change", () => {
        nettoyerApercuImage();
        const fichier = projectImageInput.files && projectImageInput.files[0];
        if (!fichier) return;

        if (!/^image\/(?:jpeg|png|webp)$/i.test(fichier.type)) {
            afficherStatut(projectFormStatus, "Choisis une image au format JPG, PNG ou WebP.", "error");
            projectImageInput.value = "";
            return;
        }

        urlApercuImage = URL.createObjectURL(fichier);
        imagePreviewImg.src = urlApercuImage;
        imagePreview.hidden = false;
        imagePreview.classList.add("is-visible");
        afficherStatut(projectFormStatus, "Aperçu prêt. L’image sera compressée à l’ajout.", "info");
    });
}

async function compresserImage(fichier) {
    if (!/^image\/(?:jpeg|png|webp)$/i.test(fichier.type)) {
        throw new Error("Choisis une image JPG, PNG ou WebP.");
    }
    if (fichier.size > 15 * 1024 * 1024) {
        throw new Error("L’image dépasse 15 Mo. Choisis une image plus légère.");
    }

    const source = URL.createObjectURL(fichier);
    try {
        const image = await new Promise((resolve, reject) => {
            const element = new Image();
            element.onload = () => resolve(element);
            element.onerror = () => reject(new Error("Cette image n’a pas pu être lue."));
            element.src = source;
        });

        let largeur = image.naturalWidth;
        let hauteur = image.naturalHeight;
        if (!largeur || !hauteur) throw new Error("Les dimensions de cette image sont invalides.");

        const facteur = Math.min(1, 1600 / Math.max(largeur, hauteur));
        largeur = Math.max(1, Math.round(largeur * facteur));
        hauteur = Math.max(1, Math.round(hauteur * facteur));
        const canvas = document.createElement("canvas");
        const contexte = canvas.getContext("2d");
        if (!contexte) throw new Error("La compression d’image n’est pas disponible dans ce navigateur.");

        for (let essai = 0; essai < 5; essai += 1) {
            canvas.width = largeur;
            canvas.height = hauteur;
            contexte.clearRect(0, 0, largeur, hauteur);
            contexte.drawImage(image, 0, 0, largeur, hauteur);

            for (const qualite of [0.82, 0.72, 0.62]) {
                const resultat = canvas.toDataURL("image/webp", qualite);
                if (resultat.length <= TAILLE_MAX_IMAGE) return resultat;
            }

            largeur = Math.max(1, Math.round(largeur * 0.78));
            hauteur = Math.max(1, Math.round(hauteur * 0.78));
        }
        throw new Error("L’image reste trop volumineuse après compression. Essaie une image plus petite.");
    } finally {
        URL.revokeObjectURL(source);
    }
}

if (projectForm) {
    projectForm.addEventListener("submit", async event => {
        event.preventDefault();
        const fichier = projectImageInput && projectImageInput.files && projectImageInput.files[0];
        if (!fichier) {
            afficherStatut(projectFormStatus, "Sélectionne une photo ou une capture d’écran du projet.", "error");
            return;
        }

        const donneesFormulaire = new FormData(projectForm);
        const lienGithub = normaliserLienGithub(String(donneesFormulaire.get("github") || ""));
        const lienDemoValeur = String(donneesFormulaire.get("demo") || "").trim();
        const lienDemo = lienDemoValeur ? normaliserLienWeb(lienDemoValeur) : "";
        if (!lienGithub) {
            afficherStatut(projectFormStatus, "Le lien doit être une adresse HTTPS valide de github.com.", "error");
            return;
        }
        if (lienDemoValeur && !lienDemo) {
            afficherStatut(projectFormStatus, "Le lien de démonstration doit commencer par https://.", "error");
            return;
        }

        addProjectButton.disabled = true;
        addProjectButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Compression de l’image…';
        afficherStatut(projectFormStatus, "Préparation de l’image…", "info");

        try {
            const image = await compresserImage(fichier);
            const technologies = String(donneesFormulaire.get("technologies") || "")
                .split(",")
                .map(technologie => technologie.trim())
                .filter(Boolean)
                .slice(0, 12);
            const projet = normaliserProjet({
                id: genererId(),
                titre: String(donneesFormulaire.get("titre") || ""),
                role: String(donneesFormulaire.get("role") || ""),
                categorie: String(donneesFormulaire.get("categorie") || "Frontend"),
                description: String(donneesFormulaire.get("description") || ""),
                technologies,
                image,
                lienDemo,
                lienGithub
            });

            if (!projet) throw new Error("Vérifie le titre, la description et le lien GitHub du projet.");

            const anciensProjets = projetsAjoutes;
            projetsAjoutes = [...projetsAjoutes, projet];
            if (!enregistrerDonneesLocales()) {
                projetsAjoutes = anciensProjets;
                throw new Error("Le stockage local est plein ou indisponible. Télécharge une sauvegarde ou réduis la taille de l’image.");
            }

            afficherProjets(document.querySelector(".filtre-btn.active")?.dataset.filter || "all");
            projectForm.reset();
            nettoyerApercuImage();
            afficherStatut(projectFormStatus, "Projet ajouté et enregistré dans ce navigateur.", "success");
        } catch (erreur) {
            afficherStatut(projectFormStatus, erreur.message || "Une erreur est survenue pendant l’ajout du projet.", "error");
        } finally {
            addProjectButton.disabled = false;
            addProjectButton.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> Ajouter à mes projets';
        }
    });
}

// ========================================================
// Ajout et suppression de compétences
// ========================================================
const skillsList = document.getElementById("skillsList");
const manageSkillsList = document.getElementById("manageSkillsList");
const skillForm = document.getElementById("skillForm");
const skillInput = document.getElementById("skillInput");
const skillFormStatus = document.getElementById("skillFormStatus");

function afficherCompetences() {
    if (skillsList) {
        skillsList.replaceChildren();
        competences.forEach(competence => {
            const etiquette = document.createElement("span");
            etiquette.className = "skill-chip skill-chip-display";
            etiquette.textContent = competence;
            skillsList.appendChild(etiquette);
        });
    }

    if (manageSkillsList) {
        manageSkillsList.replaceChildren();
        competences.forEach((competence, index) => {
            const etiquette = document.createElement("span");
            etiquette.className = "skill-chip";
            const nom = document.createElement("span");
            nom.textContent = competence;
            const supprimer = document.createElement("button");
            supprimer.className = "remove-skill";
            supprimer.type = "button";
            supprimer.textContent = "×";
            supprimer.setAttribute("aria-label", `Supprimer la compétence ${competence}`);
            supprimer.addEventListener("click", () => {
                const anciennesCompetences = competences;
                competences = competences.filter((_, position) => position !== index);
                if (!enregistrerDonneesLocales()) {
                    competences = anciennesCompetences;
                    afficherStatut(skillFormStatus, "La modification n’a pas pu être enregistrée.", "error");
                    return;
                }
                afficherCompetences();
                afficherStatut(skillFormStatus, `« ${competence} » a été retirée de ce navigateur.`, "success");
            });
            etiquette.append(nom, supprimer);
            manageSkillsList.appendChild(etiquette);
        });
    }
}

if (skillForm) {
    skillForm.addEventListener("submit", event => {
        event.preventDefault();
        const nouvelleCompetence = skillInput.value.trim().slice(0, 40);
        if (!nouvelleCompetence) return;

        if (competences.some(competence => competence.toLocaleLowerCase("fr") === nouvelleCompetence.toLocaleLowerCase("fr"))) {
            afficherStatut(skillFormStatus, "Cette compétence est déjà dans la liste.", "error");
            return;
        }
        if (competences.length >= 60) {
            afficherStatut(skillFormStatus, "La liste contient déjà le maximum de 60 compétences.", "error");
            return;
        }

        const anciennesCompetences = competences;
        competences = [...competences, nouvelleCompetence];
        if (!enregistrerDonneesLocales()) {
            competences = anciennesCompetences;
            afficherStatut(skillFormStatus, "La compétence n’a pas pu être enregistrée dans ce navigateur.", "error");
            return;
        }

        skillInput.value = "";
        afficherCompetences();
        afficherStatut(skillFormStatus, `« ${nouvelleCompetence} » a été ajoutée à ce navigateur.`, "success");
    });
}

// ========================================================
// Sauvegarde et import des données locales (JSON)
// ========================================================
const exportDataButton = document.getElementById("exportDataButton");
const importDataButton = document.getElementById("importDataButton");
const importDataFile = document.getElementById("importDataFile");
const backupStatus = document.getElementById("backupStatus");

if (exportDataButton) {
    exportDataButton.addEventListener("click", () => {
        const contenu = JSON.stringify({
            version: 1,
            dateExport: new Date().toISOString(),
            projets: projetsAjoutes,
            competences
        }, null, 2);
        const fichier = new Blob([contenu], { type: "application/json" });
        const url = URL.createObjectURL(fichier);
        const lien = document.createElement("a");
        lien.href = url;
        lien.download = "portfolio-data.json";
        document.body.appendChild(lien);
        lien.click();
        lien.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        afficherStatut(backupStatus, "Fichier téléchargé. Pour publier, remplace portfolio-data.json dans le dépôt GitHub puis pousse le commit ; Netlify redéploiera si ce dépôt y est connecté.", "success");
    });
}

if (importDataButton && importDataFile) {
    importDataButton.addEventListener("click", () => importDataFile.click());
    importDataFile.addEventListener("change", async () => {
        const fichier = importDataFile.files && importDataFile.files[0];
        if (!fichier) return;

        try {
            const donnees = JSON.parse(await fichier.text());
            if (donnees.version !== 1 || !Array.isArray(donnees.projets) || !Array.isArray(donnees.competences)) {
                throw new Error("Ce fichier n’est pas une sauvegarde de portfolio compatible.");
            }

            const projetsImportes = donnees.projets.map(normaliserProjet);
            if (projetsImportes.some(projet => !projet)) {
                throw new Error("La sauvegarde contient un projet invalide ou une image trop volumineuse.");
            }
            const competencesImportees = normaliserCompetences(donnees.competences);
            if (competencesImportees.length !== donnees.competences.length) {
                throw new Error("La sauvegarde contient une compétence invalide.");
            }

            const anciensProjets = projetsAjoutes;
            const anciennesCompetences = competences;
            projetsAjoutes = projetsImportes;
            competences = competencesImportees;
            if (!enregistrerDonneesLocales()) {
                projetsAjoutes = anciensProjets;
                competences = anciennesCompetences;
                throw new Error("Le stockage de ce navigateur est plein ou indisponible.");
            }

            afficherProjets(document.querySelector(".filtre-btn.active")?.dataset.filter || "all");
            afficherCompetences();
            afficherStatut(backupStatus, "Sauvegarde importée dans ce navigateur.", "success");
            afficherStatut(skillFormStatus, "Les compétences de la sauvegarde ont été importées.", "success");
        } catch (erreur) {
            afficherStatut(backupStatus, erreur.message || "Impossible de lire cette sauvegarde JSON.", "error");
        } finally {
            importDataFile.value = "";
        }
    });
}

// ========================================================
// Navigation, année et formulaire de contact
// ========================================================
const currentYear = document.getElementById("currentYear");
if (currentYear) currentYear.textContent = new Date().getFullYear();

afficherProjets();
afficherCompetences();

async function chargerDonneesPubliees() {
    if (donneesLocales) return;

    try {
        const reponse = await fetch("portfolio-data.json", { cache: "no-cache" });
        if (!reponse.ok) return;
        const donnees = await reponse.json();
        if (donnees.version !== 1 || !Array.isArray(donnees.projets) || !Array.isArray(donnees.competences)) return;

        const projetsPublies = donnees.projets.map(normaliserProjet);
        const competencesPubliees = normaliserCompetences(donnees.competences);
        if (projetsPublies.some(projet => !projet) || competencesPubliees.length !== donnees.competences.length) return;

        projetsAjoutes = projetsPublies;
        competences = competencesPubliees;
        afficherProjets();
        afficherCompetences();
    } catch (erreur) {
        // Le fichier de contenu est facultatif en local ; les projets d'exemple restent disponibles.
        console.info("Le fichier portfolio-data.json n’a pas été chargé.", erreur);
    }
}

if (!donneesLocales) chargerDonneesPubliees();

const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

function basculerMenu() {
    if (!navLinks || !burger) return;
    const ouvert = navLinks.classList.toggle("active");
    burger.setAttribute("aria-expanded", String(ouvert));
    burger.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
}

if (burger && navLinks) {
    burger.addEventListener("click", basculerMenu);
    burger.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            basculerMenu();
        }
    });
    document.querySelectorAll(".nav-links a").forEach(lien => {
        lien.addEventListener("click", () => {
            navLinks.classList.remove("active");
            burger.setAttribute("aria-expanded", "false");
            burger.setAttribute("aria-label", "Ouvrir le menu");
        });
    });
}

const contactForm = document.getElementById("contact-form");
const contactFormStatus = document.getElementById("formStatus");
const contactSubmitButton = document.getElementById("btnSubmit");

if (contactForm && contactSubmitButton) {
    contactForm.addEventListener("submit", async event => {
        event.preventDefault();
        contactSubmitButton.disabled = true;
        contactSubmitButton.textContent = "Envoi en cours…";

        try {
            const reponse = await fetch(contactForm.action, {
                method: contactForm.method,
                body: new FormData(contactForm),
                headers: { Accept: "application/json" }
            });

            if (reponse.ok) {
                afficherStatut(contactFormStatus, "✓ Message envoyé avec succès ! Je vous répondrai rapidement.", "success");
                contactForm.reset();
            } else {
                afficherStatut(contactFormStatus, "Une erreur est survenue lors de l’envoi. Vérifiez la configuration du formulaire.", "error");
            }
        } catch {
            afficherStatut(contactFormStatus, "Erreur de connexion. Réessayez plus tard.", "error");
        } finally {
            contactSubmitButton.disabled = false;
            contactSubmitButton.textContent = "Envoyer le message";
        }
    });
}
