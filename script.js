
/* =========================================
   CHATLINK 2.0
   HAUPTSCRIPT – script.js
========================================= */

/* =========================================
   1. SUPABASE KONFIGURATION
========================================= */

// Diese beiden Werte findest du in deinem Supabase-Projekt
// unter Project Settings → API.

const SUPABASE_URL = "DEINE_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "DEIN_SUPABASE_PUBLISHABLE_KEY";

// Supabase-Verbindung herstellen

if (!window.supabase) {
    throw new Error("Supabase konnte nicht geladen werden.");
}

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================
   2. HTML ELEMENTE
========================================= */

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const registerUsername = document.getElementById("registerUsername");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");

const forgotPasswordButton = document.getElementById("forgotPassword");
const logoutButton = document.getElementById("logoutButton");

const dashboard = document.getElementById("dashboard");
const welcomeMessage = document.getElementById("welcomeMessage");
const profileArea = document.getElementById("profileArea");

const systemMessage = document.getElementById("systemMessage");


/* =========================================
   3. SYSTEMMELDUNGEN
========================================= */

function showMessage(message, type = "info") {
    systemMessage.textContent = message;
    systemMessage.style.display = "block";

    const colors = {
        success: "#145C2B",
        error: "#a31232",
        info: "#123b80"
    };

    systemMessage.style.borderColor = colors[type] || colors.info;

    systemMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* =========================================
   4. BENUTZERBEREICH
========================================= */

function showDashboard(user) {
    if (!user) return;

    const username =
        user.user_metadata?.username ||
        user.email ||
        "ChatLink-Mitglied";

    welcomeMessage.textContent = `Willkommen, ${username}!`;
    profileArea.textContent = `Angemeldet als: ${user.email}`;

    dashboard.style.display = "block";

    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";

    dashboard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function hideDashboard() {
    dashboard.style.display = "none";

    document.getElementById("login").style.display = "";
    document.getElementById("register").style.display = "";
}


/* =========================================
   5. REGISTRIERUNG
========================================= */

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = registerUsername.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const passwordConfirmation = confirmPassword.value;

    if (username.length < 3) {
        showMessage(
            "Dein Benutzername muss mindestens 3 Zeichen haben.",
            "error"
        );
        return;
    }

    if (password.length < 8) {
        showMessage(
            "Dein Passwort muss mindestens 8 Zeichen haben.",
            "error"
        );
        return;
    }

    if (password !== passwordConfirmation) {
        showMessage(
            "Die beiden Passwörter stimmen nicht überein.",
            "error"
        );
        return;
    }

    const submitButton = registerForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Konto wird erstellt ...";

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (error) throw error;

        if (data.session && data.user) {
            showDashboard(data.user);

            showMessage(
                "Dein ChatLink-Konto wurde erfolgreich erstellt!",
                "success"
            );
        } else {
            showMessage(
                "Registrierung erfolgreich! Bitte überprüfe deine E-Mails und bestätige dein Konto.",
                "success"
            );
        }

        registerForm.reset();

    } catch (error) {
        showMessage(
            "Registrierung fehlgeschlagen: " + error.message,
            "error"
        );

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Konto erstellen";
    }
});


/* =========================================
   6. ANMELDUNG
========================================= */

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    const submitButton = loginForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;
    submitButton.textContent = "Anmeldung läuft ...";

    try {
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) throw error;

        showDashboard(data.user);

        showMessage(
            "Du bist erfolgreich bei ChatLink angemeldet!",
            "success"
        );

        loginForm.reset();

    } catch (error) {
        showMessage(
            "Anmeldung fehlgeschlagen: " + error.message,
            "error"
        );

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Anmelden";
    }
});


/* =========================================
   7. PASSWORT ZURÜCKSETZEN
========================================= */

forgotPasswordButton.addEventListener("click", async () => {
    const email = loginEmail.value.trim();

    if (!email) {
        showMessage(
            "Bitte gib zuerst deine E-Mail-Adresse ein.",
            "error"
        );
        loginEmail.focus();
        return;
    }

    try {
        const { error } =
            await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });

        if (error) throw error;

        showMessage(
            "Falls ein Konto mit dieser Adresse existiert, erhältst du eine E-Mail zum Zurücksetzen deines Passworts.",
            "success"
        );

    } catch (error) {
        showMessage(
            "Fehler beim Zurücksetzen: " + error.message,
            "error"
        );
    }
});


/* =========================================
   8. ABMELDUNG
========================================= */

logoutButton.addEventListener("click", async () => {
    try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) throw error;

        hideDashboard();

        showMessage(
            "Du wurdest erfolgreich abgemeldet.",
            "success"
        );

        window.location.hash = "home";

    } catch (error) {
        showMessage(
            "Abmeldung fehlgeschlagen: " + error.message,
            "error"
        );
    }
});


/* =========================================
   9. ANMELDESTATUS ÜBERPRÜFEN
========================================= */

async function checkLoginStatus() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        showMessage(
            "Dein Anmeldestatus konnte nicht überprüft werden.",
            "error"
        );
        return;
    }

    if (data.session?.user) {
        showDashboard(data.session.user);
    } else {
        hideDashboard();
    }
}


/* =========================================
   10. ÄNDERUNGEN DER SESSION ERKENNEN
========================================= */

supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
        showDashboard(session.user);
    }

    if (event === "SIGNED_OUT") {
        hideDashboard();
    }

    if (event === "PASSWORD_RECOVERY") {
        showMessage(
            "Du kannst jetzt dein Passwort zurücksetzen.",
            "info"
        );
    }
});


/* =========================================
   11. CHATLINK STARTEN
========================================= */

checkLoginStatus();

console.log("ChatLink 2.0 – script.js geladen.");
