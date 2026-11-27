
"use strict";

// ChatLink Admin Panel 2.1
// Version 0.4

document.addEventListener("DOMContentLoaded", () => {
    console.log("ChatLink Admin Panel – Version 0.4 geladen.");

    const navigationLinks = document.querySelectorAll(
        ".sidebar nav a"
    );

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            navigationLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    });

    const sections = document.querySelectorAll(".section");

    sections.forEach((section) => {
        section.addEventListener("focus", () => {
            console.log("Bereich geöffnet:", section.id);
        });
    });
});
