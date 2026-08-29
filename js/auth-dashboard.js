/**
 * Dashboard controller — Supabase session, RLS-backed data, no local fallbacks.
 */
(function () {
    "use strict";

    let currentUser = null;
    let proposalsCache = [];
    const esc = function (value) {
        return window.csrEscapeHtml(value);
    };

    document.addEventListener("DOMContentLoaded", async function () {
        try {
            currentUser = await window.csrSupabase.requireSession();
            if (!currentUser) return;
            hideAuthGate();
            setupHeaderAndRoleView();
            await Promise.all([fetchProposalsData(), fetchSponsorsData()]);
            renderStatsAndCharts();
            setupEventListeners();
        } catch (err) {
            window.location.replace("login.html");
        }
    });

    function hideAuthGate() {
        const gate = document.getElementById("dash-auth-gate");
        if (gate) gate.remove();
        document.body.classList.add("dash-ready");
    }

    function setupHeaderAndRoleView() {
        const userNameEl = document.getElementById("dash-user-name");
        const userTitleEl = document.getElementById("dash-user-title");
        const userAvatarEl = document.getElementById("dash-user-avatar");
        const sidebarRoleBadgeEl = document.getElementById("sidebar-role-badge");
        const roleBadgeTag = document.getElementById("role-badge-tag");
        const roleBannerTitle = document.getElementById("role-banner-title");
        const roleBannerSub = document.getElementById("role-banner-sub");

        if (userNameEl) userNameEl.textContent = currentUser.name;
        if (userTitleEl) userTitleEl.textContent = currentUser.title || currentUser.role;
        if (userAvatarEl) {
            const initials = currentUser.name.split(" ").map(function (n) { return n[0]; }).join("").slice(0, 2).toUpperCase();
            userAvatarEl.textContent = initials || "CSR";
        }

        const collectorPanel = document.getElementById("collector-panel");
        const nodalPanel = document.getElementById("nodal-panel");
        const sponsorPanel = document.getElementById("sponsor-panel");

        if (currentUser.role === "Collector") {
            if (sidebarRoleBadgeEl) {
                sidebarRoleBadgeEl.className = "badge bg-primary px-3 py-2";
                sidebarRoleBadgeEl.textContent = "COLLECTOR/EXECUTIVE OFFICER";
            }
            if (roleBadgeTag) roleBadgeTag.textContent = "DISTRICT COLLECTOR EXECUTIVE DESK";
            if (roleBannerTitle) roleBannerTitle.textContent = "Sri Sathya Sai District CSR Command Center";
            if (roleBannerSub) roleBannerSub.textContent = "Live proposal queue, sector allocation, and nodal verification status";
            if (collectorPanel) collectorPanel.style.display = "block";
            if (nodalPanel) nodalPanel.style.display = "none";
            if (sponsorPanel) sponsorPanel.style.display = "none";
        } else if (currentUser.role === "Nodal") {
            if (sidebarRoleBadgeEl) {
                sidebarRoleBadgeEl.className = "badge bg-success px-3 py-2";
                sidebarRoleBadgeEl.textContent = "NODAL OFFICER";
            }
            if (roleBadgeTag) roleBadgeTag.textContent = "CSR NODAL OFFICER FIELD DESK";
            if (roleBannerTitle) roleBannerTitle.textContent = "Proposals Verification & Stage Management Desk";
            if (roleBannerSub) roleBannerSub.textContent = "Update inspection stages and register corporate partners";
            if (collectorPanel) collectorPanel.style.display = "none";
            if (nodalPanel) nodalPanel.style.display = "block";
            if (sponsorPanel) sponsorPanel.style.display = "none";
        } else {
            if (sidebarRoleBadgeEl) {
                sidebarRoleBadgeEl.className = "badge bg-warning text-dark px-3 py-2";
                sidebarRoleBadgeEl.textContent = "CORPORATE SPONSOR";
            }
            if (roleBadgeTag) roleBadgeTag.textContent = "CORPORATE PARTNER CSR IMPACT DESK";
            if (roleBannerTitle) roleBannerTitle.textContent = (currentUser.company || "Corporate Partner") + " CSR Portal";
            if (roleBannerSub) roleBannerSub.textContent = "Track proposals linked to this account";
            if (collectorPanel) collectorPanel.style.display = "none";
            if (nodalPanel) nodalPanel.style.display = "none";
            if (sponsorPanel) sponsorPanel.style.display = "block";
            const sponsorHeading = document.getElementById("sponsor-company-heading");
            if (sponsorHeading) sponsorHeading.textContent = currentUser.company || currentUser.name;
        }
    }

    function parseOutlayLakhs(text) {
        const raw = String(text || "");
        if (/crore/i.test(raw)) return 100;
        if (/50 Lakhs - ₹1/.test(raw) || /50 Lakhs – ₹1/.test(raw)) return 75;
        if (/25 Lakhs - ₹50/.test(raw)) return 37.5;
        if (/10 Lakhs/.test(raw)) return 17.5;
        const num = parseFloat(raw.replace(/[^\d.]/g, ""));
        return Number.isFinite(num) ? num : 0;
    }

    function renderStatsAndCharts() {
        const byCompany = {};
        const bySector = {};
        proposalsCache.forEach(function (p) {
            const key = p.company_name || "Unknown";
            if (!byCompany[key]) byCompany[key] = { company: key, total_outlay: 0, proposals_count: 0, nodal_status: p.nodal_status };
            byCompany[key].total_outlay += parseOutlayLakhs(p.outlay_amount) * 100000;
            byCompany[key].proposals_count += 1;
            bySector[p.sector] = (bySector[p.sector] || 0) + 1;
        });
        const company_split = Object.keys(byCompany).map(function (k) { return byCompany[k]; });
        const pending = proposalsCache.filter(function (p) { return p.nodal_status === "Submitted"; }).length;

        const kpiReceived = document.getElementById("kpi-received");
        const kpiSpent = document.getElementById("kpi-spent");
        const kpiPartners = document.getElementById("kpi-partners");
        const kpiPending = document.getElementById("kpi-pending");
        const total = company_split.reduce(function (sum, c) { return sum + c.total_outlay; }, 0);

        if (kpiReceived) kpiReceived.textContent = "₹" + (total / 10000000).toFixed(2) + " Cr";
        if (kpiSpent) kpiSpent.textContent = proposalsCache.length + " EoIs";
        if (kpiPartners) kpiPartners.textContent = String(company_split.length);
        if (kpiPending) kpiPending.textContent = pending + " Requests";

        if (typeof Chart !== "undefined") {
            const barCtx = document.getElementById("chart-monthly-bar");
            if (barCtx && !barCtx.dataset.bound) {
                barCtx.dataset.bound = "1";
                new Chart(barCtx, {
                    type: "bar",
                    data: {
                        labels: company_split.length ? company_split.map(function (c) { return c.company; }) : ["No proposals yet"],
                        datasets: [{
                            label: "Indicative outlay (₹ Lakhs)",
                            data: company_split.length ? company_split.map(function (c) { return Math.round(c.total_outlay / 100000); }) : [0],
                            backgroundColor: "#0ea5a8",
                            borderRadius: 6
                        }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });
            }

            const donutCtx = document.getElementById("chart-sector-donut");
            if (donutCtx && !donutCtx.dataset.bound) {
                donutCtx.dataset.bound = "1";
                const labels = Object.keys(bySector);
                new Chart(donutCtx, {
                    type: "doughnut",
                    data: {
                        labels: labels.length ? labels : ["Awaiting proposals"],
                        datasets: [{
                            data: labels.length ? labels.map(function (l) { return bySector[l]; }) : [1],
                            backgroundColor: ["#004293", "#06A3DA", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "right" } }
                    }
                });
            }
        }

        const companyTbody = document.getElementById("collector-company-tbody");
        if (companyTbody) {
            if (!company_split.length) {
                companyTbody.innerHTML = '<tr><td colspan="5" class="text-muted">No corporate proposals yet.</td></tr>';
            } else {
                companyTbody.innerHTML = company_split.map(function (c) {
                    return "<tr>" +
                        "<td><div class=\"d-flex align-items-center\"><span class=\"table-avatar-pill\">" + esc(c.company.slice(0, 2).toUpperCase()) + "</span><strong>" + esc(c.company) + "</strong></div></td>" +
                        "<td><span class=\"badge bg-primary\">Partner</span></td>" +
                        "<td class=\"fw-bold text-success\">₹" + (c.total_outlay / 100000).toFixed(1) + " Lakhs*</td>" +
                        "<td><span class=\"status-pill status-contacted\">" + esc(c.proposals_count + " proposal(s)") + "</span></td>" +
                        "<td><span class=\"badge bg-light text-success border\">" + esc(c.nodal_status) + "</span></td></tr>";
                }).join("");
            }
        }
    }

    window.fetchProposalsData = async function () {
        proposalsCache = await window.csrApi.listProposals();
        renderProposalsTables(proposalsCache);
        renderSponsorQueue(proposalsCache);
    };

    function renderProposalsTables(list) {
        const pendingCount = list.filter(function (p) { return p.nodal_status === "Submitted"; }).length;
        const processCount = list.filter(function (p) {
            return p.nodal_status === "Under Field Inspection" || p.nodal_status === "NOC & Site Verified";
        }).length;
        const completedCount = list.filter(function (p) { return p.nodal_status === "Approved by Collectorate"; }).length;

        const nodalKpiPending = document.getElementById("nodal-kpi-pending");
        const nodalKpiProcess = document.getElementById("nodal-kpi-process");
        const nodalKpiCompleted = document.getElementById("nodal-kpi-completed");
        if (nodalKpiPending) nodalKpiPending.textContent = String(pendingCount);
        if (nodalKpiProcess) nodalKpiProcess.textContent = String(processCount);
        if (nodalKpiCompleted) nodalKpiCompleted.textContent = String(completedCount);

        const colTbody = document.getElementById("collector-proposals-tbody");
        if (colTbody) {
            colTbody.innerHTML = list.length ? list.map(function (p) {
                return "<tr><td><div class=\"d-flex align-items-center\"><span class=\"table-avatar-pill\">" +
                    esc(String(p.company_name || "").slice(0, 2).toUpperCase()) +
                    "</span><div><strong class=\"text-dark\">" + esc(p.company_name) +
                    "</strong><br><small class=\"text-muted\">" + esc(p.contact_person) +
                    "</small></div></div></td><td><span class=\"badge bg-primary\">" + esc(p.sector) +
                    "</span></td><td><small class=\"fw-bold\">" + esc(p.location) +
                    "</small></td><td class=\"fw-bold text-success\">" + esc(p.outlay_amount) +
                    "</td><td><span class=\"status-pill " + (p.nodal_status === "Approved by Collectorate" ? "status-approved" : "status-inspection") +
                    "\">" + esc(p.nodal_status) + "</span></td><td><small class=\"text-muted d-inline-block text-truncate\" style=\"max-width: 250px;\">" +
                    esc(p.nodal_notes || "—") + "</small></td></tr>";
            }).join("") : '<tr><td colspan="6" class="text-muted">No proposals in the queue.</td></tr>';
        }

        const nodTbody = document.getElementById("nodal-proposals-tbody");
        if (nodTbody) {
            nodTbody.innerHTML = list.length ? list.map(function (p) {
                return "<tr><td><strong class=\"text-dark\">" + esc(p.company_name) +
                    "</strong><br><small class=\"text-muted\">" + esc(p.email) +
                    "</small></td><td><span class=\"badge bg-primary\">" + esc(p.sector) +
                    "</span></td><td><span class=\"status-pill status-inspection\">" + esc(p.nodal_status) +
                    "</span></td><td><span class=\"status-pill status-contacted\">" + esc(p.sponsor_status || "Viewed") +
                    "</span></td><td><button class=\"btn btn-sm btn-primary rounded-pill fw-bold py-1 px-3\" data-prop-id=\"" +
                    esc(p.id) + "\" onclick=\"openStageModal('" + esc(p.id) + "')\"><i class=\"bi bi-gear-fill me-1\"></i> Edit Stage & Notes</button></td></tr>";
            }).join("") : '<tr><td colspan="5" class="text-muted">No proposals to verify.</td></tr>';
        }
    }

    function renderSponsorQueue(list) {
        const tbody = document.getElementById("sponsor-proposals-tbody");
        if (!tbody) return;
        tbody.innerHTML = list.length ? list.map(function (p) {
            return "<tr><td>" + esc(p.company_name) + "</td><td>" + esc(p.sector) + "</td><td>" +
                esc(p.outlay_amount) + "</td><td>" + esc(p.nodal_status) + "</td></tr>";
        }).join("") : '<tr><td colspan="4" class="text-muted">No proposals are linked to this sponsor login yet.</td></tr>';
    }

    async function fetchSponsorsData() {
        const nodSponsorsTbody = document.getElementById("nodal-sponsors-tbody");
        if (!nodSponsorsTbody) return;
        try {
            const sponsors = await window.csrApi.listSponsors();
            renderSponsorsTable(sponsors);
        } catch (err) {
            nodSponsorsTbody.innerHTML = '<tr><td colspan="6" class="text-danger">Unable to load sponsors.</td></tr>';
        }
    }

    function renderSponsorsTable(list) {
        const nodSponsorsTbody = document.getElementById("nodal-sponsors-tbody");
        if (!nodSponsorsTbody) return;
        nodSponsorsTbody.innerHTML = list.length ? list.map(function (s) {
            return "<tr><td><strong>" + esc(s.company) + "</strong></td><td><small class=\"text-primary fw-bold\">" +
                esc(s.email) + "</small></td><td><small class=\"fw-semibold text-dark\">" + esc(s.phone || "—") +
                "</small></td><td><span class=\"badge bg-primary\">" + esc(s.sector || "—") +
                "</span></td><td><span class=\"badge bg-light text-dark border\">" + esc(s.mandal || "—") +
                "</span></td><td><span class=\"status-pill status-approved\">" + esc(s.status || "Active") +
                "</span></td></tr>";
        }).join("") : '<tr><td colspan="6" class="text-muted">No sponsor records yet.</td></tr>';
    }

    window.openStageModal = function (id) {
        const prop = proposalsCache.find(function (p) { return String(p.id) === String(id); });
        if (!prop) return;
        document.getElementById("modal-prop-id").value = prop.id;
        document.getElementById("modal-nodal-status").value = prop.nodal_status || "Submitted";
        document.getElementById("modal-sponsor-status").value = prop.sponsor_status || "Viewed";
        document.getElementById("modal-note-text").value = prop.nodal_notes || "";
        const modal = new bootstrap.Modal(document.getElementById("nodalStageModal"));
        modal.show();
    };

    function setupEventListeners() {
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", async function () {
                await window.csrSupabase.signOut();
                window.location.href = "login.html";
            });
        }

        const search = document.getElementById("dash-global-search");
        if (search) {
            search.addEventListener("input", function () {
                const q = search.value.toLowerCase();
                const filtered = proposalsCache.filter(function (p) {
                    return [p.company_name, p.sector, p.email, p.location].join(" ").toLowerCase().indexOf(q) !== -1;
                });
                renderProposalsTables(filtered);
            });
        }

        const stageForm = document.getElementById("nodal-stage-form");
        if (stageForm) {
            stageForm.addEventListener("submit", async function (e) {
                e.preventDefault();
                const id = document.getElementById("modal-prop-id").value;
                try {
                    await window.csrApi.updateProposalStage(id, {
                        nodal_status: document.getElementById("modal-nodal-status").value,
                        sponsor_status: document.getElementById("modal-sponsor-status").value,
                        nodal_notes: document.getElementById("modal-note-text").value
                    });
                    const modalEl = document.getElementById("nodalStageModal");
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                    await fetchProposalsData();
                    renderStatsAndCharts();
                } catch (err) {
                    window.alert("Stage could not be saved. Nodal officers can update proposals; collector accounts are read-only.");
                }
            });
        }

        const sponsorForm = document.getElementById("create-sponsor-form");
        if (sponsorForm) {
            sponsorForm.addEventListener("submit", async function (e) {
                e.preventDefault();
                const company = document.getElementById("new-sponsor-company").value;
                const email = document.getElementById("new-sponsor-email").value;
                const phone = (document.getElementById("new-sponsor-phone") || {}).value || "";
                const sector = (document.getElementById("new-sponsor-sector") || {}).value || "Education";
                const mandal = document.getElementById("new-sponsor-mandal").value;
                try {
                    const created = await window.csrApi.createSponsor({ company: company, email: email, phone: phone, sector: sector, mandal: mandal });
                    sponsorForm.reset();
                    await fetchSponsorsData();
                    if (created && created.temporary_password) {
                        window.alert("Sponsor login created. Share this one-time password securely: " + created.temporary_password);
                    } else {
                        window.alert("Sponsor record saved and linked to the existing account for that email.");
                    }
                } catch (err) {
                    window.alert("Could not save the sponsor record.");
                }
            });
        }

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
