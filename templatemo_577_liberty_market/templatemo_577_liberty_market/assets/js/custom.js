(function ($) {
	
	"use strict";

    if (!$) {
        return;
    }

	// Page loading animation
	$(window).on('load', function() {

        $('#js-preloader').addClass('loaded');

    });


	$(window).scroll(function() {
	  var scroll = $(window).scrollTop();
	  var box = $('.header-text').height();
	  var header = $('header').height();

	  if (scroll >= box - header) {
	    $("header").addClass("background-header");
	  } else {
	    $("header").removeClass("background-header");
	  }
	});
	
	// Initialize Isotope if available
    var $grid;
    
    // Check if Isotope is loaded
    if (typeof $.fn.isotope !== 'undefined') {
        $grid = $(".grid").isotope({
            itemSelector: ".all",
            percentPosition: true,
            masonry: {
                columnWidth: ".all"
            }
        });
        
        $('.filters ul li').click(function(){
            $('.filters ul li').removeClass('active');
            $(this).addClass('active');
            
            var data = $(this).attr('data-filter');
            $grid.isotope({
                filter: data
            });
        });
    } else {
        console.log('Isotope library not loaded');
        
        // Still handle filter clicks even without Isotope
        $('.filters ul li').click(function(){
            $('.filters ul li').removeClass('active');
            $(this).addClass('active');
            
            var filterValue = $(this).attr('data-filter');
            if (filterValue === '*') {
                $('.all').show();
            } else {
                $('.all').hide();
                $(filterValue).show();
            }
        });
    }

	var width = $(window).width();
		$(window).resize(function() {
			if (width > 992 && $(window).width() < 992) {
				location.reload();
			}
			else if (width < 992 && $(window).width() > 992) {
				location.reload();
			}
	})



	$(document).on("click", ".naccs .menu div", function() {
		var numberIndex = $(this).index();
	
		if (!$(this).is("active")) {
			$(".naccs .menu div").removeClass("active");
			$(".naccs ul li").removeClass("active");
	
			$(this).addClass("active");
			$(".naccs ul").find("li:eq(" + numberIndex + ")").addClass("active");
	
			var listItemHeight = $(".naccs ul")
				.find("li:eq(" + numberIndex + ")")
				.innerHeight();
			$(".naccs ul").height(listItemHeight + "px");
		}
	});

	// Removed owl carousel
    $('.features-items').css({
        display: 'flex',
        flexWrap: 'wrap',
        gap: '30px'
    });
	// Responsive settings handled by CSS

    if ($.fn && $.fn.owlCarousel) {
		$('.owl-collection').owlCarousel({
		items:3,
		loop:true,
		dots: false,
		nav: true,
		autoplay: true,
		margin:30,
		responsive:{
			  0:{
				  items:1
			  },
			  800:{
				  items:2
			  },
			  1000:{
				  items:3
			}
		}
		})

		$('.owl-banner').owlCarousel({
		items:1,
		loop:true,
		dots: false,
		nav: true,
		autoplay: true,
		margin:30,
		responsive:{
			  0:{
				  items:1
			  },
			  600:{
				  items:1
			  },
			  1000:{
				  items:1
			}
		}
		})
	}

	
	
	

	// Menu Dropdown Toggle
	if($('.menu-trigger').length){
		$(".menu-trigger").on('click', function() {	
			$(this).toggleClass('active');
			$('.header-area .nav').slideToggle(200);
		});
	}


	// Menu elevator animation
	$('.scroll-to-section a[href*=\\#]:not([href=\\#])').on('click', function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			if (target.length) {
				var width = $(window).width();
				if(width < 991) {
					$('.menu-trigger').removeClass('active');
					$('.header-area .nav').slideUp(200);	
				}				
				$('html,body').animate({
					scrollTop: (target.offset().top) - 80
				}, 700);
				return false;
			}
		}
	});

	$(document).ready(function () {
	    $(document).on("scroll", onScroll);
	    
	    //smoothscroll
	    $('.scroll-to-section a[href^="#"]').on('click', function (e) {
	        e.preventDefault();
	        $(document).off("scroll");
	        
	        $('.scroll-to-section a').each(function () {
	            $(this).removeClass('active');
	        })
	        $(this).addClass('active');
	      
	        var target = this.hash,
	        menu = target;
	       	var target = $(this.hash);
	        $('html, body').stop().animate({
	            scrollTop: (target.offset().top) - 79
	        }, 500, 'swing', function () {
	            window.location.hash = target;
	            $(document).on("scroll", onScroll);
	        });
	    });
	});

	function onScroll(event){
	    var scrollPos = $(document).scrollTop();
	    $('.nav a').each(function () {
	        var currLink = $(this);
	        var refElement = $(currLink.attr("href"));
	        if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
	            $('.nav ul li a').removeClass("active");
	            currLink.addClass("active");
	        }
	        else{
	            currLink.removeClass("active");
	        }
	    });
	}


	// Page loading animation
	$(window).on('load', function() {
		if($('.cover').length){
			$('.cover').parallax({
				imageSrc: $('.cover').data('image'),
				zIndex: '1'
			});
		}

		$("#preloader").animate({
			'opacity': '0'
		}, 600, function(){
			setTimeout(function(){
				$("#preloader").css("visibility", "hidden").fadeOut();
			}, 300);
		});
	});

	

	const dropdownOpener = $('.main-nav ul.nav .has-sub > a');

    // Open/Close Submenus
    if (dropdownOpener.length) {
        dropdownOpener.each(function () {
            var _this = $(this);

            _this.on('tap click', function (e) {
                var thisItemParent = _this.parent('li'),
                    thisItemParentSiblingsWithDrop = thisItemParent.siblings('.has-sub');

                if (thisItemParent.hasClass('has-sub')) {
                    var submenu = thisItemParent.find('> ul.sub-menu');

                    if (submenu.is(':visible')) {
                        submenu.slideUp(450, 'easeInOutQuad');
                        thisItemParent.removeClass('is-open-sub');
                    } else {
                        thisItemParent.addClass('is-open-sub');

                        if (thisItemParentSiblingsWithDrop.length === 0) {
                            thisItemParent.find('.sub-menu').slideUp(400, 'easeInOutQuad', function () {
                                submenu.slideDown(250, 'easeInOutQuad');
                            });
                        } else {
                            thisItemParent.siblings().removeClass('is-open-sub').find('.sub-menu').slideUp(250, 'easeInOutQuad', function () {
                                submenu.slideDown(250, 'easeInOutQuad');
                            });
                        }
                    }
                }

                e.preventDefault();
            });
        });
    }


	


})(window.jQuery);

// Close menu when clicking outside
$(document).on('click', function(e) {
    if (!$(e.target).closest('.nav').length && !$(e.target).closest('.menu-trigger').length) {
        $('.menu-trigger').removeClass('active');
        $('.nav').removeClass('active');
    }
});

// Add this function to load published products
function loadPublishedProducts() {
    const products = JSON.parse(localStorage.getItem('publishedProducts') || '[]');
    const container = document.querySelector('.currently-market-items');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="currently-market-item">
            <div class="item">
                <div class="left-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="right-content">
                    <h4>${product.name}</h4>
                    <div class="author">
                        <h2>Category: ${product.category}</h2>
                    </div>
                    <div class="bid">
                        Price: <strong>₹${product.price}</strong>
                    </div>
                    <div class="ends">
                        Daily Earning: <strong>₹${product.dailyEarning}</strong>
                    </div>
                    <div class="text-button">
                        <a href="details.html?id=${product.id}">View Investment</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Call this function when page loads
document.addEventListener('DOMContentLoaded', loadPublishedProducts);

// EMI Calculator
function showEMICalculator() {
    const html = `
        <div class="modal fade" id="emiModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">EMI Calculator</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group mb-3">
                            <label>Principal Amount (₹)</label>
                            <input type="number" class="form-control" id="principal">
                        </div>
                        <div class="form-group mb-3">
                            <label>Interest Rate (%)</label>
                            <input type="number" class="form-control" id="interest">
                        </div>
                        <div class="form-group mb-3">
                            <label>Tenure (Months)</label>
                            <input type="number" class="form-control" id="tenure">
                        </div>
                        <div class="result mt-3" id="emiResult"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="calculateEMI()">Calculate</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    const modal = new bootstrap.Modal(document.getElementById('emiModal'));
    modal.show();
}

function calculateEMI() {
    const p = document.getElementById('principal').value;
    const r = document.getElementById('interest').value / 12 / 100;
    const n = document.getElementById('tenure').value;
    const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    document.getElementById('emiResult').innerHTML = `
        <div class="alert alert-info">
            Monthly EMI: ₹${emi.toFixed(2)}<br>
            Total Amount: ₹${(emi * n).toFixed(2)}<br>
            Interest Amount: ₹${(emi * n - p).toFixed(2)}
        </div>
    `;
}

// Deposit functionality
function showDepositModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById('depositModal'));
    modal.show();
}

// Quick amount selection
function setAmount(amount) {
    document.getElementById('depositAmount').value = amount;
    document.getElementById('confirmAmount').textContent = amount;
}

// UPI Payment
function processUPIPayment(amount, upiApp) {
    const merchantUPI = 'your-upi@bank'; // Replace with your UPI ID
    const merchantName = 'INVESTLOOM7X';
    const txnId = 'TXN' + Date.now();
    const upiURL = `upi://pay?pa=${merchantUPI}&pn=${merchantName}&am=${amount}&tr=${txnId}&cu=INR`;
    
    // Open UPI app
    window.location.href = upiURL;
    
    // Start payment check
    checkPaymentStatus(txnId, amount);
}

// Payment status check
function checkPaymentStatus(txnId, amount) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
        attempts++;
        // Mock check (replace with actual API call)
        if (attempts === 3) { // Simulating successful payment
            clearInterval(checkInterval);
            handleSuccessfulPayment(amount);
        }
        if (attempts > 10) { // Timeout after 10 attempts
            clearInterval(checkInterval);
            alert('Payment timeout. Please try again.');
        }
    }, 2000);
}

// Handle successful payment
function handleSuccessfulPayment(amount) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.balance = (currentUser.balance || 0) + Number(amount);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    document.getElementById('userBalanceAmount').textContent = `₹${currentUser.balance}`;
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('depositModal'));
    modal.hide();
    
    alert(`Successfully deposited ₹${amount}. Your new balance is ₹${currentUser.balance}`);
}

// Balance and Withdrawal
function showBalance() {
    window.location.href = 'profile.html#balance';
}

function handleWithdrawal() {
    window.location.href = 'profile.html#withdraw';
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Quick amount buttons
    const quickAmounts = document.querySelectorAll('.quick-amounts button');
    quickAmounts.forEach(btn => {
        btn.onclick = () => setAmount(btn.textContent.replace('₹', ''));
    });

    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-option');
    paymentMethods.forEach(method => {
        method.onclick = () => {
            const amount = document.getElementById('depositAmount').value;
            if (!amount || amount < 100) {
                alert('Please enter valid amount (minimum ₹100)');
                return;
            }
            processUPIPayment(amount, method.dataset.app);
        }
    });
});

function toggleMobileMenu(trigger) {
    trigger.classList.toggle('active');
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

// Add mobile menu styles
document.head.insertAdjacentHTML('beforeend', `
<style>
    .nav-links {
        display: none;
    }
    
    .nav-links.show {
        display: block;
        position: absolute;
        top: 80px;
        right: 0;
        background: #1d1d1d;
        width: 200px;
        padding: 20px;
        border-radius: 10px;
    }
    
    @media (min-width: 992px) {
        .nav-links {
            display: flex;
        }
        .menu-trigger {
            display: none;
        }
    }
</style>
`);

// Menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuTrigger = document.getElementById('menuTrigger');
    const mobileMenu = document.getElementById('mobileMenu');
    
    // Toggle menu
    menuTrigger?.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!menuTrigger.contains(e.target) && !mobileMenu.contains(e.target)) {
            menuTrigger.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });
});

// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuButton) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    });
});

// Menu functions
function showWithdrawModal() {
    const withdrawModal = new bootstrap.Modal(document.getElementById('withdrawModal'));
    withdrawModal.show();
}

function shareWebsite() {
    if (navigator.share) {
        navigator.share({
            title: 'INVESTLOOM7X',
            text: 'Check out this investment platform!',
            url: window.location.origin
        });
    } else {
        // Fallback
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = window.location.href;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        alert('URL copied to clipboard!');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}


// Preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('js-preloader');
    if (!preloader) return;
    setTimeout(() => {
        preloader.classList.add('loaded');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 300);
    }, 1000);
});

// Fix owlCarousel error
$(document).ready(function() {
    if ($.fn.owlCarousel) {
        $('.owl-carousel').owlCarousel({
            items: 4,
            loop: true,
            dots: false,
            nav: true,
            autoplay: true,
            margin: 30,
            responsive: {
                0: {
                    items: 1
                },
                600: {
                    items: 2
                },
                1000: {
                    items: 4
                }
            }
        });
    }
});
