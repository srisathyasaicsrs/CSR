/**
 * pdf-generator.js - Client-Side Official PDF Proposal Brief Generator
 * Sri Sathya Sai District CSR Portal
 */

(function () {
    "use strict";

    window.downloadProjectPDF = function (projectData) {
        const title = projectData.title || "CSR Priority Project Brief";
        const mandal = projectData.mandal || "Sri Sathya Sai District";
        const sector = projectData.sector || "Infrastructure";
        const budget = projectData.budget || "As per EoI";
        const description = projectData.description || "Detailed project proposal under District CSR Facilitation Cell.";
        const logoUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, '') + "img/csr_logo.png";

        const printWindow = window.open("", "_blank", "width=850,height=1100");
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title} - Official CSR Proposal Brief</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #0f172a; background: #ffffff; }
                    .header-box { border-bottom: 3px solid #06A3DA; padding-bottom: 20px; margin-bottom: 30px; }
                    .seal-badge { border: 2px dashed #06A3DA; border-radius: 12px; padding: 15px; background: #f8fafc; }
                    .watermark { position: fixed; top: 40%; left: 20%; font-size: 60px; color: rgba(6,163,218,0.04); transform: rotate(-30deg); z-index: -1; font-weight: 800; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="watermark">SRI SATHYA SAI DISTRICT CSR CELL</div>
                
                <div class="no-print mb-4 text-end">
                    <button class="btn btn-primary btn-lg rounded-pill px-4" onclick="window.print();"><i class="bi bi-printer"></i> Print / Save as PDF</button>
                </div>

                <div class="header-box d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="fw-bold text-primary mb-1">GOVERNMENT OF ANDHRA PRADESH</h4>
                        <h5 class="fw-semibold text-dark mb-0">District Collectorate & Magistrate, Sri Sathya Sai District</h5>
                        <small class="text-muted">Corporate Social Responsibility (CSR) Facilitation Cell • www.srisathyasaicsr.com</small>
                    </div>
                    <img src="${logoUrl}" style="height: 70px; object-fit: contain;" alt="CSR Logo" onerror="this.style.display='none'">
                </div>

                <div class="badge bg-primary px-3 py-2 fs-6 mb-3">OFFICIAL CSR PROJECT PROPOSAL BRIEF</div>
                <h2 class="fw-bold text-dark mb-3">${title}</h2>

                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <div class="p-3 bg-light rounded-3 border">
                            <small class="text-uppercase text-muted fw-bold d-block">District / Division / Mandal</small>
                            <span class="fs-5 fw-bold text-dark">${mandal}, Sri Sathya Sai District</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-3 bg-light rounded-3 border">
                            <small class="text-uppercase text-muted fw-bold d-block">Priority Sector</small>
                            <span class="fs-5 fw-bold text-primary">${sector}</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-3 bg-light rounded-3 border">
                            <small class="text-uppercase text-muted fw-bold d-block">Estimated CSR Outlay</small>
                            <span class="fs-4 fw-bold text-success">${budget}</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-3 bg-light rounded-3 border">
                            <small class="text-uppercase text-muted fw-bold d-block">Clearance Status</small>
                            <span class="badge bg-success fs-6">Single-Window Pre-Approved</span>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <h5 class="fw-bold text-dark border-bottom pb-2">Project Scope & Objectives</h5>
                    <p class="fs-6 lead text-secondary">${description}</p>
                </div>

                <div class="mb-5">
                    <h5 class="fw-bold text-dark border-bottom pb-2">Statutory & Facilitation Benefits</h5>
                    <ul>
                        <li><strong>80G & Section 35AC Tax Benefits:</strong> Eligible for statutory tax exemptions under IT Act provisions.</li>
                        <li><strong>Geo-Tagged Milestone Audits:</strong> Quarterly transparent progress reports submitted directly to partner CSR committees.</li>
                        <li><strong>Single Window Clearance:</strong> Expedited land allocation and local Panchayati Raj NOCs handled directly by District CSR Cell.</li>
                    </ul>
                </div>

                <div class="row mt-5 pt-4 align-items-center">
                    <div class="col-7">
                        <div class="seal-badge">
                            <h6 class="fw-bold text-dark mb-1">Sri Sathya Sai District CSR Facilitation Cell</h6>
                            <small class="text-muted d-block">Collectorate Building, Puttaparthi - 515134</small>
                            <small class="text-muted d-block">Email: collector-sssai@ap.gov.in | jc-sssai@ap.gov.in</small>
                        </div>
                    </div>
                    <div class="col-5 text-center">
                        <div class="border-top pt-2 mt-4">
                            <small class="fw-bold d-block text-dark">District Collector & Magistrate</small>
                            <small class="text-muted">Sri Sathya Sai District, Govt of AP</small>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };
})();
