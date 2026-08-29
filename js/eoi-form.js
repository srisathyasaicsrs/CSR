(function () {
    "use strict";

    window.handlePublicEoISubmit = async function (event) {
        event.preventDefault();

        const form = document.getElementById("public-eoi-form");
        const statusEl = document.getElementById("eoi-form-status");
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        const honeypot = document.getElementById("eoi-website");
        const consent = document.getElementById("dpdp-consent-check");

        function setStatus(message, type) {
            if (!statusEl) return;
            statusEl.textContent = message;
            statusEl.className = "small mt-3 mb-0 eoi-form-status eoi-form-status--" + type;
        }

        if (honeypot && honeypot.value) {
            setStatus("Proposal received.", "success");
            return;
        }

        if (!consent || !consent.checked) {
            setStatus("Please agree to the Privacy Policy before submitting.", "error");
            return;
        }

        const company_name = (document.getElementById("eoi-company").value || "").trim();
        const contact_person = (document.getElementById("eoi-person").value || "").trim();
        const email = (document.getElementById("eoi-email").value || "").trim();
        const phone = (document.getElementById("eoi-phone").value || "").trim();
        const sector = document.getElementById("eoi-sector").value;
        const outlay_amount = document.getElementById("eoi-outlay").value;
        const details = (document.getElementById("eoi-details").value || "").trim();

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute("aria-busy", "true");
        }
        setStatus("Sending your proposal to the District CSR Cell…", "info");

        try {
            await window.csrApi.submitProposal({
                company_name: company_name,
                contact_person: contact_person,
                email: email,
                phone: phone,
                sector: sector,
                outlay_amount: outlay_amount,
                location: "Sri Sathya Sai District",
                details: details
            });
            form.reset();
            if (consent) consent.checked = false;
            setStatus("Thank you. Your Expression of Interest has been recorded with the District CSR Facilitation Cell.", "success");
        } catch (err) {
            setStatus("The proposal could not be sent. Please check your details and try again, or email collector-sssai@ap.gov.in.", "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.removeAttribute("aria-busy");
            }
        }
    };
})();
