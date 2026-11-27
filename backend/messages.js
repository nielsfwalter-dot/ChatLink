
/* =========================================
   CHATLINK 2.1 – MESSAGES
========================================= */

import { supabase } from "./config.js";

export async function getMessages(serverId) {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("server_id", serverId)
        .order("created_at", { ascending: true });

    if (error) throw error;

    return data;
}

export async function sendMessage(serverId, content) {
    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError) throw userError;

    if (!userData.user) {
        throw new Error("Du musst angemeldet sein.");
    }

    const message = content.trim();

    if (!message || message.length > 4000) {
        throw new Error("Ungültige Nachrichtenlänge.");
    }

    const { data, error } = await supabase
        .from("messages")
        .insert({
            server_id: serverId,
            sender_id: userData.user.id,
            content: message
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}

export function subscribeToMessages(serverId, callback) {
    return supabase
        .channel(`chatlink-server-${serverId}`)
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "messages",
                filter: `server_id=eq.${serverId}`
            },
            payload => callback(payload.new)
        )
        .subscribe();
}

export async function unsubscribeFromMessages(channel) {
    if (channel) {
        await supabase.removeChannel(channel);
    }
}
