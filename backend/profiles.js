
/* =========================================
   CHATLINK 2.1 – USER PROFILES
========================================= */

import { supabase } from "./config.js";

export async function getProfile(userId) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;

    return data;
}

export async function updateProfile(username) {
    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError) throw userError;

    if (!userData.user) {
        throw new Error("Du musst angemeldet sein.");
    }

    const { data, error } = await supabase
        .from("profiles")
        .update({
            username,
            updated_at: new Date().toISOString()
        })
        .eq("id", userData.user.id)
        .select()
        .single();

    if (error) throw error;

    return data;
}
