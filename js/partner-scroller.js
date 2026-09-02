(function () {
    "use strict";

    var loopTween = null;

    function placeThumb(progress) {
        var thumb = document.getElementById("partner-scroll-thumb");
        var rail = thumb && thumb.parentElement;
        if (!thumb || !rail || !window.gsap) return;
        var span = Math.max(0, rail.offsetWidth - thumb.offsetWidth);
        window.gsap.set(thumb, { x: span * progress });
    }

    function bindCardMotion(cards) {
        var gsap = window.gsap;
        if (!gsap) return;
        for (var i = 0; i < cards.length; i++) {
            (function (el) {
                el.addEventListener("mouseenter", function () {
                    gsap.to(el, { y: -6, duration: 0.28, ease: "power2.out", overwrite: "auto" });
                });
                el.addEventListener("mouseleave", function () {
                    gsap.to(el, { y: 0, duration: 0.32, ease: "power2.out", overwrite: "auto" });
                });
            })(cards[i]);
        }
    }

    function startGsapLoop(track) {
        var gsap = window.gsap;
        if (!gsap) return false;

        track.classList.add("is-gsap");
        gsap.set(track, { x: 0, xPercent: 0 });
        loopTween = gsap.to(track, {
            xPercent: -50,
            duration: 36,
            ease: "none",
            repeat: -1,
            onUpdate: function () {
                placeThumb(this.progress());
            }
        });

        var wrap = track.closest(".partner-scroller-container");
        if (wrap) {
            wrap.addEventListener("mouseenter", function () {
                if (loopTween) loopTween.pause();
            });
            wrap.addEventListener("mouseleave", function () {
                if (loopTween) loopTween.resume();
            });
        }
        return true;
    }

    function revealThenLoop(track, originals) {
        var gsap = window.gsap;
        var ScrollTrigger = window.ScrollTrigger;
        if (!gsap) {
            startGsapLoop(track);
            return;
        }

        gsap.set(originals, { y: 28, autoAlpha: 0 });
        placeThumb(0);

        function playIn() {
            gsap.to(originals, {
                y: 0,
                autoAlpha: 1,
                duration: 0.45,
                stagger: 0.12,
                ease: "power2.out",
                onComplete: function () {
                    for (var i = 0; i < originals.length; i++) {
                        var clone = originals[i].cloneNode(true);
                        clone.classList.add("partner-card-item--clone");
                        clone.setAttribute("aria-hidden", "true");
                        var img = clone.querySelector("img");
                        if (img) img.setAttribute("alt", "");
                        track.appendChild(clone);
                    }
                    startGsapLoop(track);
                }
            });
        }

        if (ScrollTrigger) {
            ScrollTrigger.create({
                trigger: track.closest("#partners") || track,
                start: "top 82%",
                once: true,
                onEnter: playIn
            });
        } else {
            playIn();
        }
    }

    function initPartnerScroller() {
        var track = document.getElementById("partner-scroller-track");
        if (!track) return;

        var reduce =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var originals = track.querySelectorAll(".partner-card-item:not(.partner-card-item--clone)");

        if (reduce) {
            track.classList.add("is-static");
            placeThumb(0.66);
            bindCardMotion(originals);
            return;
        }

        bindCardMotion(originals);
        revealThenLoop(track, originals);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPartnerScroller);
    } else {
        initPartnerScroller();
    }
})();
