/**
 * i18n.js - Internationalization Engine (English / Telugu)
 * Sri Sathya Sai District CSR Portal
 */

(function () {
    "use strict";

    const translations = {
        en: {
            // Header & Navigation
            "portal_title": "Sri Sathya Sai District CSR Portal",
            "nav_home": "Home",
            "nav_about": "About District",
            "nav_projects": "Priority Projects",
            "nav_collaborators": "Collaborators",
            "nav_login": "Portal Login",
            "nav_dashboard": "Dashboard",
            "govt_ap": "Govt of Andhra Pradesh",

            // Hero Section
            "hero_badge": "Official District CSR Cell",
            "hero_title": "Connecting Corporate Social Responsibility with District Development",
            "hero_subtitle": "Facilitating single-window CSR approvals, transparent milestone tracking, and high-impact rural development across Sri Sathya Sai District.",
            "btn_explore_projects": "Explore Priority Projects",
            "btn_submit_eoi": "Submit CSR Proposal",

            // Stats
            "stat_projects": "Priority Projects",
            "stat_mandals": "District Mandals",
            "stat_sectors": "Key Focus Sectors",
            "stat_outlay": "Target Outlay",

            // Sectors
            "sector_title": "CSR Focus Sectors",
            "sector_subtitle": "Aligned with District Priorities & Sustainable Development Goals",
            "sec_roads": "Roads & Connectivity",
            "sec_drains": "Drains & Water Supply",
            "sec_education": "Smart Education",
            "sec_health": "Health & Tele-Medicine",
            "sec_solar": "Solar & Clean Energy",
            "sec_sanitation": "Sanitation & Hygeine",
            "sec_plantation": "Avenue Plantation",
            "sec_sports": "Sports Infrastructure",

            // Collector's Message
            "collector_name": "Sri A. Shyam Prasad, I.A.S",
            "collector_designation": "Collector & District Magistrate, Sri Sathya Sai District",
            "collector_quote": "\"Corporate partnerships are a transformative force capable of driving positive change across education, healthcare, environmental sustainability, skill development, and infrastructure. I extend an invitation to corporate leaders and foundations to join hands with the Sri Sathya Sai District Administration in building model, resilient communities.\"",

            // Partners & Scroller
            "partner_title": "Corporate Social Responsibility Partners",
            "partner_subtitle": "Featuring Major Industrial Contributors in Sri Sathya Sai District",
            "partner_kia": "KIA Motors India",
            "partner_kia_sub": "Penukonda Plant, SSS District",
            "partner_onboarding": "Onboarding Open",
            "partner_join_title": "Your Company Logo",
            "partner_join_sub": "Join as Founding CSR Partner",

            // Form
            "form_title": "Submit CSR Partnership Proposal",
            "form_company": "Company / Foundation Name",
            "form_person": "Contact Person Name",
            "form_email": "Official Email",
            "form_phone": "Phone Number",
            "form_sector": "Priority Sector",
            "form_outlay": "Proposed Outlay (INR)",
            "form_location": "Project Details / Location Preference",
            "btn_submit": "Submit Proposal to Collectorate",

            // Auth & Dashboard
            "login_title": "District CSR Portal Login",
            "login_subtitle": "Select your authorization role to access the workspace",
            "role_collector": "District Collector",
            "role_nodal": "CSR Nodal Officer",
            "role_sponsor": "Corporate Sponsor",

            // Dashboard Headers
            "dash_collector_title": "District Collectorate Executive Dashboard",
            "dash_nodal_title": "CSR Nodal Officer Workspace & User Management",
            "dash_sponsor_title": "Corporate Partner CSR Impact Dashboard",

            // Footer
            "footer_rights": "Content Owned & Maintained by Sri Sathya Sai District Administration • Govt of Andhra Pradesh"
        },
        te: {
            // Header & Navigation
            "portal_title": "శ్రీ సత్యసాయి జిల్లా సి.ఎస్.ఆర్ పోర్టల్",
            "nav_home": "ముఖ్యాంశాలు",
            "nav_about": "జిల్లా సమాచారం",
            "nav_projects": "ప్రాధాన్యతా ప్రాజెక్టులు",
            "nav_collaborators": "సహకార సంస్థలు",
            "nav_login": "పోర్టల్ లాగిన్",
            "nav_dashboard": "డ్యాష్‌బోర్డ్",
            "govt_ap": "ఆంధ్రప్రదేశ్ ప్రభుత్వం",

            // Hero Section
            "hero_badge": "అధికారిక జిల్లా సి.ఎస్.ఆర్ విభాగం",
            "hero_title": "కార్పొరేట్ సామాజిక బాధ్యతను జిల్లా అభివృద్ధితో అనుసంధానించడం",
            "hero_subtitle": "శ్రీ సత్యసాయి జిల్లా వ్యాప్తంగా సి.ఎస్.ఆర్ అనుమతులు, పారదర్శక పురోగతి పరిశీలన మరియు గ్రామీణాభివృద్ధి ప్రాజెక్టుల నిర్వహణ.",
            "btn_explore_projects": "ప్రాజెక్టులను చూడండి",
            "btn_submit_eoi": "సి.ఎస్.ఆర్ ప్రతిపాదన సమర్పించండి",

            // Stats
            "stat_projects": "ప్రాధాన్యతా ప్రాజెక్టులు",
            "stat_mandals": "జిల్లా మండలాలు",
            "stat_sectors": "ముఖ్య రంగములు",
            "stat_outlay": "లక్ష్య నిధులు",

            // Sectors
            "sector_title": "సి.ఎస్.ఆర్ ప్రాధాన్యతా రంగాలు",
            "sector_subtitle": "జిల్లా అవసరాలు మరియు సుస్థిరాభివృద్ధి లక్ష్యాలకు అనుగుణంగా",
            "sec_roads": "రోడ్లు & రవాణా సౌకర్యాలు",
            "sec_drains": "మురుగునీటి కాలువలు & తాగునీరు",
            "sec_education": "స్మార్ట్ విద్య & పాఠశాలలు",
            "sec_health": "వైద్యం & టెలి-మెడిసిన్",
            "sec_solar": "సౌర శక్తి & హరిత శక్తి",
            "sec_sanitation": "పరిశుభ్రత & పారిశుధ్యం",
            "sec_plantation": "మొక్కల పెంపకం",
            "sec_sports": "క్రీడా మౌలిక వసతులు",

            // Collector's Message
            "collector_name": "శ్రీ ఎ. శ్యామ్ ప్రసాద్, ఐ.ఎ.ఎస్",
            "collector_designation": "జిల్లా కలెక్టర్ & జిల్లా మేజిస్ట్రేట్, శ్రీ సత్యసాయి జిల్లా",
            "collector_quote": "\"మన జిల్లా సమగ్రాభివృద్ధికి కార్పొరేట్ సామాజిక బాధ్యత (CSR) అత్యంత కీలకమైనది. విద్య, వైద్యం, పర్యావరణ పరిరక్షణ, నైపుణ్యాభివృద్ధి మరియు మౌలిక వసతుల కల్పనలో కార్పొరేట్ సంస్థల భాగస్వామ్యం గొప్ప మార్పును తేగలదు. ఆదర్శవంతమైన సముదాయాల నిర్మాణంలో జిల్లా యాజమాన్యంతో చేతులు కలపాలని కార్పొరేట్ నాయకులకు ఆహ్వానం పలుకుతున్నాను.\"",

            // Partners & Scroller
            "partner_title": "కార్పొరేట్ భాగస్వామ్య సంస్థలు",
            "partner_subtitle": "శ్రీ సత్యసాయి జిల్లాలోని ప్రధాన పారిశ్రామిక భాగస్వాములు",
            "partner_kia": "కియా మోటార్స్ ఇండియా",
            "partner_kia_sub": "పెనుకొండ ప్లాంట్, శ్రీ సత్యసాయి జిల్లా",
            "partner_onboarding": "భాగస్వామ్య అవకాశం ఉంది",
            "partner_join_title": "మీ కంపెనీ లోగో",
            "partner_join_sub": "సి.ఎస్.ఆర్ భాగస్వామిగా చేరండి",

            // Form
            "form_title": "సి.ఎస్.ఆర్ ప్రతిపాదన సమర్పణ పత్రం",
            "form_company": "కంపెనీ / ఫౌండేషన్ పేరు",
            "form_person": "సంప్రదించాల్సిన వ్యక్తి పేరు",
            "form_email": "అధికారిక ఈమెయిల్",
            "form_phone": "ఫోన్ నంబరు",
            "form_sector": "ప్రాధాన్యతా రంగం",
            "form_outlay": "ప్రతిపాదిత నిధులు (రూపాయలలో)",
            "form_location": "ప్రాజెక్టు వివరాలు / ప్రాంత ప్రాధాన్యత",
            "btn_submit": "కలెక్టరేట్‌కు ప్రతిపాదన సమర్పించండి",

            // Auth & Dashboard
            "login_title": "జిల్లా సి.ఎస్.ఆర్ పోర్టల్ లాగిన్",
            "login_subtitle": "మీ హోదాకు తగిన లాగిన్‌ను ఎంచుకోండి",
            "role_collector": "జిల్లా కలెక్టర్ గారు",
            "role_nodal": "సి.ఎస్.ఆర్ నోడల్ అధికారి",
            "role_sponsor": "కార్పొరేట్ స్పాన్సర్",

            // Dashboard Headers
            "dash_collector_title": "జిల్లా కలెక్టరేట్ ఎగ్జిక్యూటివ్ డ్యాష్‌బోర్డ్",
            "dash_nodal_title": "నోడల్ ఆఫీసర్ నిర్వహణ వర్క్‌స్పేస్",
            "dash_sponsor_title": "కార్పొరేట్ భాగస్వామి సి.ఎస్.ఆర్ డ్యాష్‌బోర్డ్",

            // Footer
            "footer_rights": "సమాచారం శ్రీ సత్యసాయి జిల్లా యంత్రాంగం ఆధీనంలో ఉంది • ఆంధ్రప్రదేశ్ ప్రభుత్వం"
        }
    };

    let currentLang = localStorage.getItem("csr_lang") || "en";

    function setLanguage(lang) {
        if (!translations[lang]) return;
        currentLang = lang;
        localStorage.setItem("csr_lang", lang);

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[lang][key]) {
                if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
                    el.placeholder = translations[lang][key];
                } else {
                    el.innerText = translations[lang][key];
                }
            }
        });

        // Update active class on switcher buttons if present
        const btnEn = document.getElementById("lang-btn-en");
        const btnTe = document.getElementById("lang-btn-te");
        if (btnEn && btnTe) {
            if (lang === "te") {
                btnTe.classList.add("active", "btn-primary");
                btnTe.classList.remove("btn-outline-primary");
                btnEn.classList.remove("active", "btn-primary");
                btnEn.classList.add("btn-outline-primary");
            } else {
                btnEn.classList.add("active", "btn-primary");
                btnEn.classList.remove("btn-outline-primary");
                btnTe.classList.remove("active", "btn-primary");
                btnTe.classList.add("btn-outline-primary");
            }
        }
    }

    window.i18nEngine = {
        setLanguage: setLanguage,
        getCurrentLang: () => currentLang,
        t: (key) => translations[currentLang][key] || key
    };

    document.addEventListener("DOMContentLoaded", function () {
        setLanguage(currentLang);
    });
})();
