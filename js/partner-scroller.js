(function () {
    "use strict";

    function initPartnerScroller() {
        var track = document.getElementById("partner-scroller-track");
        if (!track) return;

        var reduce =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduce) {
            track.classList.add("is-static");
            return;
        }

        var items = track.querySelectorAll(".partner-card-item:not(.partner-card-item--clone)");
        for (var i = 0; i < items.length; i++) {
            var clone = items[i].cloneNode(true);
            clone.classList.add("partner-card-item--clone");
            clone.setAttribute("aria-hidden", "true");
            var img = clone.querySelector("img");
            if (img) img.setAttribute("alt", "");
            track.appendChild(clone);
        }
        if (typeof window.ui21Enhance === "function") window.ui21Enhance();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPartnerScroller);
    } else {
        initPartnerScroller();
    }
})();
