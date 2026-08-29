(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();

    // Global Header Logout Handler
    window.handleHeaderLogout = function () {
        sessionStorage.clear();
        localStorage.removeItem("csr_current_user");
        localStorage.removeItem("csr_auth_token");
        if (window.location.pathname.indexOf("dashboard.html") !== -1) {
            window.location.href = "index.html";
        } else {
            window.location.reload();
        }
    };

    // Update Header Auth State if user is logged in
    function updateHeaderAuthState() {
        var userStr = sessionStorage.getItem("csr_current_user") || localStorage.getItem("csr_current_user");
        if (!userStr) return;

        var user = null;
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            user = null;
        }

        if (!user || !user.role) return;

        // 1. Desktop Topbar Auth Container Update (Dashboard & Logout buttons only)
        var authContainer = document.getElementById("header-auth-container");
        if (authContainer) {
            authContainer.innerHTML = `
                <a href="dashboard.html" class="btn btn-sm btn-primary text-white py-1 px-3 rounded-pill fw-bold">
                    <i class="bi bi-speedometer2 me-1"></i> <span data-i18n="nav_dashboard">Dashboard</span>
                </a>
                <button onclick="handleHeaderLogout()" class="btn btn-sm btn-danger text-white py-1 px-3 rounded-pill fw-bold border-0" title="Log Out of Portal">
                    <i class="bi bi-box-arrow-right me-1"></i> <span data-i18n="nav_logout">Logout</span>
                </button>
            `;
        }

        // 2. Mobile Auth Container Update (Next to hamburger menu)
        var mobileAuthContainer = document.getElementById("mobile-auth-container");
        if (mobileAuthContainer) {
            mobileAuthContainer.innerHTML = `
                <a href="dashboard.html" class="btn btn-primary text-white btn-sm rounded-pill fw-bold px-2 py-1" style="font-size: 12px;">
                    <i class="bi bi-speedometer2 me-1"></i> Dash
                </a>
                <button onclick="handleHeaderLogout()" class="btn btn-danger text-white btn-sm rounded-pill fw-bold px-2 py-1" style="font-size: 12px;">
                    <i class="bi bi-box-arrow-right me-1"></i> Logout
                </button>
            `;
        }
    }

    // Load centralized header component into #site-header
    if ($('#site-header').length > 0) {
        $('#site-header').load('header.html', function () {
            // Highlight active navigation link
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            $('#main-nav-links a').each(function () {
                const href = $(this).attr('href');
                if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
                    $(this).addClass('active');
                } else if (href && href !== 'index.html' && href.indexOf('#') !== 0) {
                    $(this).removeClass('active');
                }
            });

            updateHeaderAuthState();

            if (window.i18nEngine && typeof window.i18nEngine.setLanguage === 'function') {
                window.i18nEngine.setLanguage(window.i18nEngine.getCurrentLang());
            }
        });
    }

    // Load centralized footer component into #site-footer
    if ($('#site-footer').length > 0) {
        $('#site-footer').load('footer.html', function () {
            if (window.i18nEngine && typeof window.i18nEngine.setLanguage === 'function') {
                window.i18nEngine.setLanguage(window.i18nEngine.getCurrentLang());
            }
        });
    }
    
    // Initiate WOW.js safely
    if (typeof WOW !== 'undefined') {
        new WOW().init();
    }

    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });

    // Facts counter safely
    if ($.fn.counterUp && $('[data-toggle="counter-up"]').length > 0) {
        $('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000
        });
    }

    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

    // Testimonials carousel safely
    if ($.fn.owlCarousel && $(".testimonial-carousel").length > 0) {
        $(".testimonial-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1500,
            dots: true,
            loop: true,
            center: true,
            responsive: {
                0:{
                    items:1
                },
                576:{
                    items:1
                }
            }
        });
    }

    // Vendor carousel safely
    if ($.fn.owlCarousel && $('.vendor-carousel').length > 0) {
        $('.vendor-carousel').owlCarousel({
            loop: true,
            margin: 45,
            dots: false,
            autoplay: true,
            smartSpeed: 1000,
            responsive: {
                0:{
                    items:2
                },
                576:{
                    items:4
                },
                768:{
                    items:6
                }
            }
        });
    }

})(jQuery);
