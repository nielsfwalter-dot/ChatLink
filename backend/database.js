
/* =========================================
   CHATLINK 2.1 – DATABASE
========================================= */

import { supabase } from "./config.js";

export function checkDatabaseResult(result) {
    if (result.error) {
        throw result.error;
    }

    return result.data;
}

export async function getCurrentUser() {
    const result = await supabase.auth.getUser();

    if (result.error) {
        throw result.error;
    }

    return result.data.user;
}

export async function checkConnection() {
    const result = await supabase.auth.getSession();

    if (result.error) {
        throw result.error;
    }

    return true;
}
