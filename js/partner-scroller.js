(function () {
    "use strict";

    var loopTween = null;

    function placeThumb(progress) {
        var thumb = document.getElementById("partner-scroll-thumb");
        var rail = thumb && thumb.parentElement;
        if (!thumb || !rail) return;
        var span = Math.max(0, rail.offsetWidth - thumb.offsetWidth);
        if (window.gsap) {
            window.gsap.set(thumb, { x: span * progress });
        } else {
            thumb.style.transform = "translateX(" + (span * progress) + "px)";
        }
    }

    function bindCardMotion(cards) {
        if (!cards || !cards.length) return;
        var gsap = window.gsap;
        for (var i = 0; i < cards.length; i++) {
            (function (el) {
                el.addEventListener("mouseenter", function () {
                    if (gsap) {
                        gsap.to(el, { y: -6, scale: 1.02, duration: 0.28, ease: "power2.out", overwrite: "auto" });
                    } else {
                        el.style.transform = "translateY(-6px) scale(1.02)";
                    }
                });
                el.addEventListener("mouseleave", function () {
                    if (gsap) {
                        gsap.to(el, { y: 0, scale: 1.0, duration: 0.32, ease: "power2.out", overwrite: "auto" });
                    } else {
                        el.style.transform = "translateY(0) scale(1.0)";
                    }
                });
            })(cards[i]);
        }
    }

    function setupMarquee(track) {
        if (!track) return;
        var originals = Array.prototype.slice.call(
            track.querySelectorAll(".partner-card-item:not(.partner-card-item--clone)")
        );
        if (!originals.length) return;

        // Duplicate items twice to ensure full continuous loop width
        if (!track.querySelector(".partner-card-item--clone")) {
            for (var c = 0; c < 2; c++) {
                for (var i = 0; i < originals.length; i++) {
                    var clone = originals[i].cloneNode(true);
                    clone.classList.add("partner-card-item--clone");
                    clone.setAttribute("aria-hidden", "true");
                    track.appendChild(clone);
                }
            }
        }

        var allCards = track.querySelectorAll(".partner-card-item");
        bindCardMotion(allCards);

        var gsap = window.gsap;
        if (gsap) {
            track.classList.add("is-gsap");
            gsap.set(track, { x: 0 });
            var totalWidth = track.scrollWidth / 3; // 1 full cycle of original set

            loopTween = gsap.to(track, {
                x: -totalWidth,
                duration: 22,
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: gsap.utils.unitize(function (x) {
                        return parseFloat(x) % totalWidth;
                    })
                },
                onUpdate: function () {
                    var p = Math.abs(parseFloat(gsap.getProperty(track, "x")) / totalWidth) % 1;
                    placeThumb(p);
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
        } else {
            // CSS Fallback animation
            track.classList.add("is-css-animated");
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

        setupMarquee(track);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
