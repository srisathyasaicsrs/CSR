(function () {
    "use strict";

    var canvas = document.getElementById("hero-canvas");
    if (!canvas || !window.THREE) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    var THREE = window.THREE;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
    camera.position.z = 18;

    var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "low-power"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    var count = 420;
    var positions = new Float32Array(count * 3);
    var i;
    for (i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 36;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var material = new THREE.PointsMaterial({
        color: 0x06a3da,
        size: 0.09,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
    });
    var points = new THREE.Points(geometry, material);
    scene.add(points);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    var playing = true;
    var raf = 0;

    function resize() {
        var w = canvas.clientWidth || canvas.parentElement.clientWidth;
        var h = canvas.clientHeight || canvas.parentElement.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    }

    function tick() {
        if (!playing) return;
        points.rotation.y += 0.0009;
        points.rotation.x += 0.00025;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);

    if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
            function (entries) {
                playing = entries[0] && entries[0].isIntersecting;
                if (playing && !raf) tick();
                if (!playing && raf) {
                    cancelAnimationFrame(raf);
                    raf = 0;
                }
            },
            { threshold: 0.08 }
        );
        io.observe(canvas.parentElement || canvas);
    }

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            playing = false;
            cancelAnimationFrame(raf);
            raf = 0;
        } else {
            playing = true;
            tick();
        }
    });
})();
