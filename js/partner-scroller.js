(function () {
    "use strict";

    function bindCardMotion(cards) {
        if (!cards || !cards.length) return;
        var gsap = window.gsap;
        for (var i = 0; i < cards.length; i++) {
            (function (el) {
                el.addEventListener("mouseenter", function () {
                    if (gsap) {
                        gsap.to(el, { y: -6, scale: 1.02, duration: 0.25, ease: "power2.out", overwrite: "auto" });
                    } else {
                        el.style.transform = "translateY(-6px) scale(1.02)";
                    }
                });
                el.addEventListener("mouseleave", function () {
                    if (gsap) {
                        gsap.to(el, { y: 0, scale: 1.0, duration: 0.28, ease: "power2.out", overwrite: "auto" });
                    } else {
                        el.style.transform = "translateY(0) scale(1.0)";
                    }
                });
            })(cards[i]);
        }
    }

    function init() {
        var track = document.getElementById("partner-scroller-track");
        if (!track) return;

        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
            track.classList.add("is-static");
            return;
        }

        var originals = track.querySelectorAll(".partner-card-item:not([aria-hidden='true'])");
        if (originals.length > 0 && !track.querySelector("[aria-hidden='true']")) {
            for (var i = 0; i < originals.length; i++) {
                var clone = originals[i].cloneNode(true);
                clone.setAttribute("aria-hidden", "true");
                track.appendChild(clone);
            }
        }

        var allCards = track.querySelectorAll(".partner-card-item");
        bindCardMotion(allCards);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
