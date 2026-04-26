// ============================================
// HAIRSAFE - FIXED SCRIPT (No random popups)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    updateCartCounter();
    refreshCaptcha();
    initSwiper();
    initDarkMode();
    initFloatingCartBar();
    initTypedHeadline();
    initQuickView();
    initTrustBadge();
    initAIWidget();
    initAddToCartButtons();

    if (document.querySelector('.cart-page')) {
        displayCartItems();
    }
    
    if (document.querySelector('.payment-page')) {
        displayOrderSummary();
        setupPaymentForm();
    }
});

let swiperInstance = null;

function initSwiper() {
    if (document.querySelector('.swiper') && typeof Swiper !== 'undefined') {
        swiperInstance = new Swiper('.swiper', {
            loop: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            slidesPerView: 1,
            spaceBetween: 20,
            breakpoints: {
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    }
}

function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;
    
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        toggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

function initFloatingCartBar() {
    const bar = document.createElement('div');
    bar.className = 'floating-cart-bar';
    bar.innerHTML = `
        <span><i class="fas fa-shopping-cart"></i> <span id="float-cart-count">0</span> items in cart</span>
        <a href="cart.html" class="cta-button" style="padding: 8px 20px;">View Cart →</a>
    `;
    document.body.appendChild(bar);
    
    window.updateFloatBar = () => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        const floatCount = document.getElementById('float-cart-count');
        if (floatCount) floatCount.innerText = total;
        if (total > 0) {
            bar.classList.add('show');
        } else {
            bar.classList.remove('show');
        }
    };
    updateFloatBar();
}

function initTypedHeadline() {
    const headline = document.getElementById('typed-headline');
    if (!headline) return;
    
    const phrases = [
        "Don't let hair concerns hold you back.",
        "Get your dream hair today! 🌟",
        "Expert solutions at your fingertips.",
        "Love your hair, love yourself 💚"
    ];
    let i = 0;
    
    setInterval(() => {
        i = (i + 1) % phrases.length;
        headline.style.opacity = '0';
        setTimeout(() => {
            headline.innerText = phrases[i];
            headline.style.opacity = '1';
        }, 200);
    }, 4000);
}

// FIXED: Only product images trigger quick view
function initQuickView() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'quick-view-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img id="modal-img" src="" style="max-width: 200px; margin: 20px 0;">
            <h3 id="modal-title"></h3>
            <p id="modal-price" style="font-size: 1.5rem; color: #4CAF50;"></p>
            <button id="modal-add-btn" class="cta-button">Add to Cart</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    
    // FIXED: Only target product-card images, not all images
    const productImages = document.querySelectorAll('.product-card img');
    productImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = img.closest('.product-card');
            if (!card) return;
            
            const name = card.querySelector('h3')?.innerText || 'Product';
            const priceText = card.querySelector('p')?.innerText || '';
            const priceMatch = priceText.match(/\d+/);
            const price = priceMatch ? parseInt(priceMatch[0]) : 0;
            const imgSrc = img.src;
            
            document.getElementById('modal-img').src = imgSrc;
            document.getElementById('modal-title').innerText = name;
            document.getElementById('modal-price').innerText = `₹${price}`;
            modal.style.display = 'flex';
            
            document.getElementById('modal-add-btn').onclick = () => {
                addToCart({ name: name, price: price, image: imgSrc });
                modal.style.display = 'none';
                showToast(`${name} added to cart!`);
            };
        });
    });
}

function initTrustBadge() {
    const checkoutBtn = document.querySelector('.cart-summary .cta-button');
    if (checkoutBtn && !document.querySelector('.trust-badge')) {
        const badge = document.createElement('div');
        badge.className = 'trust-badge';
        badge.style.cssText = 'margin-top: 15px; text-align: center; font-size: 0.75rem; color: #666;';
        badge.innerHTML = '🔒 256-bit SSL Secure | 👥 124 people viewing this week | 🚚 Free shipping on orders over ₹500';
        checkoutBtn.parentNode.insertBefore(badge, checkoutBtn.nextSibling);
    }
}

function initAIWidget() {
    const widget = document.getElementById('aiWidget');
    if (widget) {
        widget.addEventListener('click', () => {
            showToast("🤖 AI Hair Analysis coming soon! Upload your photo for instant recommendations.");
        });
    }
}

// FIXED: Only add-to-cart buttons trigger add to cart
function initAddToCartButtons() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn, .product-card button');
    addToCartBtns.forEach(btn => {
        // Remove any existing listeners to prevent duplicates
        btn.removeEventListener('click', handleAddToCart);
        btn.addEventListener('click', handleAddToCart);
    });
}

function handleAddToCart(e) {
    e.stopPropagation();
    const btn = e.currentTarget;
    const card = btn.closest('.product-card');
    
    if (!card) return;
    
    const name = card.querySelector('h3')?.innerText || 'Product';
    const priceText = card.querySelector('p')?.innerText || '';
    const priceMatch = priceText.match(/\d+/);
    const price = priceMatch ? parseInt(priceMatch[0]) : 0;
    const img = card.querySelector('img')?.src || '';
    
    addToCart({ name, price, image: img });
}

// ============================================
// CART FUNCTIONS
// ============================================

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let existingProduct = cart.find(item => item.name === product.name);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`${product.name} added to cart! 🎉`);
    updateCartCounter();
    if (window.updateFloatBar) updateFloatBar();
    
    // Animate cart icon
    const cartIcon = document.querySelector('.cart-button i');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => { cartIcon.style.transform = 'scale(1)'; }, 300);
    }
}

function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById('cart-items-container');
    const cartSummaryContainer = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart" style="text-align: center; padding: 50px;">
                <i class="fas fa-shopping-bag" style="font-size: 4rem; color: #ccc;"></i>
                <p>Your cart is empty</p>
                <a href="index.html#products" class="cta-button">Start Shopping</a>
            </div>
        `;
        if(cartSummaryContainer) cartSummaryContainer.style.display = 'none';
        return;
    }

    cartContainer.innerHTML = '';
    cart.forEach(item => {
        const cartItemHTML = `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Price: ₹${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateQuantity('${item.name}', ${item.quantity - 1})" class="qty-btn">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.name}', ${item.quantity + 1})" class="qty-btn">+</button>
                    <button onclick="removeFromCart('${item.name}')" class="remove-btn"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
        cartContainer.innerHTML += cartItemHTML;
    });
    
    updateCartSummary(cart);
}

function updateQuantity(productName, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productName);
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const product = cart.find(item => item.name === productName);
    if (product) {
        product.quantity = newQuantity;
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCartItems();
        updateCartCounter();
        if (window.updateFloatBar) updateFloatBar();
    }
}

function updateCartSummary(cart) {
    const cartSummaryContainer = document.getElementById('cart-summary');
    if (!cartSummaryContainer) return;
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const shipping = subtotal > 500 ? 0 : 40;
    const total = subtotal + tax + shipping;
    
    cartSummaryContainer.innerHTML = `
        <h3>Cart Summary</h3>
        <p>Subtotal: <span>₹${subtotal.toFixed(2)}</span></p>
        <p>Tax (5%): <span>₹${tax.toFixed(2)}</span></p>
        <p>Shipping: <span>${shipping === 0 ? 'Free' : '₹' + shipping.toFixed(2)}</span></p>
        <hr>
        <h4>Total: <span>₹${total.toFixed(2)}</span></h4>
        ${subtotal < 500 ? '<p class="free-shipping-note" style="font-size: 0.8rem; color: #4CAF50;">✨ Add ₹' + (500 - subtotal).toFixed(2) + ' more for free shipping</p>' : '<p class="free-shipping-note" style="font-size: 0.8rem; color: #4CAF50;">🎉 You qualify for free shipping!</p>'}
        <button class="cta-button" onclick="window.location.href='payment.html'" style="width:100%">Proceed to Checkout →</button>
    `;
    cartSummaryContainer.style.display = 'block';
    initTrustBadge();
}

function removeFromCart(productName) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.name !== productName);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCartItems();
    updateCartCounter();
    if (window.updateFloatBar) updateFloatBar();
    showToast(`${productName} removed from cart`);
}

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const counterElement = document.getElementById('cart-counter');

    if (counterElement) {
        counterElement.textContent = totalItems;
        if (totalItems > 0) {
            counterElement.classList.add('active');
        } else {
            counterElement.classList.remove('active');
        }
    }
}

function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// PAYMENT PAGE FUNCTIONS
// ============================================

function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const summaryContainer = document.getElementById('order-summary');
    
    if (!summaryContainer) return;
    
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p>Your cart is empty. <a href="index.html">Go back</a></p>';
        return;
    }

    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `<p>${item.name} (x${item.quantity}) <span>₹${(item.price * item.quantity).toFixed(2)}</span></p>`;
    });

    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const shipping = subtotal > 500 ? 0 : 40;
    const total = subtotal + tax + shipping;

    summaryContainer.innerHTML = `
        <h3>Order Summary</h3>
        ${itemsHTML}
        <hr>
        <p>Subtotal: <span>₹${subtotal.toFixed(2)}</span></p>
        <p>Tax: <span>₹${tax.toFixed(2)}</span></p>
        <p>Shipping: <span>${shipping === 0 ? 'Free' : '₹' + shipping.toFixed(2)}</span></p>
        <hr>
        <h4>Total: <span>₹${total.toFixed(2)}</span></h4>
        <div class="trust-badge-checkout" style="margin-top: 15px;">
            <i class="fas fa-lock"></i> Secure Payment
        </div>
    `;
}

function setupPaymentForm() {
    const form = document.getElementById('main-payment-form');
    if(!form) return;

    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    const submitBtn = document.getElementById('submit-payment-btn');

    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.payment-content').forEach(content => {
                content.style.display = 'none';
            });
            const selectedContent = document.getElementById(`${this.value}-payment-content`);
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
            if (this.value === 'cod') {
                submitBtn.textContent = 'Place Order';
            } else {
                submitBtn.textContent = 'Pay Now';
            }
        });
    });

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
        if (selectedMethod === 'card') {
            const cardName = document.getElementById('name')?.value;
            const cardNumber = document.getElementById('card-number')?.value;
            if (!cardName || !cardNumber) {
                alert('Please fill out all required card details.');
                return;
            }
        }
        handleSuccessfulPayment(selectedMethod);
    });
}

function handleSuccessfulPayment(method) {
    const popup = document.getElementById('order-success-popup');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');
    const trackingInfo = document.getElementById('tracking-info');
    const trackingIdSpan = document.getElementById('tracking-id');

    const trackingId = 'HR' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    if (trackingIdSpan) trackingIdSpan.textContent = trackingId;
    if (trackingInfo) trackingInfo.style.display = 'block';

    if (method === 'cod') {
        popupTitle.textContent = '🎉 Order Placed Successfully!';
        popupMessage.textContent = 'Your order will be delivered soon. Please pay the courier upon arrival.';
    } else {
        popupTitle.textContent = '✅ Payment Successful!';
        popupMessage.textContent = 'Thank you for your purchase. Your order is being processed.';
    }
    
    if (popup) {
        popup.style.display = 'flex';
    }
    
    localStorage.removeItem('cart');
    updateCartCounter();
    if (window.updateFloatBar) updateFloatBar();

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 5000);
}

// ============================================
// LOGIN, SIGNUP, CAPTCHA, OTP FUNCTIONS
// ============================================

let captchaText = '';
let tempUserData = {};

function showSignUpForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const otpForm = document.getElementById('otp-form');
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
    if (otpForm) otpForm.style.display = 'none';
    refreshCaptcha();
}

function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const otpForm = document.getElementById('otp-form');
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username')?.value;
    const password = document.getElementById('login-password')?.value;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(user => user.username === username && user.password === password);
    if (foundUser) {
        showToast(`Welcome back, ${username}! 🎉`);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUser', username);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    } else {
        alert("Invalid username or password.");
    }
}

function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function refreshCaptcha() {
    captchaText = generateCaptcha();
    const captchaElement = document.getElementById('captcha-text');
    if (captchaElement) {
        captchaElement.textContent = captchaText;
    }
}

function handleSignUp(event) {
    event.preventDefault();
    const userInput = document.getElementById('captcha-input')?.value;
    if (userInput && userInput.toLowerCase() !== captchaText.toLowerCase()) {
        alert('Captcha verification failed. Please try again.');
        refreshCaptcha();
        return;
    }
    const username = document.getElementById('signup-username')?.value;
    const mobile = document.getElementById('signup-mobile')?.value;
    const password = document.getElementById('signup-password')?.value;
    
    tempUserData = { username, mobile, password };

    const signupForm = document.getElementById('signup-form');
    const otpForm = document.getElementById('otp-form');
    if (signupForm) signupForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'block';

    showToast('Verification successful! OTP: 123456 (Demo)');
}

function handleOtpVerification(event) {
    event.preventDefault();
    const otpInput = document.getElementById('otp-input')?.value;
    if (otpInput !== '123456') {
        alert('Invalid OTP. Please try again.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === tempUserData.username);
    if (userExists) {
        alert("Username is already taken. Please choose another one.");
        showSignUpForm();
        return;
    }

    users.push(tempUserData);
    localStorage.setItem('users', JSON.stringify(users));
    showToast("Account created successfully! Please log in. 🎉");
    showLoginForm();
}

function resendOtp() {
    showToast("OTP resent! Demo OTP: 123456");
}

function copyUpiId() {
    navigator.clipboard.writeText('hairsafeofficial@upi');
    showToast('UPI ID copied to clipboard!');
}

function handleConsultationSubmit(event) {
    event.preventDefault();
    const description = document.getElementById('problem-description')?.value;
    if (!description) {
        alert('Please describe your problem');
        return;
    }
    showToast('Consultation request sent! Our expert will contact you within 24 hours.');
    const form = document.getElementById('consultation-form');
    if (form) form.reset();
    const fileNameDisplay = document.getElementById('file-name-display');
    if (fileNameDisplay) fileNameDisplay.textContent = '';
}

function updateFileName() {
    const fileInput = document.getElementById('problem-pic');
    const fileNameDisplay = document.getElementById('file-name-display');
    if (fileInput && fileInput.files.length > 0) {
        fileNameDisplay.textContent = `📷 ${fileInput.files[0].name}`;
    } else if (fileNameDisplay) {
        fileNameDisplay.textContent = '';
    }
}
// ============================================
// PROFILE DASHBOARD FUNCTIONS
// ============================================

let currentUser = null;
let userOrders = [];
let userConsultations = [];
let userAddresses = [];
let userWishlist = [];
let userSettings = {};

// Check login status on page load
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    if (isLoggedIn && loggedInUser) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        currentUser = users.find(u => u.username === loggedInUser);
        
        if (currentUser) {
            showProfileDashboard();
            loadUserData();
        }
    } else {
        // Hide profile, show login form
        const loginForm = document.getElementById('login-form');
        const profileDashboard = document.getElementById('profile-dashboard');
        if (loginForm) loginForm.style.display = 'block';
        if (profileDashboard) profileDashboard.style.display = 'none';
    }
}

function showProfileDashboard() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const otpForm = document.getElementById('otp-form');
    const profileDashboard = document.getElementById('profile-dashboard');
    
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'none';
    if (profileDashboard) profileDashboard.style.display = 'block';
    
    // Update account button text
    const accountBtn = document.getElementById('account-btn');
    if (accountBtn && currentUser) {
        accountBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.username}`;
    }
    
    // Update profile info
    document.getElementById('profile-username').textContent = currentUser?.username || 'User';
    document.getElementById('profile-email').textContent = currentUser?.email || 'user@example.com';
    
    // Set member since date
    const memberSince = localStorage.getItem(`memberSince_${currentUser?.username}`);
    if (memberSince) {
        document.getElementById('member-since').textContent = memberSince;
    } else {
        const date = new Date().toLocaleDateString('en-IN');
        document.getElementById('member-since').textContent = date;
        localStorage.setItem(`memberSince_${currentUser?.username}`, date);
    }
}

function loadUserData() {
    // Load orders
    const savedOrders = localStorage.getItem(`orders_${currentUser?.username}`);
    userOrders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Load consultations
    const savedConsultations = localStorage.getItem(`consultations_${currentUser?.username}`);
    userConsultations = savedConsultations ? JSON.parse(savedConsultations) : [];
    
    // Load addresses
    const savedAddresses = localStorage.getItem(`addresses_${currentUser?.username}`);
    userAddresses = savedAddresses ? JSON.parse(savedAddresses) : [];
    
    // Load wishlist
    const savedWishlist = localStorage.getItem(`wishlist_${currentUser?.username}`);
    userWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    
    // Load settings
    const savedSettings = localStorage.getItem(`settings_${currentUser?.username}`);
    userSettings = savedSettings ? JSON.parse(savedSettings) : {
        emailNotifications: true,
        smsNotifications: true,
        whatsappNotifications: false
    };
    
    updateStats();
    displayOrders();
    displayConsultations();
    displayAddresses();
    displayWishlist();
    loadSettings();
}

function updateStats() {
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    const pendingDeliveries = userOrders.filter(order => order.status !== 'Delivered').length;
    const loyaltyPoints = Math.floor(totalSpent / 10); // 10 points per ₹100 spent
    
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-spent').textContent = `₹${totalSpent}`;
    document.getElementById('pending-deliveries').textContent = pendingDeliveries;
    document.getElementById('loyalty-points').textContent = loyaltyPoints;
}

function displayOrders() {
    const ordersContainer = document.getElementById('orders-list');
    
    if (!ordersContainer) return;
    
    if (userOrders.length === 0) {
        ordersContainer.innerHTML = '<p class="no-data">No orders yet. <a href="index.html#products">Start shopping!</a></p>';
        return;
    }
    
    ordersContainer.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Order #${order.orderId}</span>
                <span class="order-date">${order.date}</span>
                <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div class="order-items">
                ${order.items.map(item => `<p>${item.name} x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}</p>`).join('')}
            </div>
            <div class="order-total">
                Total: ₹${order.total.toFixed(2)}
            </div>
            ${order.status === 'Delivered' ? `<button class="reorder-btn" onclick="reorder('${order.orderId}')">Reorder All</button>` : ''}
        </div>
    `).join('');
}

function displayConsultations() {
    const consultationsContainer = document.getElementById('consultations-list');
    
    if (!consultationsContainer) return;
    
    if (userConsultations.length === 0) {
        consultationsContainer.innerHTML = '<p class="no-data">No consultations yet. <a href="index.html#treatments">Book a consultation!</a></p>';
        return;
    }
    
    consultationsContainer.innerHTML = userConsultations.map(consult => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Consultation #${consult.id}</span>
                <span class="order-date">${consult.date}</span>
                <span class="order-status status-${consult.status.toLowerCase()}">${consult.status}</span>
            </div>
            <div class="order-items">
                <p><strong>Problem:</strong> ${consult.problem.substring(0, 100)}${consult.problem.length > 100 ? '...' : ''}</p>
            </div>
            ${consult.status === 'Completed' ? `<button class="reorder-btn" onclick="bookAgain('${consult.id}')">Book Again</button>` : ''}
        </div>
    `).join('');
}

function displayAddresses() {
    const addressesContainer = document.getElementById('addresses-list');
    
    if (!addressesContainer) return;
    
    if (userAddresses.length === 0) {
        addressesContainer.innerHTML = '<p class="no-data">No saved addresses. Add one for faster checkout!</p>';
        return;
    }
    
    addressesContainer.innerHTML = userAddresses.map((address, index) => `
        <div class="address-card ${address.isDefault ? 'default' : ''}">
            ${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
            <div class="address-name">${address.name}</div>
            <div class="address-full">
                ${address.line1}<br>
                ${address.line2 ? address.line2 + '<br>' : ''}
                ${address.city}, ${address.state}<br>
                Pincode: ${address.pincode}<br>
                Phone: ${address.phone}
            </div>
            <div class="address-actions">
                <button class="edit-address" onclick="editAddress(${index})"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-address" onclick="deleteAddress(${index})"><i class="fas fa-trash"></i> Delete</button>
                ${!address.isDefault ? `<button class="edit-address" onclick="setDefaultAddress(${index})"><i class="fas fa-check"></i> Set Default</button>` : ''}
            </div>
        </div>
    `).join('');
}

function displayWishlist() {
    const wishlistContainer = document.getElementById('wishlist-list');
    
    if (!wishlistContainer) return;
    
    if (userWishlist.length === 0) {
        wishlistContainer.innerHTML = '<p class="no-data">Your wishlist is empty. <a href="index.html#products">Explore products!</a></p>';
        return;
    }
    
    wishlistContainer.innerHTML = userWishlist.map((item, index) => `
        <div class="wishlist-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="wishlist-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price}</p>
            </div>
            <div class="wishlist-actions">
                <button class="wishlist-add-cart" onclick="addToCartFromWishlist(${index})"><i class="fas fa-cart-plus"></i></button>
                <button class="wishlist-remove" onclick="removeFromWishlist(${index})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function loadSettings() {
    document.getElementById('email-notifications').checked = userSettings.emailNotifications;
    document.getElementById('sms-notifications').checked = userSettings.smsNotifications;
    document.getElementById('whatsapp-notifications').checked = userSettings.whatsappNotifications;
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function addNewAddress() {
    const modal = document.getElementById('address-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAddressModal() {
    const modal = document.getElementById('address-modal');
    if (modal) modal.style.display = 'none';
}

// Handle address form submission
document.addEventListener('DOMContentLoaded', () => {
    const addressForm = document.getElementById('address-form');
    if (addressForm) {
        addressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newAddress = {
                name: document.getElementById('address-name').value,
                phone: document.getElementById('address-phone').value,
                line1: document.getElementById('address-line1').value,
                line2: document.getElementById('address-line2').value,
                city: document.getElementById('address-city').value,
                state: document.getElementById('address-state').value,
                pincode: document.getElementById('address-pincode').value,
                isDefault: document.getElementById('address-default').checked
            };
            
            if (newAddress.isDefault) {
                userAddresses.forEach(addr => addr.isDefault = false);
            }
            
            userAddresses.push(newAddress);
            localStorage.setItem(`addresses_${currentUser?.username}`, JSON.stringify(userAddresses));
            
            displayAddresses();
            closeAddressModal();
            addressForm.reset();
            showToast('Address added successfully!');
        });
    }
});

function editAddress(index) {
    const address = userAddresses[index];
    // Populate modal with address data for editing
    document.getElementById('address-name').value = address.name;
    document.getElementById('address-phone').value = address.phone;
    document.getElementById('address-line1').value = address.line1;
    document.getElementById('address-line2').value = address.line2 || '';
    document.getElementById('address-city').value = address.city;
    document.getElementById('address-state').value = address.state;
    document.getElementById('address-pincode').value = address.pincode;
    document.getElementById('address-default').checked = address.isDefault;
    
    // Remove old address, add updated on submit
    userAddresses.splice(index, 1);
    addNewAddress();
}

function deleteAddress(index) {
    if (confirm('Are you sure you want to delete this address?')) {
        userAddresses.splice(index, 1);
        localStorage.setItem(`addresses_${currentUser?.username}`, JSON.stringify(userAddresses));
        displayAddresses();
        showToast('Address deleted successfully!');
    }
}

function setDefaultAddress(index) {
    userAddresses.forEach(addr => addr.isDefault = false);
    userAddresses[index].isDefault = true;
    localStorage.setItem(`addresses_${currentUser?.username}`, JSON.stringify(userAddresses));
    displayAddresses();
    showToast('Default address updated!');
}

function addToCartFromWishlist(index) {
    const item = userWishlist[index];
    addToCart({ name: item.name, price: item.price, image: item.image });
    removeFromWishlist(index);
}

function removeFromWishlist(index) {
    if (confirm('Remove from wishlist?')) {
        userWishlist.splice(index, 1);
        localStorage.setItem(`wishlist_${currentUser?.username}`, JSON.stringify(userWishlist));
        displayWishlist();
        showToast('Removed from wishlist');
    }
}

function reorder(orderId) {
    const order = userOrders.find(o => o.orderId === orderId);
    if (order) {
        order.items.forEach(item => {
            addToCart({ name: item.name, price: item.price, image: item.image });
        });
        showToast('Items added to cart!');
        window.location.href = 'cart.html';
    }
}

function bookAgain(consultationId) {
    window.location.href = 'index.html#treatments';
}

function updateEmail() {
    const newEmail = document.getElementById('settings-email').value;
    if (newEmail && currentUser) {
        currentUser.email = newEmail;
        
        // Update in users array
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].email = newEmail;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        document.getElementById('profile-email').textContent = newEmail;
        showToast('Email updated successfully!');
        document.getElementById('settings-email').value = '';
    }
}

function updateMobile() {
    const newMobile = document.getElementById('settings-mobile').value;
    if (newMobile && currentUser) {
        currentUser.mobile = newMobile;
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].mobile = newMobile;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        showToast('Mobile number updated successfully!');
        document.getElementById('settings-mobile').value = '';
    }
}

function changePassword() {
    const currentPwd = document.getElementById('settings-current-password').value;
    const newPwd = document.getElementById('settings-new-password').value;
    const confirmPwd = document.getElementById('settings-confirm-password').value;
    
    if (!currentPwd || !newPwd || !confirmPwd) {
        alert('Please fill all password fields');
        return;
    }
    
    if (currentPwd !== currentUser.password) {
        alert('Current password is incorrect');
        return;
    }
    
    if (newPwd !== confirmPwd) {
        alert('New passwords do not match');
        return;
    }
    
    currentUser.password = newPwd;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].password = newPwd;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    showToast('Password changed successfully!');
    document.getElementById('settings-current-password').value = '';
    document.getElementById('settings-new-password').value = '';
    document.getElementById('settings-confirm-password').value = '';
}

function saveNotificationPrefs() {
    userSettings.emailNotifications = document.getElementById('email-notifications').checked;
    userSettings.smsNotifications = document.getElementById('sms-notifications').checked;
    userSettings.whatsappNotifications = document.getElementById('whatsapp-notifications').checked;
    
    localStorage.setItem(`settings_${currentUser?.username}`, JSON.stringify(userSettings));
    showToast('Notification preferences saved!');
}

function changeAvatar() {
    // For demo, just show a toast
    showToast('Avatar change feature coming soon!');
}

function forgotPassword() {
    showToast('Password reset link sent to your registered email!');
}

function socialLogin(provider) {
    showToast(`Login with ${provider} coming soon!`);
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('loggedInUser');
        currentUser = null;
        
        // Reset UI
        const loginForm = document.getElementById('login-form');
        const profileDashboard = document.getElementById('profile-dashboard');
        const accountBtn = document.getElementById('account-btn');
        
        if (loginForm) loginForm.style.display = 'block';
        if (profileDashboard) profileDashboard.style.display = 'none';
        if (accountBtn) accountBtn.innerHTML = 'My Account';
        
        showToast('Logged out successfully!');
        
        // Clear form fields
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    }
}

// Override handleLogin to save orders and show profile
const originalHandleLogin = handleLogin;
handleLogin = function(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(user => user.username === username && user.password === password);
    
    if (foundUser) {
        currentUser = foundUser;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUser', username);
        
        showToast(`Welcome back, ${username}! 🎉`);
        
        // Load user data and show profile
        loadUserData();
        showProfileDashboard();
        
        // Remember me functionality
        const rememberMe = document.getElementById('remember-me');
        if (rememberMe && rememberMe.checked) {
            localStorage.setItem('rememberedUser', username);
        }
    } else {
        alert("Invalid username or password.");
    }
};

// Override handleSignUp to add email field
const originalHandleSignUp = handleSignUp;
handleSignUp = function(event) {
    event.preventDefault();
    const userInput = document.getElementById('captcha-input')?.value;
    if (userInput && userInput.toLowerCase() !== captchaText.toLowerCase()) {
        alert('Captcha verification failed. Please try again.');
        refreshCaptcha();
        return;
    }
    
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    tempUserData = {
        username: document.getElementById('signup-username')?.value,
        email: document.getElementById('signup-email')?.value,
        mobile: document.getElementById('signup-mobile')?.value,
        password: password
    };

    const signupForm = document.getElementById('signup-form');
    const otpForm = document.getElementById('otp-form');
    if (signupForm) signupForm.style.display = 'none';
    if (otpForm) otpForm.style.display = 'block';

    showToast('Verification successful! OTP: 123456 (Demo)');
};

// Override handleOtpVerification to save complete user data
const originalHandleOtpVerification = handleOtpVerification;
handleOtpVerification = function(event) {
    event.preventDefault();
    const otpInput = document.getElementById('otp-input')?.value;
    if (otpInput !== '123456') {
        alert('Invalid OTP. Please try again.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(user => user.username === tempUserData.username);
    if (userExists) {
        alert("Username is already taken. Please choose another one.");
        showSignUpForm();
        return;
    }

    users.push(tempUserData);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Initialize empty data for new user
    localStorage.setItem(`orders_${tempUserData.username}`, JSON.stringify([]));
    localStorage.setItem(`consultations_${tempUserData.username}`, JSON.stringify([]));
    localStorage.setItem(`addresses_${tempUserData.username}`, JSON.stringify([]));
    localStorage.setItem(`wishlist_${tempUserData.username}`, JSON.stringify([]));
    localStorage.setItem(`memberSince_${tempUserData.username}`, new Date().toLocaleDateString('en-IN'));
    
    showToast("Account created successfully! Please log in. 🎉");
    showLoginForm();
};

// Override handleSuccessfulPayment to save order to user's history
const originalHandleSuccessfulPayment = handleSuccessfulPayment;
handleSuccessfulPayment = function(method) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    if (loggedInUser && cart.length > 0) {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05;
        const shipping = subtotal > 500 ? 0 : 40;
        const total = subtotal + tax + shipping;
        
        const newOrder = {
            orderId: 'HR' + Date.now().toString().slice(-8),
            date: new Date().toLocaleString('en-IN'),
            items: cart.map(item => ({ ...item })),
            subtotal: subtotal,
            tax: tax,
            shipping: shipping,
            total: total,
            paymentMethod: method,
            status: method === 'cod' ? 'Processing' : 'Confirmed'
        };
        
        // Get existing orders
        const savedOrders = localStorage.getItem(`orders_${loggedInUser}`);
        const userOrders = savedOrders ? JSON.parse(savedOrders) : [];
        userOrders.unshift(newOrder); // Add to beginning
        localStorage.setItem(`orders_${loggedInUser}`, JSON.stringify(userOrders));
        
        // Update current user's orders
        if (currentUser && currentUser.username === loggedInUser) {
            userOrdersList = userOrders;
            updateStats();
        }
    }
    
    // Call original function
    originalHandleSuccessfulPayment(method);
};

// Initialize profile check on page load
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    checkLoginStatus();
});