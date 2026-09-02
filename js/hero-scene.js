(function () {
    "use strict";

    var canvas = document.getElementById("hero-canvas");
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;

    function initThreeJS() {
        if (!window.THREE) return false;
        try {
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

            var count = 350;
            var positions = new Float32Array(count * 3);
            var i;
            for (i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 38;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
            }

            var geometry = new THREE.BufferGeometry();
            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            var material = new THREE.PointsMaterial({
                color: 0x06a3da,
                size: 0.11,
                transparent: true,
                opacity: 0.75,
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
                points.rotation.y += 0.0008;
                points.rotation.x += 0.0002;
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
            return true;
        } catch (e) {
            return false;
        }
    }

    function init2DFallback() {
        var ctx = canvas.getContext("2d");
        if (!ctx) return;

        var width = (canvas.width = canvas.parentElement.clientWidth || 800);
        var height = (canvas.height = canvas.parentElement.clientHeight || 400);

        var particles = [];
        var numParticles = 45;

        for (var i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        function resize2D() {
            width = canvas.width = canvas.parentElement.clientWidth || 800;
            height = canvas.height = canvas.parentElement.clientHeight || 400;
        }

        window.addEventListener("resize", resize2D);

        function draw2D() {
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = "rgba(6, 163, 218, 0.6)";
            ctx.strokeStyle = "rgba(6, 163, 218, 0.12)";

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                for (var j = i + 1; j < particles.length; j++) {
                    var p2 = particles[j];
                    var dx = p.x - p2.x;
                    var dy = p.y - p2.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(draw2D);
        }

        draw2D();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            if (!initThreeJS()) init2DFallback();
        });
    } else {
        if (!initThreeJS()) init2DFallback();
    }
})();
