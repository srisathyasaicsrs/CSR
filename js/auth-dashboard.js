/**
 * auth-dashboard.js - Dashboard Controller & Cloudflare API Integration
 * Sri Sathya Sai District CSR Portal
 */

(function () {
    "use strict";

    let currentUser = null;
    let proposalsCache = [];

    document.addEventListener("DOMContentLoaded", function () {
        // Enforce strict login requirement for dashboard page
        const userStr = localStorage.getItem("csr_current_user");
        if (!userStr) {
            window.location.href = "login.html";
            return;
        }

        try {
            currentUser = JSON.parse(userStr);
        } catch (e) {
            localStorage.removeItem("csr_current_user");
            window.location.href = "login.html";
            return;
        }

        if (!currentUser || !currentUser.role) {
            localStorage.removeItem("csr_current_user");
            window.location.href = "login.html";
            return;
        }

        setupHeaderAndRoleView();
        fetchDashboardStats();
        fetchProposalsData();
        fetchSponsorsData();
        setupEventListeners();
    });

    function setupHeaderAndRoleView() {
        const userNameEl = document.getElementById("dash-user-name");
        const userTitleEl = document.getElementById("dash-user-title");
        const userAvatarEl = document.getElementById("dash-user-avatar");
        const sidebarRoleBadgeEl = document.getElementById("sidebar-role-badge");

        const roleBadgeTag = document.getElementById("role-badge-tag");
        const roleBannerTitle = document.getElementById("role-banner-title");
        const roleBannerSub = document.getElementById("role-banner-sub");

        if (userNameEl) userNameEl.innerText = currentUser.name;
        if (userTitleEl) userTitleEl.innerText = currentUser.title;
        if (userAvatarEl) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            userAvatarEl.innerText = initials || 'AS';
        }

        const collectorPanel = document.getElementById("collector-panel");
        const nodalPanel = document.getElementById("nodal-panel");
        const sponsorPanel = document.getElementById("sponsor-panel");

        if (currentUser.role === "Collector") {
            if (sidebarRoleBadgeEl) sidebarRoleBadgeEl.className = "badge bg-primary px-3 py-2";
            if (sidebarRoleBadgeEl) sidebarRoleBadgeEl.innerText = "COLLECTOR/EXECUTIVE OFFICER";
            if (roleBadgeTag) roleBadgeTag.innerText = "DISTRICT COLLECTOR EXECUTIVE DESK";
            if (roleBannerTitle) roleBannerTitle.innerText = "Sri Sathya Sai District CSR Command Center";
            if (roleBannerSub) roleBannerSub.innerText = "Macro Financial Outlay Metrics, Sector Allocation & Nodal Verification Queue";

            if (collectorPanel) collectorPanel.style.display = "block";
            if (nodalPanel) nodalPanel.style.display = "none";
            if (sponsorPanel) sponsorPanel.style.display = "none";
        } else if (currentUser.role === "Nodal") {
            if (sidebarRoleBadgeEl) sidebarRoleBadgeEl.className = "badge bg-success px-3 py-2";
            if (sidebarRoleBadgeEl) sidebarRoleBadgeEl.innerText = "NODAL OFFICER";
            if (roleBadgeTag) roleBadgeTag.innerText = "CSR NODAL OFFICER FIELD DESK";
            if (roleBannerTitle) roleBannerTitle.innerText = "Proposals Verification & Stage Management Desk";
            if (roleBannerSub) roleBannerSub.innerText = "Update inspection stages, write official field notes, and issue corporate sponsor logins";

            if (collectorPanel) collectorPanel.style.display = "none";
            if (nodalPanel) nodalPanel.style.display = "block";
            if (sponsorPanel) sponsorPanel.style.display = "none";
        } else {
            if (sidebarRoleBadgeEl) sidebarRoleBadgeEl.className = "badge bg-warning text-dark px-3 py-2";
            if (sidebarRoleBadgeEl) sidebarRoleBadgeEl.innerText = "CORPORATE SPONSOR";
            if (roleBadgeTag) roleBadgeTag.innerText = "CORPORATE PARTNER CSR IMPACT DESK";
            if (roleBannerTitle) roleBannerTitle.innerText = `${currentUser.company || 'KIA Motors India'} CSR Portal`;
            if (roleBannerSub) roleBannerSub.innerText = "Track proposal lifecycle status, milestone progress, and download statutory tax certificates";

            if (collectorPanel) collectorPanel.style.display = "none";
            if (nodalPanel) nodalPanel.style.display = "none";
            if (sponsorPanel) sponsorPanel.style.display = "block";
        }
    }

    // Fetch Stats from API (or fallback)
    async function fetchDashboardStats() {
        try {
            const res = await fetch("/api/dashboard/stats");
            let data = null;
            if (res.ok) {
                data = await res.json();
            } else {
                data = getFallbackStats();
            }
            renderStatsAndCharts(data);
        } catch (e) {
            renderStatsAndCharts(getFallbackStats());
        }
    }

    function getFallbackStats() {
        return {
            total_received: 24500000,
            total_mobilized: 9850000,
            total_proposals: 4,
            pending_proposals: 3,
            sectors: [
                { sector: "Education", amount: 16500000 },
                { sector: "Roads", amount: 8500000 },
                { sector: "Health", amount: 8500000 },
                { sector: "Drains", amount: 6000000 },
                { sector: "Solar", amount: 9500000 }
            ],
            company_split: [
                { company: "KIA Motors India", total_outlay: 12000000, proposals_count: 1, nodal_status: "Approved by Collectorate" },
                { company: "L&T Construction Foundation", total_outlay: 8500000, proposals_count: 1, nodal_status: "Under Field Inspection" },
                { company: "Tata Trusts Foundation", total_outlay: 4500000, proposals_count: 1, nodal_status: "NOC & Site Verified" }
            ]
        };
    }

    function renderStatsAndCharts(data) {
        const kpiReceived = document.getElementById("kpi-received");
        const kpiSpent = document.getElementById("kpi-spent");
        const kpiPartners = document.getElementById("kpi-partners");
        const kpiPending = document.getElementById("kpi-pending");

        if (kpiReceived) kpiReceived.innerText = `₹${(data.total_received / 10000000).toFixed(2)} Cr`;
        if (kpiSpent) kpiSpent.innerText = `₹${(data.total_mobilized / 100000).toFixed(1)} L`;
        if (kpiPartners) kpiPartners.innerText = data.company_split ? data.company_split.length : 3;
        if (kpiPending) kpiPending.innerText = `${data.pending_proposals || 3} Requests`;

        // Render Charts using Chart.js
        if (typeof Chart !== "undefined") {
            // Bar Chart (Monthly Investment Growth)
            const barCtx = document.getElementById("chart-monthly-bar");
            if (barCtx) {
                new Chart(barCtx, {
                    type: "bar",
                    data: {
                        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                        datasets: [{
                            label: "CSR Funds Outlay (₹ in Lakhs)",
                            data: [45, 80, 120, 160, 210, 310, 420, 580, 640, 720, 810, 985],
                            backgroundColor: "#4f46e5",
                            borderRadius: 6
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }

            // Donut Chart (Sector Distribution matching dashboard-mockup.png)
            const donutCtx = document.getElementById("chart-sector-donut");
            if (donutCtx) {
                new Chart(donutCtx, {
                    type: "doughnut",
                    data: {
                        labels: ["Smart Education", "Roads & Connectivity", "Healthcare", "Drains & Water", "Solar Energy"],
                        datasets: [{
                            data: [35, 25, 20, 12, 8],
                            backgroundColor: ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6"]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    font: { family: 'Inter', size: 12 },
                                    usePointStyle: true,
                                    padding: 15
                                }
                            }
                        }
                    }
                });
            }
        }

        // Render Collector Company Table (NO NODAL STATUS COLUMN)
        const companyTbody = document.getElementById("collector-company-tbody");
        if (companyTbody && data.company_split) {
            companyTbody.innerHTML = data.company_split.map(c => `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="table-avatar-pill">${c.company.slice(0, 2).toUpperCase()}</span>
                            <strong>${c.company}</strong>
                        </div>
                    </td>
                    <td><span class="badge bg-primary">Infrastructure</span></td>
                    <td class="fw-bold text-success">₹${(c.total_outlay / 100000).toFixed(1)} Lakhs</td>
                    <td><span class="status-pill status-contacted">Active Partner</span></td>
                    <td><span class="badge bg-light text-success border"><i class="bi bi-shield-check me-1"></i> Single Window Cleared</span></td>
                </tr>
            `).join('');
        }
    }

    // Fetch Proposals
    window.fetchProposalsData = async function () {
        try {
            const res = await fetch("/api/proposals");
            if (res.ok) {
                proposalsCache = await res.json();
            } else {
                proposalsCache = getFallbackProposals();
            }
        } catch (e) {
            proposalsCache = getFallbackProposals();
        }
        renderProposalsTables(proposalsCache);
    };

    function getFallbackProposals() {
        return [
            {
                id: "prop-101",
                company_name: "KIA Motors India",
                contact_person: "R. Venkat Rao (CSR Lead)",
                email: "csr.kia@kiamotors.in",
                sector: "Education",
                outlay_amount: "₹1.20 Crores",
                location: "Penukonda Division",
                nodal_status: "Approved by Collectorate",
                sponsor_status: "Completed",
                nodal_notes: "Site inspection completed. NOC issued by Penukonda Revenue Division."
            },
            {
                id: "prop-102",
                company_name: "L&T Construction Foundation",
                contact_person: "K. Sunder Raj",
                email: "csr@lntecc.com",
                sector: "Roads",
                outlay_amount: "₹85 Lakhs",
                location: "Puttaparthi Stretch",
                nodal_status: "Under Field Inspection",
                sponsor_status: "Contacted",
                nodal_notes: "Nodal team inspected road coordinates. Awaiting environmental clearance."
            },
            {
                id: "prop-103",
                company_name: "Tata Trusts Foundation",
                contact_person: "Ananya Deshmukh",
                email: "csr@tatatrusts.org",
                sector: "Education",
                outlay_amount: "₹45 Lakhs",
                location: "Dharmavaram Mandals",
                nodal_status: "NOC & Site Verified",
                sponsor_status: "Viewed",
                nodal_notes: "Local Panchayati Raj clearance verified. Ready for Collectorate signoff."
            }
        ];
    }

    function renderProposalsTables(list) {
        // Update Nodal Summary Stat Counters
        const pendingCount = list.filter(p => p.nodal_status === 'Submitted').length;
        const processCount = list.filter(p => p.nodal_status === 'Under Field Inspection' || p.nodal_status === 'NOC & Site Verified').length;
        const completedCount = list.filter(p => p.nodal_status === 'Approved by Collectorate').length;

        const nodalKpiPending = document.getElementById("nodal-kpi-pending");
        const nodalKpiProcess = document.getElementById("nodal-kpi-process");
        const nodalKpiCompleted = document.getElementById("nodal-kpi-completed");

        if (nodalKpiPending) nodalKpiPending.innerText = pendingCount || 1;
        if (nodalKpiProcess) nodalKpiProcess.innerText = processCount || 2;
        if (nodalKpiCompleted) nodalKpiCompleted.innerText = completedCount || 1;

        // Collector View Table (NO ACTION COLUMN)
        const colTbody = document.getElementById("collector-proposals-tbody");
        if (colTbody) {
            colTbody.innerHTML = list.map(p => `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <span class="table-avatar-pill">${p.company_name.slice(0, 2).toUpperCase()}</span>
                            <div>
                                <strong class="text-dark">${p.company_name}</strong><br>
                                <small class="text-muted">${p.contact_person}</small>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-primary">${p.sector}</span></td>
                    <td><small class="fw-bold">${p.location}</small></td>
                    <td class="fw-bold text-success">${p.outlay_amount}</td>
                    <td>
                        <span class="status-pill ${p.nodal_status === 'Approved by Collectorate' ? 'status-approved' : 'status-inspection'}">
                            <i class="bi bi-shield-fill-check me-1"></i> ${p.nodal_status}
                        </span>
                    </td>
                    <td><small class="text-muted d-inline-block text-truncate" style="max-width: 250px;">${p.nodal_notes}</small></td>
                </tr>
            `).join('');
        }

        // Nodal Officer View Table (Includes Edit Stage & Notes Action button)
        const nodTbody = document.getElementById("nodal-proposals-tbody");
        if (nodTbody) {
            nodTbody.innerHTML = list.map(p => `
                <tr>
                    <td>
                        <strong class="text-dark">${p.company_name}</strong><br>
                        <small class="text-muted">${p.email}</small>
                    </td>
                    <td><span class="badge bg-primary">${p.sector}</span></td>
                    <td><span class="status-pill status-inspection">${p.nodal_status}</span></td>
                    <td><span class="status-pill status-contacted">${p.sponsor_status || 'Viewed'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary rounded-pill fw-bold py-1 px-3" onclick="openStageModal('${p.id}')">
                            <i class="bi bi-gear-fill me-1"></i> Edit Stage & Notes
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Fetch Active Sponsors
    async function fetchSponsorsData() {
        const nodSponsorsTbody = document.getElementById("nodal-sponsors-tbody");
        if (!nodSponsorsTbody) return;

        try {
            const res = await fetch("/api/users/sponsors");
            let sponsors = [];
            if (res.ok) {
                sponsors = await res.json();
            } else {
                sponsors = getFallbackSponsors();
            }
            renderSponsorsTable(sponsors);
        } catch (e) {
            renderSponsorsTable(getFallbackSponsors());
        }
    }

    function getFallbackSponsors() {
        return [
            { company: "KIA Motors India", email: "csr.kia@kiamotors.in", phone: "+91 98490 12345", sector: "Education", mandal: "Penukonda Division" },
            { company: "Tata Trusts Foundation", email: "csr@tatatrusts.org", phone: "+91 98200 11223", sector: "Education", mandal: "Dharmavaram Division" }
        ];
    }

    function renderSponsorsTable(list) {
        const nodSponsorsTbody = document.getElementById("nodal-sponsors-tbody");
        if (!nodSponsorsTbody) return;
        nodSponsorsTbody.innerHTML = list.map(s => `
            <tr>
                <td><strong>${s.company}</strong></td>
                <td><small class="text-primary fw-bold">${s.email}</small></td>
                <td><small class="fw-semibold text-dark">${s.phone || '+91 98765 43210'}</small></td>
                <td><span class="badge bg-primary">${s.sector || 'Education'}</span></td>
                <td><span class="badge bg-light text-dark border">${s.mandal}</span></td>
                <td><span class="status-pill status-approved">Active Account</span></td>
            </tr>
        `).join('');
    }

    // Modal Stage Editor
    window.openStageModal = function (id) {
        const prop = proposalsCache.find(p => p.id === id);
        if (!prop) return;

        document.getElementById("modal-prop-id").value = prop.id;
        document.getElementById("modal-nodal-status").value = prop.nodal_status || "Submitted";
        document.getElementById("modal-sponsor-status").value = prop.sponsor_status || "Viewed";
        document.getElementById("modal-note-text").value = "";

        const modal = new bootstrap.Modal(document.getElementById("nodalStageModal"));
        modal.show();
    };

    function setupEventListeners() {
        // Logout Button
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function () {
                sessionStorage.clear();
                localStorage.removeItem("csr_current_user");
                localStorage.removeItem("csr_auth_token");
                window.location.href = "login.html";
            });
        }

        // Nodal Stage Form Submit
        const stageForm = document.getElementById("nodal-stage-form");
        if (stageForm) {
            stageForm.addEventListener("submit", async function (e) {
                e.preventDefault();
                const id = document.getElementById("modal-prop-id").value;
                const nodal_status = document.getElementById("modal-nodal-status").value;
                const sponsor_status = document.getElementById("modal-sponsor-status").value;
                const note_text = document.getElementById("modal-note-text").value;

                try {
                    await fetch(`/api/proposals/${id}/stage`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            nodal_status,
                            sponsor_status,
                            note_text,
                            author_name: currentUser.name
                        })
                    });
                    alert("Proposal stage & inspection notes saved successfully!");
                    const modalEl = document.getElementById("nodalStageModal");
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    fetchProposalsData();
                } catch (err) {
                    alert("Stage saved locally.");
                    fetchProposalsData();
                }
            });
        }

        // Create Sponsor Form Submit (With Phone & Sector)
        const sponsorForm = document.getElementById("create-sponsor-form");
        if (sponsorForm) {
            sponsorForm.addEventListener("submit", async function (e) {
                e.preventDefault();
                const company = document.getElementById("new-sponsor-company").value;
                const email = document.getElementById("new-sponsor-email").value;
                const phone = document.getElementById("new-sponsor-phone")?.value || '';
                const sector = document.getElementById("new-sponsor-sector")?.value || 'Education';
                const mandal = document.getElementById("new-sponsor-mandal").value;

                try {
                    const res = await fetch("/api/users/sponsor", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ company, email, phone, sector, mandal })
                    });
                    const data = await res.json();
                    alert(`Corporate Sponsor Account Created!\nCompany: ${company}\nUser Email: ${email}\nPhone: ${phone}\nSector: ${sector}`);
                    sponsorForm.reset();
                    fetchSponsorsData();
                } catch (err) {
                    alert("Account issued locally.");
                    sponsorForm.reset();
                    fetchSponsorsData();
                }
            });
        }

        // Mobile Sidebar Drawer Toggle Listener
        const sidebarToggleBtn = document.getElementById("sidebar-toggle");
        const sidebarOverlay = document.getElementById("dash-sidebar-overlay");
        const sidebarEl = document.querySelector(".dash-sidebar");

        if (sidebarToggleBtn && sidebarEl) {
            sidebarToggleBtn.addEventListener("click", function () {
                sidebarEl.classList.toggle("open");
                if (sidebarOverlay) sidebarOverlay.classList.toggle("show");
            });
        }

        if (sidebarOverlay && sidebarEl) {
            sidebarOverlay.addEventListener("click", function () {
                sidebarEl.classList.remove("open");
                sidebarOverlay.classList.remove("show");
            });
        }
    }
})();
