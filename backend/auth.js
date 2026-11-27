
/* =========================================
   CHATLINK 2.1 – AUTHENTICATION
========================================= */

import { supabase } from "./config.js";

export async function register(username, email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username }
        }
    });

    if (error) throw error;

    return data;
}

export async function login(email, password) {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email,
            password
        });

    if (error) throw error;

    return data;
}

export async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
}

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data.session;
}

export async function resetPassword(email) {
    const { error } =
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });

    if (error) throw error;
}

export function listenToAuthChanges(callback) {
    return supabase.auth.onAuthStateChange(callback);
}
