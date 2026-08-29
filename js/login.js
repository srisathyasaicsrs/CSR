(function () {
    "use strict";

    let selectedRole = "Collector";

    function setStatus(message, type) {
        const statusEl = document.getElementById("login-status");
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.className = "small mt-3 mb-0 eoi-form-status eoi-form-status--" + type;
    }

    function syncLoginMode() {
        const staffForm = document.getElementById("staff-login-form");
        const sponsorPanel = document.getElementById("sponsor-login-panel");
        const isSponsor = selectedRole === "Sponsor";
        if (staffForm) staffForm.hidden = isSponsor;
        if (sponsorPanel) sponsorPanel.hidden = !isSponsor;
        const emailInput = document.getElementById("username-input");
        const passwordInput = document.getElementById("password-input");
        if (emailInput) emailInput.required = !isSponsor;
        if (passwordInput) passwordInput.required = !isSponsor;
        if (emailInput && !isSponsor) {
            emailInput.placeholder = selectedRole === "Nodal"
                ? "csr.sssdistrict@gmail.com"
                : "name@ap.gov.in";
        }
    }

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
        setStatus("", "info");
        syncLoginMode();
    };

    window.handleLogin = async function (event) {
        event.preventDefault();
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const email = (document.getElementById("username-input").value || "").trim();
        const password = document.getElementById("password-input").value || "";

        if (selectedRole === "Sponsor") {
            setStatus("Use the sponsor form to sign in or create an account.", "error");
            return;
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

    window.handleSponsorLogin = async function () {
        const email = (document.getElementById("sponsor-email-input").value || "").trim();
        const password = document.getElementById("sponsor-password-input").value || "";
        setStatus("Verifying credentials…", "info");
        try {
            const user = await window.csrSupabase.signIn(email, password);
            if (user.role !== "Sponsor") {
                await window.csrSupabase.signOut();
                setStatus("This account is registered as " + user.role + ". Select that role and try again.", "error");
                return;
            }
            window.location.href = "dashboard.html";
        } catch (err) {
            setStatus(err && err.message ? err.message : "Sign-in failed.", "error");
        }
    };

    window.handleSponsorSignup = async function () {
        const company = (document.getElementById("sponsor-company-input").value || "").trim();
        const email = (document.getElementById("sponsor-email-input").value || "").trim();
        const password = document.getElementById("sponsor-password-input").value || "";
        setStatus("Creating sponsor account…", "info");
        try {
            const user = await window.csrSupabase.signUpSponsor({
                company: company,
                email: email,
                password: password,
                display_name: company
            });
            if (user.role !== "Sponsor") {
                await window.csrSupabase.signOut();
                setStatus("Account created, but it is not a sponsor role.", "error");
                return;
            }
            window.location.href = "dashboard.html";
        } catch (err) {
            setStatus(err && err.message ? err.message : "Sign-up failed.", "error");
        }
    };

    document.addEventListener("DOMContentLoaded", async function () {
        syncLoginMode();
        try {
            const user = await window.csrSupabase.getCurrentUser();
            if (user) window.location.replace("dashboard.html");
        } catch (err) {
            /* stay on login */
        }
    });
})();
