document.addEventListener('DOMContentLoaded', function() {
    let touchStartX = 0;
    let touchEndX = 0;
    const navigation = document.querySelector('.navigation');

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    });

    function handleSwipeGesture() {
        const swipeThreshold = 50;
        const swipeLength = touchEndX - touchStartX;

        if (Math.abs(swipeLength) > swipeThreshold) {
            if (swipeLength > 0) {
                // Swipe right - open menu
                navigation.classList.add('active');
            } else {
                // Swipe left - close menu
                navigation.classList.remove('active');
            }
        }
    }
});