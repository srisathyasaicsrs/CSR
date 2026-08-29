(function () {
    "use strict";

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

    async function submitProposal(payload) {
        await api("/api/proposals", { method: "POST", body: payload });
    }

    async function listProposals() {
        const payload = await api("/api/proposals");
        return payload.data || [];
    }

    async function updateProposalStage(id, fields) {
        await api("/api/proposals/" + encodeURIComponent(id), {
            method: "PATCH",
            body: {
                nodal_status: fields.nodal_status,
                sponsor_status: fields.sponsor_status,
                nodal_notes: fields.nodal_notes
            }
        });
    }

    async function listSponsors() {
        const payload = await api("/api/sponsors");
        return payload.data || [];
    }

    async function createSponsor(fields) {
        return api("/api/sponsors", { method: "POST", body: fields });
    }

    async function listProjects() {
        const payload = await api("/api/projects");
        return payload.data || [];
    }

    window.csrApi = {
        submitProposal: submitProposal,
        listProposals: listProposals,
        updateProposalStage: updateProposalStage,
        listSponsors: listSponsors,
        createSponsor: createSponsor,
        listProjects: listProjects
    };
})();
