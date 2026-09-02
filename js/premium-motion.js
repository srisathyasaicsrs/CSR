(function () {
    "use strict";

    function hardenExternalLinks() {
        var links = document.querySelectorAll('a[target="_blank"]');
        for (var i = 0; i < links.length; i++) {
            var rel = links[i].getAttribute("rel") || "";
            if (rel.indexOf("noopener") === -1) {
                links[i].setAttribute("rel", (rel + " noopener noreferrer").trim());
            }
        }
    }

    if (!window.gsap) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", hardenExternalLinks);
        } else {
            hardenExternalLinks();
        }
        return;
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var magnetBound = typeof WeakSet !== "undefined" ? new WeakSet() : null;
    var glowBound = typeof WeakSet !== "undefined" ? new WeakSet() : null;
    var tiltBound = typeof WeakSet !== "undefined" ? new WeakSet() : null;
    var cursorReady = false;
    var staged = false;

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

    function bindTilt(el) {
        if (reduce || !el || (tiltBound && tiltBound.has(el))) return;
        if (tiltBound) tiltBound.add(el);
        el.classList.add("ui21-tilt");
        var rxTo = gsap.quickTo(el, "rotateX", { duration: 0.4, ease: "power2.out" });
        var ryTo = gsap.quickTo(el, "rotateY", { duration: 0.4, ease: "power2.out" });

        el.addEventListener("mousemove", function (e) {
            var box = el.getBoundingClientRect();
            var cx = box.left + box.width / 2;
            var cy = box.top + box.height / 2;
            var dx = (e.clientX - cx) / (box.width / 2);
            var dy = (e.clientY - cy) / (box.height / 2);
            rxTo(-dy * 5);
            ryTo(dx * 5);
        });

        el.addEventListener("mouseleave", function () {
            rxTo(0);
            ryTo(0);
        });
    }

    function bindMagnetic(el) {
        if (reduce || !el || (magnetBound && magnetBound.has(el))) return;
        if (magnetBound) magnetBound.add(el);
        el.classList.add("ui21-magnetic");
        var xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
        var yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
        el.addEventListener("mousemove", function (e) {
            var box = el.getBoundingClientRect();
            xTo((e.clientX - (box.left + box.width / 2)) / 12);
            yTo((e.clientY - (box.top + box.height / 2)) / 12);
        });
        el.addEventListener("mouseleave", function () {
            xTo(0);
            yTo(0);
        });
    }

    function setupCursor() {
        var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (reduce || !fine || cursorReady) return;
        cursorReady = true;
        var ring = document.createElement("div");
        var dot = document.createElement("div");
        ring.className = "ui21-cursor";
        dot.className = "ui21-cursor-dot";
        ring.setAttribute("aria-hidden", "true");
        dot.setAttribute("aria-hidden", "true");
        document.body.appendChild(ring);
        document.body.appendChild(dot);
        document.body.classList.add("ui21-has-cursor");
        gsap.set([ring, dot], { xPercent: -50, yPercent: -50 });
        var xTo = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
        var yTo = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
        var dxTo = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
        var dyTo = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });

        window.addEventListener(
            "mousemove",
            function (e) {
                xTo(e.clientX);
                yTo(e.clientY);
                dxTo(e.clientX);
                dyTo(e.clientY);
            },
            { passive: true }
        );

        document.addEventListener("mouseover", function (e) {
            var grab = e.target.closest("a, button, .btn, .project-card, .partner-card-item, .collab-card");
            ring.classList.toggle("is-grab", !!grab);
        });
    }

    function setupHeroRail() {
        var thumb = document.getElementById("hero-scroll-thumb");
        var rail = thumb && thumb.parentElement;
        if (!thumb || !rail || !ScrollTrigger) return;

        gsap.set(thumb, { x: 0 });
        ScrollTrigger.create({
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.35,
            onUpdate: function (self) {
                var span = Math.max(0, rail.offsetWidth - thumb.offsetWidth);
                gsap.set(thumb, { x: span * self.progress });
            }
        });
    }

    function choreograph() {
        var mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", function () {
            var heroBits = document.querySelectorAll(
                ".hero-banner .badge, .hero-banner h1, .hero-banner .fs-5, .hero-banner .btn-portal"
            );
            if (heroBits.length) {
                gsap.from(heroBits, {
                    y: 28,
                    autoAlpha: 0,
                    duration: 0.55,
                    stagger: 0.09,
                    ease: "power2.out"
                });
            }

            var batchTargets = document.querySelectorAll(
                ".project-card, .collab-card, .partner-card, .district-mandate-box, .auth-card, .sitemap-group"
            );
            if (ScrollTrigger && batchTargets.length) {
                gsap.set(batchTargets, { y: 32, autoAlpha: 0 });
                ScrollTrigger.batch(batchTargets, {
                    start: "top 88%",
                    once: true,
                    onEnter: function (elements) {
                        gsap.to(elements, {
                            y: 0,
                            autoAlpha: 1,
                            duration: 0.42,
                            stagger: 0.08,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    }
                });
            }

            var magnets = document.querySelectorAll(
                ".btn-portal, .btn-read-profile, .btn-shine, .header-partner-btn, #topbar-login-btn, .btn-primary.rounded-pill"
            );
            for (var i = 0; i < magnets.length; i++) bindMagnetic(magnets[i]);

            var glows = document.querySelectorAll(
                ".project-card, .partner-card-item, .partner-card, .collab-card, .fund-stat-card, .auth-card, .district-mandate-box, .sitemap-group"
            );
            for (var g = 0; g < glows.length; g++) {
                bindGlow(glows[g]);
                bindTilt(glows[g]);
            }

            setupCursor();
            setupHeroRail();

            return function () {
                if (ScrollTrigger) ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
            };
        });
    }

    function boot() {
        hardenExternalLinks();
        if (!staged) {
            staged = true;
            choreograph();
        }
        if (ScrollTrigger) ScrollTrigger.refresh();
    }

    window.ui21Enhance = boot;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    document.addEventListener("header:loaded", function () {
        if (ScrollTrigger) ScrollTrigger.refresh();
        setupCursor();
        var magnets = document.querySelectorAll(".header-partner-btn, #topbar-login-btn");
        for (var i = 0; i < magnets.length; i++) bindMagnetic(magnets[i]);
    });
})();
