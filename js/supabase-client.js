(function () {
    "use strict";

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function getClient() {
        if (window.__csrSupabase) return window.__csrSupabase;
        if (typeof supabase === "undefined" || !window.CSR_SUPABASE) {
            throw new Error("Supabase client is not loaded.");
        }
        window.__csrSupabase = supabase.createClient(
            window.CSR_SUPABASE.url,
            window.CSR_SUPABASE.publishableKey,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                    storageKey: "csr-sss-auth"
                }
            }
        );
        return window.__csrSupabase;
    }

    async function getCurrentUser() {
        const client = getClient();
        const { data, error } = await client.auth.getUser();
        if (error || !data.user) return null;

        const { data: profile } = await client
            .from("profiles")
            .select("id, role, display_name, title, company, email, phone, mandal")
            .eq("id", data.user.id)
            .maybeSingle();

        if (!profile) return null;

        const roleLabel = profile.role === "collector"
            ? "Collector"
            : profile.role === "nodal"
                ? "Nodal"
                : "Sponsor";

        return {
            id: profile.id,
            email: profile.email || data.user.email,
            role: roleLabel,
            roleKey: profile.role,
            name: profile.display_name,
            title: profile.title || "",
            company: profile.company || "",
            phone: profile.phone || "",
            mandal: profile.mandal || ""
        };
    }

    async function requireSession() {
        const user = await getCurrentUser();
        if (!user) {
            window.location.replace("login.html");
            return null;
        }
        return user;
    }

    async function signIn(email, password) {
        const client = getClient();
        const { data, error } = await client.auth.signInWithPassword({
            email: String(email || "").trim(),
            password: String(password || "")
        });
        if (error) throw error;
        if (!data.user) throw new Error("Sign-in failed.");
        const user = await getCurrentUser();
        if (!user) throw new Error("This account has no CSR profile. Contact the Collectorate IT cell.");
        return user;
    }

    async function signOut() {
        try {
            await getClient().auth.signOut();
        } catch (err) {
            /* still clear local session below */
        }
        sessionStorage.clear();
        localStorage.removeItem("csr_current_user");
        localStorage.removeItem("csr_auth_token");
        localStorage.removeItem("csr_authenticated");
    }

    window.csrEscapeHtml = escapeHtml;
    window.csrSupabase = {
        getClient: getClient,
        getCurrentUser: getCurrentUser,
        requireSession: requireSession,
        signIn: signIn,
        signOut: signOut
    };
})();
