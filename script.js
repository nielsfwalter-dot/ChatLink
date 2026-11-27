
/* =========================================
   CHATLINK 2.1 – MAIN SCRIPT
   Anmeldung, Registrierung und Server
========================================= */

import {
    register,
    login,
    logout,
    getSession,
    resetPassword,
    listenToAuthChanges
} from "./backend/auth.js";

import {
    createServer,
    getMyServers
} from "./backend/servers.js";

// -----------------------------------------
// ELEMENTE
// -----------------------------------------

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginSection = document.getElementById("login");
const registerSection = document.getElementById("register");
const dashboard = document.getElementById("dashboard");

const welcomeMessage = document.getElementById("welcomeMessage");
const profileArea = document.getElementById("profileArea");
const systemMessage = document.getElementById("systemMessage");

const logoutButton = document.getElementById("logoutButton");
const forgotPasswordButton = document.getElementById("forgotPassword");

const serverForm = document.getElementById("serverForm");
const serverNameInput = document.getElementById("serverName");
const serverList = document.getElementById("serverList");

// -----------------------------------------
// NACHRICHTEN
// -----------------------------------------

function showMessage(message, type = "info") {
    if (!systemMessage) return;

    systemMessage.textContent = message;
    systemMessage.dataset.type = type;
    systemMessage.hidden = false;
}

function clearMessage() {
    if (!systemMessage) return;

    systemMessage.textContent = "";
    systemMessage.hidden = true;
}

// -----------------------------------------
// ANSICHTEN
// -----------------------------------------

function showDashboard(user) {
    loginSection.hidden = true;
    registerSection.hidden = true;
    dashboard.hidden = false;

    const username =
        user.user_metadata?.username ||
        user.email ||
        "ChatLink-Mitglied";

    welcomeMessage.textContent = `Willkommen, ${username}!`;
    profileArea.textContent = `Angemeldet als: ${user.email || ""}`;

    loadServers();
}

function hideDashboard() {
    dashboard.hidden = true;
    loginSection.hidden = false;
    registerSection.hidden = false;

    if (serverList) {
        serverList.replaceChildren();
    }
}

// -----------------------------------------
// REGISTRIERUNG
// -----------------------------------------

registerForm?.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    const username = document
        .getElementById("registerUsername")
        .value.trim();

    const email = document
        .getElementById("registerEmail")
        .value.trim();

    const password = document
        .getElementById("registerPassword")
        .value;

    const confirmation = document
        .getElementById("confirmPassword")
        .value;

    if (username.length < 3) {
        showMessage(
            "Dein Benutzername muss mindestens 3 Zeichen lang sein.",
            "error"
        );
        return;
    }

    if (password.length < 8) {
        showMessage(
            "Dein Passwort muss mindestens 8 Zeichen lang sein.",
            "error"
        );
        return;
    }

    if (password !== confirmation) {
        showMessage("Die Passwörter stimmen nicht überein.", "error");
        return;
    }

    try {
        const result = await register(username, email, password);

        registerForm.reset();

        if (result.session && result.user) {
            showDashboard(result.user);
            showMessage("Dein ChatLink-Konto wurde erstellt!", "success");
        } else {
            showMessage(
                "Registrierung gestartet! Bitte bestätige deine E-Mail-Adresse.",
                "success"
            );
        }
    } catch (error) {
        showMessage(
            `Registrierungsfehler: ${error.message}`,
            "error"
        );
    }
});

// -----------------------------------------
// LOGIN
// -----------------------------------------

loginForm?.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    const email = document
        .getElementById("loginEmail")
        .value.trim();

    const password = document
        .getElementById("loginPassword")
        .value;

    try {
        const result = await login(email, password);

        loginForm.reset();
        showDashboard(result.user);
        showMessage("Du bist erfolgreich angemeldet.", "success");
    } catch (error) {
        showMessage(
            `Anmeldefehler: ${error.message}`,
            "error"
        );
    }
});

// -----------------------------------------
// PASSWORT ZURÜCKSETZEN
// -----------------------------------------

forgotPasswordButton?.addEventListener("click", async () => {
    clearMessage();

    const email = document
        .getElementById("loginEmail")
        .value.trim();

    if (!email) {
        showMessage(
            "Bitte gib zuerst deine E-Mail-Adresse ein.",
            "error"
        );
        return;
    }

    try {
        await resetPassword(email);

        showMessage(
            "Falls ein Konto mit dieser Adresse existiert, wurde eine E-Mail zum Zurücksetzen angefordert.",
            "success"
        );
    } catch (error) {
        showMessage(
            `Fehler beim Zurücksetzen: ${error.message}`,
            "error"
        );
    }
});

// -----------------------------------------
// LOGOUT
// -----------------------------------------

logoutButton?.addEventListener("click", async () => {
    clearMessage();

    try {
        await logout();
        hideDashboard();
        showMessage("Du wurdest erfolgreich abgemeldet.", "success");
    } catch (error) {
        showMessage(
            `Abmeldefehler: ${error.message}`,
            "error"
        );
    }
});

// -----------------------------------------
// SERVER LADEN
// -----------------------------------------

async function loadServers() {
    if (!serverList) return;

    serverList.replaceChildren();

    try {
        const servers = await getMyServers();

        if (!servers.length) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent =
                "Du hast noch keine Server. Erstelle deinen ersten!";
            serverList.appendChild(emptyMessage);
            return;
        }

        for (const server of servers) {
            const item = document.createElement("article");
            item.className = "server-item";

            const name = document.createElement("h3");
            name.textContent = server.name;

            const date = document.createElement("p");
            date.textContent = server.created_at
                ? `Erstellt: ${new Date(server.created_at).toLocaleDateString("de-DE")}`
                : "";

            item.append(name, date);
            serverList.appendChild(item);
        }
    } catch (error) {
        showMessage(
            `Server konnten nicht geladen werden: ${error.message}`,
            "error"
        );
    }
}

// -----------------------------------------
// SERVER ERSTELLEN
// -----------------------------------------

serverForm?.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    const name = serverNameInput.value.trim();

    if (name.length < 2 || name.length > 60) {
        showMessage(
            "Der Servername muss zwischen 2 und 60 Zeichen lang sein.",
            "error"
        );
        return;
    }

    try {
        await createServer(name);

        serverForm.reset();
        showMessage("Dein Server wurde erstellt!", "success");

        await loadServers();
    } catch (error) {
        showMessage(
            `Server konnte nicht erstellt werden: ${error.message}`,
            "error"
        );
    }
});

// -----------------------------------------
// AUTHENTIFIZIERUNG BEOBACHTEN
// -----------------------------------------

listenToAuthChanges((event, session) => {
    if (session?.user) {
        showDashboard(session.user);
    } else if (event === "SIGNED_OUT") {
        hideDashboard();
    }
});

// -----------------------------------------
// BEIM START SITZUNG PRÜFEN
// -----------------------------------------

async function initializeChatLink() {
    try {
        const session = await getSession();

        if (session?.user) {
            showDashboard(session.user);
        } else {
            hideDashboard();
        }
    } catch (error) {
        hideDashboard();

        showMessage(
            `ChatLink konnte die Sitzung nicht prüfen: ${error.message}`,
            "error"
        );
    }
}

initializeChatLink();

console.log("ChatLink 2.1 – Main Script geladen.");
