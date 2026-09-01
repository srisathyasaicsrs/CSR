(function () {
    "use strict";

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var magnetBound = typeof WeakSet !== "undefined" ? new WeakSet() : null;
    var glowBound = typeof WeakSet !== "undefined" ? new WeakSet() : null;

    function markReveals() {
        var nodes = document.querySelectorAll(
            ".hero-banner .col-lg-8, .project-card, .partner-card, .service-item, .collab-card, .fund-stat-card, .auth-card, .sitemap-group, .district-mandate-box"
        );
        for (var i = 0; i < nodes.length; i++) {
            if (!nodes[i].classList.contains("reveal-up")) {
                nodes[i].classList.add("reveal-up");
            }
            nodes[i].style.setProperty("--reveal-delay", (i % 6) * 150 + "ms");
        }
    }

    function observe() {
        var all = document.querySelectorAll(".reveal-up");
        if (reduce || !("IntersectionObserver" in window)) {
            for (var i = 0; i < all.length; i++) all[i].classList.add("is-in");
            return;
        }
        var io = new IntersectionObserver(
            function (entries) {
                for (var k = 0; k < entries.length; k++) {
                    if (entries[k].isIntersecting) {
                        entries[k].target.classList.add("is-in");
                        io.unobserve(entries[k].target);
                    }
                }
            },
            { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
        );
        for (var n = 0; n < all.length; n++) io.observe(all[n]);
    }

    function hardenExternalLinks() {
        var links = document.querySelectorAll('a[target="_blank"]');
        for (var i = 0; i < links.length; i++) {
            var rel = links[i].getAttribute("rel") || "";
            if (rel.indexOf("noopener") === -1) {
                links[i].setAttribute("rel", (rel + " noopener noreferrer").trim());
            }
        }
    }

    function bindMagnetic(el) {
        if (reduce || !el || (magnetBound && magnetBound.has(el))) return;
        if (magnetBound) magnetBound.add(el);
        el.classList.add("ui21-magnetic");
        var strength = 14;

        function onMove(e) {
            var box = el.getBoundingClientRect();
            var x = e.clientX - (box.left + box.width / 2);
            var y = e.clientY - (box.top + box.height / 2);
            el.style.transform =
                "translate(" + (x / strength) + "px," + (y / strength) + "px)";
        }

        function onLeave() {
            el.style.transform = "";
        }

        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        el.addEventListener("blur", onLeave);
    }

    function bindGlow(el) {
        if (reduce || !el || (glowBound && glowBound.has(el))) return;
        if (glowBound) glowBound.add(el);
        el.classList.add("ui21-glow");
        el.addEventListener("mousemove", function (e) {
            var box = el.getBoundingClientRect();
            el.style.setProperty("--glow-x", e.clientX - box.left + "px");
            el.style.setProperty("--glow-y", e.clientY - box.top + "px");
        });
    }

    function enhanceInteractive() {
        var magnets = document.querySelectorAll(
            ".btn-portal, .btn-read-profile, .btn-shine, .header-partner-btn, #topbar-login-btn, .btn-primary.rounded-pill"
        );
        for (var i = 0; i < magnets.length; i++) bindMagnetic(magnets[i]);

        var glows = document.querySelectorAll(
            ".project-card, .partner-card-item, .partner-card, .collab-card, .fund-stat-card, .auth-card, .district-mandate-box"
        );
        for (var g = 0; g < glows.length; g++) bindGlow(glows[g]);
    }

    function boot() {
        markReveals();
        observe();
        hardenExternalLinks();
        enhanceInteractive();
    }

    window.ui21Enhance = boot;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    document.addEventListener("header:loaded", boot);
})();
