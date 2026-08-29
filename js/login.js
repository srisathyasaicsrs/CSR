(function () {
    "use strict";

    let selectedRole = "Collector";

    window.selectRole = function (role) {
        selectedRole = role;
        document.querySelectorAll(".role-btn").forEach(function (btn) {
            btn.classList.remove("active");
        });
        const map = {
            Collector: "role-btn-collector",
            Nodal: "role-btn-nodal",
            Sponsor: "role-btn-sponsor"
        };
        const el = document.getElementById(map[role]);
        if (el) el.classList.add("active");
    };

    window.handleLogin = async function (event) {
        event.preventDefault();
        const statusEl = document.getElementById("login-status");
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const email = (document.getElementById("username-input").value || "").trim();
        const password = document.getElementById("password-input").value || "";

        function setStatus(message, type) {
            if (!statusEl) return;
            statusEl.textContent = message;
            statusEl.className = "small mt-3 mb-0 eoi-form-status eoi-form-status--" + type;
        }

        if (submitBtn) submitBtn.disabled = true;
        setStatus("Verifying credentials…", "info");

        try {
            const user = await window.csrSupabase.signIn(email, password);
            if (user.role !== selectedRole) {
                await window.csrSupabase.signOut();
                setStatus("This account is registered as " + user.role + ". Select that role and try again.", "error");
                return;
            }
            window.location.href = "dashboard.html";
        } catch (err) {
            const message = err && err.message ? err.message : "Sign-in failed.";
            setStatus(message, "error");
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    };

    document.addEventListener("DOMContentLoaded", async function () {
        try {
            const user = await window.csrSupabase.getCurrentUser();
            if (user) window.location.replace("dashboard.html");
        } catch (err) {
            /* stay on login */
        }
    });
})();
