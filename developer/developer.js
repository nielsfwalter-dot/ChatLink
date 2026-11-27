
"use strict";

// ChatLink Developer Portal
// Version 0.1

document.addEventListener("DOMContentLoaded", () => {
    console.log("ChatLink Developer Portal – Version 0.1 geladen.");

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

    const createAppButton = document.getElementById("createAppButton");
    const appMessage = document.getElementById("appMessage");

    if (createAppButton && appMessage) {
        createAppButton.addEventListener("click", () => {
            appMessage.textContent =
                "Die App-Erstellung wird in einer späteren Version verfügbar sein.";
        });
    }

    console.log("Developer-Navigation initialisiert.");
});
