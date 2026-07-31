/**
 * auth-dashboard.js - Multi-Role Dashboard Controller
 * Sri Sathya Sai District CSR Portal
 */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const userStr = localStorage.getItem("csr_current_user");
        const isDashboardPage = document.getElementById("collector-panel") !== null;
        if (!userStr && isDashboardPage) {
            window.location.href = "login.html";
            return;
        }

        const user = JSON.parse(userStr || '{"role":"Collector","name":"Sri A. Shyam Prasad, I.A.S","title":"District Collector & Magistrate"}');
        
        // Render Header User Info
        const userNameEl = document.getElementById("dash-user-name");
        const userTitleEl = document.getElementById("dash-user-title");
        const userRoleBadgeEl = document.getElementById("dash-role-badge");

        if (userNameEl) userNameEl.innerText = user.name;
        if (userTitleEl) userTitleEl.innerText = user.title;
        if (userRoleBadgeEl) {
            userRoleBadgeEl.innerText = user.role.toUpperCase() + " WORKSPACE";
            if (user.role === "Collector") userRoleBadgeEl.className = "badge bg-primary px-3 py-2";
            else if (user.role === "Nodal") userRoleBadgeEl.className = "badge bg-success px-3 py-2";
            else userRoleBadgeEl.className = "badge bg-warning text-dark px-3 py-2";
        }

        // Show/Hide Role Panels
        const collectorPanel = document.getElementById("collector-panel");
        const nodalPanel = document.getElementById("nodal-panel");
        const sponsorPanel = document.getElementById("sponsor-panel");

        if (collectorPanel) collectorPanel.style.display = user.role === "Collector" ? "block" : "none";
        if (nodalPanel) nodalPanel.style.display = user.role === "Nodal" ? "block" : "none";
        if (sponsorPanel) sponsorPanel.style.display = user.role === "Sponsor" ? "block" : "none";

        // Initialize Charts if Collector Role
        if (user.role === "Collector" && typeof Chart !== "undefined") {
            initCollectorCharts();
        }

        // Bind Static Events
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", logoutUser);
        }

        const createSponsorForm = document.getElementById("create-sponsor-form");
        if (createSponsorForm) {
            createSponsorForm.addEventListener("submit", createSponsorAccount);
        }

        const proposalTableBody = document.getElementById("proposal-table-body");
        if (proposalTableBody) {
            proposalTableBody.addEventListener("click", function(e) {
                const approveBtn = e.target.closest(".approve-btn");
                if (approveBtn) {
                    const id = approveBtn.getAttribute("data-id");
                    approveProposal(id);
                }
            });
        }

        // Render Data Tables
        renderProposalTable();
        renderSponsorUserList();
    });

    function initCollectorCharts() {
        // Sector Allocation Pie Chart
        const pieCtx = document.getElementById("chart-sector-pie");
        if (pieCtx) {
            new Chart(pieCtx, {
                type: "doughnut",
                data: {
                    labels: ["Education & Skills", "Roads & Connectivity", "Healthcare", "Drains & Water", "Solar & Green Energy"],
                    datasets: [{
                        data: [35, 25, 20, 12, 8],
                        backgroundColor: ["#06A3DA", "#34AD54", "#E11D48", "#0284C7", "#EAB308"]
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        // Monthly Funds Bar Chart
        const barCtx = document.getElementById("chart-monthly-bar");
        if (barCtx) {
            new Chart(barCtx, {
                type: "bar",
                data: {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
                    datasets: [{
                        label: "CSR Funds Outlay (₹ in Lakhs)",
                        data: [85, 120, 190, 240, 310, 420, 580],
                        backgroundColor: "#06A3DA",
                        borderRadius: 6
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    function renderProposalTable() {
        const tableBody = document.getElementById("proposal-table-body");
        if (!tableBody || typeof kvStorage === "undefined") return;

        const proposals = kvStorage.getProposals();
        tableBody.innerHTML = proposals.map(p => `
            <tr>
                <td><strong class="text-dark">${p.company}</strong><br><small class="text-muted">${p.person}</small></td>
                <td><span class="badge bg-primary">${p.sector}</span></td>
                <td><small class="fw-bold">${p.location}</small></td>
                <td class="fw-bold text-success">${p.outlay}</td>
                <td><small class="text-muted">${p.date}</small></td>
                <td>
                    <span class="badge ${p.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'}">${p.status}</span>
                </td>
                <td>
                    ${p.status === 'Approved' ? `
                        <button class="btn btn-xs btn-outline-secondary disabled py-0 px-2" style="font-size: 11px;">Approved</button>
                    ` : `
                        <button class="btn btn-xs btn-success py-1 px-2 fw-bold approve-btn" style="font-size: 11px;" data-id="${p.id}">
                            <i class="bi bi-check-lg me-1"></i> Approve
                        </button>
                    `}
                </td>
            </tr>
        `).join('');
    }

    function approveProposal(id) {
        if (typeof kvStorage !== "undefined") {
            kvStorage.updateProposalStatus(id, "Approved");
            renderProposalTable();
            alert("Proposal pre-approval recorded. Single window clearance status updated.");
        }
    }

    function createSponsorAccount(e) {
        e.preventDefault();
        const company = document.getElementById("new-sponsor-company").value;
        const email = document.getElementById("new-sponsor-email").value;
        const mandal = document.getElementById("new-sponsor-mandal").value;

        const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_");
        const newSponsor = {
            id: "sp-" + Date.now().toString().slice(-4),
            username: username,
            company: company,
            email: email,
            role: "Sponsor",
            mandal: mandal,
            fundedProjects: ["Assigned by Nodal Officer"],
            totalContribution: "₹50,00,000",
            status: "Active"
        };

        if (typeof kvStorage !== "undefined") {
            kvStorage.addSponsor(newSponsor);
            renderSponsorUserList();
            alert(`Sponsor Account Successfully Created!\n\nCompany: ${company}\nUser Login ID: ${email}\nRole: Corporate Sponsor Portal Access`);
            document.getElementById("create-sponsor-form").reset();
        }
    }

    function renderSponsorUserList() {
        const container = document.getElementById("sponsor-list-body");
        if (!container || typeof kvStorage === "undefined") return;

        const list = kvStorage.getSponsors();
        container.innerHTML = list.map(s => `
            <tr>
                <td><strong class="text-dark">${s.company}</strong></td>
                <td><small class="text-primary fw-semibold">${s.email}</small></td>
                <td><span class="badge bg-light text-dark border">${s.mandal}</span></td>
                <td class="fw-bold text-success">${s.totalContribution}</td>
                <td><span class="badge bg-success">${s.status}</span></td>
            </tr>
        `).join('');
    }

    function logoutUser() {
        localStorage.removeItem("csr_current_user");
        window.location.href = "login.html";
    }
})();
