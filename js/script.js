// ========================================================
// 1. LA BASE DE DONNÉES DE TES PROJETS (Modifie ici !)
// ========================================================
const PROJETS = [
    {
        titre: "Avant Tout",
        categorie: "Frontend", // Utilisé pour les filtres : "Frontend", "Fullstack", "Mobile"
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
    // 👉 POUR AJOUTER UN NOUVEAU PROJET PLUS TARD, COPIE UN BLOC ET COLLE-LE ICI !
];

// ========================================================
// 2. FONCTION DE RENDU DYNAMIQUE
// ========================================================
const projetsGrid = document.getElementById("projetsGrid");

function afficherProjets(filtre = "all") {
    // Filtrage des données
    const projetsFiltres = filtre === "all" 
        ? PROJETS 
        : PROJETS.filter(p => p.categorie.toLowerCase() === filtre.toLowerCase());

    // Génération du HTML
    projetsGrid.innerHTML = projetsFiltres.map(p => `
        <div class="projet-carte">
            <img src="${p.image}" alt="${p.titre}" loading="lazy">
            <div class="projet-corps">
                <span class="projet-role">${p.role}</span>
                <h3>${p.titre}</h3>
                <p class="projet-description">${p.description}</p>
                <div class="technologies">
                    ${p.technologies.map(tech => `<span>${tech}</span>`).join("")}
                </div>
                <div class="projet-liens">
                    ${p.lienDemo ? `<a href="${p.lienDemo}" target="_blank" class="btn btn-primary btn-sm">Voir Démo ↗</a>` : ""}
                    ${p.lienGithub ? `<a href="${p.lienGithub}" target="_blank" class="btn btn-secondary btn-sm"><i class="fab fa-github"></i> Code</a>` : ""}
                </div>
            </div>
        </div>
    `).join("");
}

// Initialisation au chargement
afficherProjets();

// ========================================================
// 3. GESTION DES FILTRES
// ========================================================
const boutonsFiltres = document.querySelectorAll(".filtre-btn");

boutonsFiltres.forEach(btn => {
    btn.addEventListener("click", () => {
        // Style actif
        boutonsFiltres.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // Filtrage
        const categorie = btn.getAttribute("data-filter");
        afficherProjets(categorie);
    });
});

// ========================================================
// 4. AUTOMATISATIONS PRATIQUES
// ========================================================

// Année actuelle automatique
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Menu Mobile
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

burger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});

// Fermer le menu après un clic sur un lien
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => navLinks.classList.remove("active"));
});

// Envoi AJAX Formspree (Évite le rechargement et la redirection moche)
const form = document.getElementById("contact-form");
const formStatus = document.getElementById("formStatus");
const btnSubmit = document.getElementById("btnSubmit");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Envoi en cours...";

    const data = new FormData(form);
    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: data,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            formStatus.innerHTML = "<span style='color: #16a34a;'>✓ Message envoyé avec succès ! Je vous répondrai rapidement.</span>";
            form.reset();
        } else {
            formStatus.innerHTML = "<span style='color: #dc2626;'>Une erreur est survenue lors de l'envoi.</span>";
        }
    } catch (error) {
        formStatus.innerHTML = "<span style='color: #dc2626;'>Erreur de connexion.</span>";
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Envoyer le message";
    }
});