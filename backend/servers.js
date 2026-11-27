
/* =========================================
   CHATLINK 2.1 – CHAT SERVERS
========================================= */

import { supabase } from "./config.js";

export async function createServer(name) {
    const serverName = name.trim();

    if (serverName.length < 2 || serverName.length > 60) {
        throw new Error(
            "Der Servername muss zwischen 2 und 60 Zeichen haben."
        );
    }

    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError) throw userError;

    if (!userData.user) {
        throw new Error("Du musst angemeldet sein.");
    }

    const { data, error } = await supabase
        .from("servers")
        .insert({
            name: serverName,
            owner_id: userData.user.id
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export async function getMyServers() {
    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError) throw userError;

    if (!userData.user) {
        throw new Error("Du musst angemeldet sein.");
    }

    const { data, error } = await supabase
        .from("servers")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
}

export async function deleteServer(serverId) {
    const { error } = await supabase
        .from("servers")
        .delete()
        .eq("id", serverId);

    if (error) throw error;
}
