(function () {
    "use strict";

    function client() {
        return window.csrSupabase.getClient();
    }

    async function submitProposal(payload) {
        const { error } = await client()
            .from("proposals")
            .insert({
                company_name: payload.company_name,
                contact_person: payload.contact_person,
                email: payload.email,
                phone: payload.phone,
                sector: payload.sector,
                outlay_amount: payload.outlay_amount,
                location: payload.location || "Sri Sathya Sai District",
                details: payload.details || null,
                consent_given: true,
                nodal_status: "Submitted",
                sponsor_status: "Viewed",
                sponsor_user_id: null,
                nodal_notes: null
            });

        if (error) throw error;
    }

    async function listProposals() {
        const { data, error } = await client()
            .from("proposals")
            .select("id, company_name, contact_person, email, phone, sector, outlay_amount, location, details, nodal_status, sponsor_status, nodal_notes, created_at, sponsor_user_id")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async function updateProposalStage(id, fields) {
        const { error } = await client()
            .from("proposals")
            .update({
                nodal_status: fields.nodal_status,
                sponsor_status: fields.sponsor_status,
                nodal_notes: fields.nodal_notes
            })
            .eq("id", id);
        if (error) throw error;
    }

    async function listSponsors() {
        const { data, error } = await client()
            .from("sponsors")
            .select("id, company, email, phone, sector, mandal, status, user_id, created_at")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async function createSponsor(fields) {
        const { data, error } = await client()
            .from("sponsors")
            .insert({
                company: fields.company,
                email: fields.email,
                phone: fields.phone || null,
                sector: fields.sector || null,
                mandal: fields.mandal || null,
                status: "Active"
            })
            .select("id")
            .maybeSingle();
        if (error) throw error;
        return data;
    }

    async function listProjects() {
        const { data, error } = await client()
            .from("projects")
            .select("id, title, mandal, sector, budget, sponsor, status, progress_pct, milestones")
            .order("id", { ascending: true });
        if (error) throw error;
        return data || [];
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
