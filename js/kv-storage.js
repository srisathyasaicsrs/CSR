/**
 * kv-storage.js - Storage Sync Engine (Cloudflare KV & LocalStorage Fallback)
 * Sri Sathya Sai District CSR Portal
 */

(function () {
    "use strict";

    // Initial Mock Data Store for First Launch
    const initialSponsors = [
        {
            id: "sp-101",
            username: "kia_motors",
            company: "KIA Motors India",
            email: "csr.kia@kiamotors.in",
            role: "Sponsor",
            mandal: "Penukonda",
            fundedProjects: ["Penukonda Skill Development Center"],
            totalContribution: "₹1,20,00,000",
            status: "Active"
        },
        {
            id: "sp-102",
            username: "tata_trusts",
            company: "Tata Trusts Foundation",
            email: "csr@tatatrusts.org",
            role: "Sponsor",
            mandal: "Dharmavaram",
            fundedProjects: ["Dharmavaram Digital Schools"],
            totalContribution: "₹45,00,000",
            status: "Under Review"
        }
    ];

    const initialProposals = [
        {
            id: "prop-201",
            company: "KIA Motors India",
            person: "R. Venkat Rao (CSR Lead)",
            email: "csr.kia@kiamotors.in",
            phone: "+91 98490 12345",
            sector: "Education",
            outlay: "₹1.20 Crores",
            location: "Penukonda Division",
            date: "2026-07-28",
            status: "Approved",
            notes: "Single-window clearance granted by Collectorate."
        },
        {
            id: "prop-202",
            company: "L&T Construction Foundation",
            person: "K. Sunder Raj",
            email: "csr@lntecc.com",
            phone: "+91 94401 56789",
            sector: "Roads",
            outlay: "₹85 Lakhs",
            location: "Puttaparthi-Bukkapatnam Stretch",
            date: "2026-07-30",
            status: "Pending Review",
            notes: "Pending site inspection by Nodal Officer."
        }
    ];

    const initialProjects = [
        {
            id: "proj-1",
            title: "Penukonda EV Skill Training Center",
            mandal: "Penukonda",
            sector: "Education",
            budget: "₹1,20,00,000",
            sponsor: "KIA Motors India",
            status: "In Progress",
            progressPct: 75,
            milestones: [
                { title: "Land Allocation & NOC", date: "2026-02-15", status: "Completed" },
                { title: "Civil Structure & Roofing", date: "2026-05-10", status: "Completed" },
                { title: "EV Equipment & Motors Installation", date: "2026-07-20", status: "In Progress" }
            ]
        },
        {
            id: "proj-2",
            title: "Puttaparthi Super-Specialty Tele-Medicine Clinic",
            mandal: "Puttaparthi",
            sector: "Health",
            budget: "₹85,00,000",
            sponsor: "Available for Sponsorship",
            status: "Proposed",
            progressPct: 0,
            milestones: [
                { title: "Detailed Project Report (DPR)", date: "2026-06-01", status: "Completed" }
            ]
        }
    ];

    // Storage Initialization
    if (!localStorage.getItem("csr_sponsors")) {
        localStorage.setItem("csr_sponsors", JSON.stringify(initialSponsors));
    }
    if (!localStorage.getItem("csr_proposals")) {
        localStorage.setItem("csr_proposals", JSON.stringify(initialProposals));
    }
    if (!localStorage.getItem("csr_projects")) {
        localStorage.setItem("csr_projects", JSON.stringify(initialProjects));
    }

    window.kvStorage = {
        getSponsors: () => JSON.parse(localStorage.getItem("csr_sponsors") || "[]"),
        addSponsor: (sponsor) => {
            const list = JSON.parse(localStorage.getItem("csr_sponsors") || "[]");
            list.push(sponsor);
            localStorage.setItem("csr_sponsors", JSON.stringify(list));
        },
        getProposals: () => JSON.parse(localStorage.getItem("csr_proposals") || "[]"),
        addProposal: (prop) => {
            const list = JSON.parse(localStorage.getItem("csr_proposals") || "[]");
            list.unshift(prop);
            localStorage.setItem("csr_proposals", JSON.stringify(list));
        },
        updateProposalStatus: (id, status) => {
            const list = JSON.parse(localStorage.getItem("csr_proposals") || "[]");
            const item = list.find(x => x.id === id);
            if (item) {
                item.status = status;
                localStorage.setItem("csr_proposals", JSON.stringify(list));
            }
        },
        getProjects: () => JSON.parse(localStorage.getItem("csr_projects") || "[]"),
        updateProjectProgress: (id, pct, milestoneTitle) => {
            const list = JSON.parse(localStorage.getItem("csr_projects") || "[]");
            const item = list.find(x => x.id === id);
            if (item) {
                item.progressPct = pct;
                if (milestoneTitle) {
                    item.milestones.push({
                        title: milestoneTitle,
                        date: new Date().toISOString().split("T")[0],
                        status: pct >= 100 ? "Completed" : "In Progress"
                    });
                }
                localStorage.setItem("csr_projects", JSON.stringify(list));
            }
        }
    };
})();
