(function($) {
    "use strict";

    // Menu Toggle
    $('.mobile-menu-trigger').on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass('active');
        $('#nav-menu').toggleClass('active');
    });

    // Close menu on window resize
    $(window).on('resize', function() {
        if ($(window).width() > 991) {
            $('.mobile-menu-trigger').removeClass('active');
            $('#nav-menu').removeClass('active');
        }
    });

    // Close menu when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.main-nav').length) {
            $('.mobile-menu-trigger').removeClass('active');
            $('#nav-menu').removeClass('active');
        }
    });

    // ...existing code...
})(jQuery);