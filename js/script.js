document.addEventListener('DOMContentLoaded', () => {
    // Menu Burger
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            // Toggle Nav
            nav.classList.toggle('nav-active');

            // Animate Links
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Burger Animation
            burger.classList.toggle('toggle');
        });
    }

    // Fermer le menu mobile lorsqu'un lien est cliqué
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('nav-active')) {
                nav.classList.remove('nav-active');
                burger.classList.remove('toggle');
                navLinks.forEach(l => l.style.animation = ''); // Reset animation
            }
        });
    });


    // Mise à jour de l'année dans le footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Optionnel : Active link highlighting based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLi = document.querySelectorAll('header nav ul li a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Ajustement pour que la section soit considérée "active" un peu avant d'atteindre le haut
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLi.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').substring(1) === current) {
                a.classList.add('active');
            }
        });
    });


    // Optionnel : Soumission du formulaire (si vous n'utilisez pas Formspree ou voulez un retour)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Si vous utilisez Formspree, cette partie n'est pas nécessaire
            // car Formspree gère la redirection.
            // Vous pourriez l'utiliser pour afficher un message de succès localement
            // ou pour une validation JS plus poussée avant l'envoi.

            // Exemple :
            // e.preventDefault(); // Décommentez si vous gérez l'envoi via AJAX
            // console.log('Formulaire soumis');
            // alert('Merci pour votre message ! Je vous répondrai bientôt.');
            // this.reset(); // Réinitialise le formulaire
        });
    }

});