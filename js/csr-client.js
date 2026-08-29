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

    async function api(path, options) {
        const opts = options || {};
        const res = await fetch(path, {
            method: opts.method || "GET",
            credentials: "same-origin",
            headers: opts.body ? { "content-type": "application/json" } : undefined,
            body: opts.body ? JSON.stringify(opts.body) : undefined
        });
        let payload = null;
        try {
            payload = await res.json();
        } catch (err) {
            payload = null;
        }
        if (!res.ok) {
            throw new Error((payload && payload.error) || "Request failed.");
        }
        return payload;
    }

    async function getCurrentUser() {
        const payload = await api("/api/me");
        return payload && payload.user ? payload.user : null;
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
        const payload = await api("/api/auth/login", {
            method: "POST",
            body: { email: email, password: password }
        });
        if (!payload.user) throw new Error("Sign-in failed.");
        return payload.user;
    }

    async function signUpSponsor(fields) {
        const payload = await api("/api/auth/signup", {
            method: "POST",
            body: {
                email: fields.email,
                password: fields.password,
                company: fields.company,
                display_name: fields.display_name
            }
        });
        if (!payload.user) throw new Error("Sign-up failed.");
        return payload.user;
    }

    async function signInWithGoogle() {
        throw new Error("Google sign-in is not enabled. Create a sponsor account with email and password, or ask the Collectorate IT cell to add a Google OAuth client.");
    }

    async function signOut() {
        try {
            await api("/api/auth/logout", { method: "POST" });
        } catch (err) {
            /* still clear local leftovers */
        }
        sessionStorage.clear();
        localStorage.removeItem("csr_current_user");
        localStorage.removeItem("csr_auth_token");
        localStorage.removeItem("csr_authenticated");
    }

    window.csrEscapeHtml = escapeHtml;
    window.csrSupabase = {
        getCurrentUser: getCurrentUser,
        requireSession: requireSession,
        signIn: signIn,
        signUpSponsor: signUpSponsor,
        signInWithGoogle: signInWithGoogle,
        signOut: signOut
    };
})();
