/**
 * cart-system.js - Complete shopping cart system
 */

// DEBUG: Check if script is loading
console.log('✅ cart-system.js loaded successfully');

// ===== PRODUCT DATABASE =====
const products = {
    1: {
        id: 1,
        name: "Milk Drink",
        title: "Milk Drink",
        price: 95.00,
        category: "Drinks",
        image: "images/drinks.jpg",
        description: "Delicious and creamy milk drink",
        fullDesc: "This premium milk drink is made from fresh dairy and comes in original, strawberry, and chocolate flavors. Rich in calcium and vitamins. 250ml bottle."
    },
    2: {
        id: 2,
        name: "Spicy Ramen",
        title: "Spicy Ramen",
        price: 99.00,
        category: "Noodles",
        image: "images/noodles.jpg",
        description: "Delicious spicy noodles",
        fullDesc: "Korean-style instant ramen with spicy broth. Includes noodle cake, soup base, and vegetable flakes. Cooking time: 4-5 minutes."
    },
    3: {
        id: 3,
        name: "Pepero",
        title: "Pepero",
        price: 50.00,
        category: "Snacks",
        image: "images/snacks.jpg",
        description: "Sweet chocolate biscuit sticks",
        fullDesc: "Pepero chocolate biscuit sticks - a classic Korean snack. Crunchy biscuit coated with smooth chocolate. Great for sharing!"
    },
    4: {
        id: 4,
        name: "Ice Cream",
        title: "Ice Cream",
        price: 45.00,
        category: "Dessert",
        image: "images/ice-cream.jpg",
        description: "Creamy ice cream",
        fullDesc: "Creamy and delicious ice cream, perfect for hot weather. Available in various flavors."
    },
    5: {
        id: 5,
        name: "Kimchi",
        title: "Kimchi",
        price: 75.00,
        category: "Food",
        image: "images/kimchi.jpg",
        description: "Authentic Korean kimchi",
        fullDesc: "Authentic Korean kimchi made with fresh cabbage and special spices. Perfect side dish for any meal."
    },
    6: {
        id: 6,
        name: "Strawberry Milk",
        title: "Strawberry Milk",
        price: 55.00,
        category: "Drinks",
        image: "images/strawberry-drink.jpg",
        description: "Sweet strawberry milk",
        fullDesc: "This premium milk drink is made from fresh dairy and comes in original, strawberry, and chocolate flavors. Rich in calcium and vitamins. 250ml bottle."
    },
    7: {
        id: 7,
        name: "Topokki",
        title: "Topokki",
        price: 85.00,
        category: "Drinks",
        image: "images/topokki.jpg",
        description: "Extra spicy topokki",
        fullDesc: "a popular Korean street food-inspired treat featuring small, cylinder-shaped rice cakes (garae-tteok) simmered in a sweet, savory, and spicy red chili sauce"
    },
    8: {
        id: 8,
        name: "Seaweed",
        title: "Seaweed",
        price: 20.00,
        category: "Drinks",
        image: "images/seaweed.jpg",
        description: "Salty and Savory Seaweed",
        fullDesc: "a popular, nutrient-dense, and sustainable superfood originating from East Asian cuisine, characterized by a light, crispy texture and a savory umami flavor"
    }
};

// ===== CART STATE =====
let cart = [];

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Cart system initializing on page:', window.location.pathname);
    
    // Load cart from storage
    loadCart();
    
    // Check if we're on order page and load product
    if (window.location.pathname.includes('order.html')) {
        console.log('📄 On order page - loading product data');
        loadProductData();
        setupOrderPageListeners();
    }
    
    // Check if we're on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        console.log('📄 On checkout page - loading checkout data');
        loadCheckoutData();
    }
    
    // Check if we're on order confirmation page
    if (window.location.pathname.includes('order-confirm.html')) {
        console.log('📄 On order confirmation page - loading order data');
        loadOrderConfirmation();
    }
    
    // Setup cart sidebar listeners
    setupCartListeners();
    
    // Update all displays
    updateAllDisplays();
});

// ===== CART STORAGE FUNCTIONS =====
function loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
            console.log('Cart loaded:', cart);
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
        }
    } else {
        cart = [];
        console.log('No cart found in storage');
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved:', cart);
    updateAllDisplays();
}

// ===== CART OPERATIONS =====
function addToCart(product, quantity = 1) {
    console.log('Adding to cart:', product, quantity);
    
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name || product.title,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    saveCart();
    alert(`Added ${quantity} x ${product.name || product.title} to cart!`);
    openCart();
}

// Helper function for products page
function addToCartFromProducts(id, name, price, image) {
    console.log('Adding from products page:', id, name, price);
    const product = {
        id: id,
        name: name,
        title: name,
        price: price,
        image: image,
        description: products[id]?.description || name,
        fullDesc: products[id]?.fullDesc || name
    };
    addToCart(product, 1);
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(itemId);
    } else {
        item.quantity = newQuantity;
        saveCart();
    }
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    alert('Item removed from cart');
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ===== DISPLAY UPDATES =====
function updateAllDisplays() {
    updateCartBadge();
    updateCartSidebar();
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const count = getItemCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function updateCartSidebar() {
    const cartItemsList = document.getElementById('cart-items-list');
    const emptyCart = document.getElementById('empty-cart');
    const cartFooter = document.getElementById('cart-footer');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    
    if (!cartItemsList) return;
    
    const count = getItemCount();
    
    // Update count in header
    if (cartCount) cartCount.textContent = count;
    
    // Show/hide empty cart message
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        cartItemsList.innerHTML = '';
        if (cartFooter) cartFooter.style.display = 'none';
    } else {
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'block';
        
        // Render cart items
        cartItemsList.innerHTML = cart.map(item => {
            return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='images/default.jpg'">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                    <div class="item-quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `}).join('');
    }
    
    // Update total
    if (cartTotal) {
        cartTotal.textContent = `₱${getCartTotal().toFixed(2)}`;
    }
}

// ===== CART SIDEBAR CONTROLS =====
function openCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCartSidebar();
    }
}

function closeCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== ORDER PAGE FUNCTIONS =====
function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('product');
    console.log('📌 Product ID from URL:', id);
    return id || '1';
}

function loadProductData() {
    console.log('🔄 Loading product data...');
    const id = getProductIdFromUrl();
    const product = products[id];
    
    if (!product) {
        console.error('❌ Product not found for ID:', id);
        return;
    }
    
    console.log('✅ Found product:', product.name);
    
    // Update page elements
    const title = document.getElementById('order-product-title');
    const price = document.getElementById('order-product-price');
    const category = document.getElementById('order-product-category');
    const description = document.getElementById('order-product-description');
    const fullDesc = document.getElementById('order-product-full-desc');
    const image = document.getElementById('order-product-image');
    
    if (title) title.textContent = product.name;
    if (price) price.textContent = `₱${product.price.toFixed(2)}`;
    if (category) category.textContent = product.category;
    if (description) description.textContent = product.description;
    if (fullDesc) fullDesc.textContent = product.fullDesc;
    if (image) {
        image.src = product.image;
        image.alt = product.name;
    }
    
    // Update page title
    document.title = `Jangsu Korean Store - ${product.name}`;
}

function getCurrentQuantity() {
    const input = document.getElementById('quantity');
    return input ? parseInt(input.value) : 1;
}

function setupOrderPageListeners() {
    // Quantity buttons
    const decreaseBtn = document.getElementById('decrease-btn');
    const increaseBtn = document.getElementById('increase-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const buyNowBtn = document.getElementById('buy-now-btn');
    const quantityInput = document.getElementById('quantity');
    
    if (decreaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', () => {
            let val = parseInt(quantityInput.value);
            if (val > 1) quantityInput.value = val - 1;
        });
    }
    
    if (increaseBtn && quantityInput) {
        increaseBtn.addEventListener('click', () => {
            let val = parseInt(quantityInput.value);
            if (val < 99) quantityInput.value = val + 1;
        });
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const id = getProductIdFromUrl();
            const product = products[id];
            if (!product) {
                alert('Product not found');
                return;
            }
            const qty = getCurrentQuantity();
            addToCart(product, qty);
        });
    }
    
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            const id = getProductIdFromUrl();
            const product = products[id];
            if (!product) {
                alert('Product not found');
                return;
            }
            const qty = getCurrentQuantity();
            
            // Create checkout data with single product
            const checkoutData = {
                items: [{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: qty,
                    image: product.image
                }],
                total: product.price * qty,
                fromBuyNow: true
            };
            
            // Save to sessionStorage for checkout page
            sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
            
            // Redirect to checkout page
            window.location.href = 'checkout.html';
        });
    }
}

// ===== CART SIDEBAR LISTENERS =====
function setupCartListeners() {
    // Cart icon click
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }
    
    // Close button
    const closeBtn = document.getElementById('close-cart');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCart);
    }
    
    // Overlay click
    const overlay = document.getElementById('cart-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeCart);
    }
    
    // View order button - NOW GOES TO CHECKOUT
    const viewBtn = document.getElementById('view-order-btn');
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }
            
            // Prepare checkout data from cart
            const checkoutData = {
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                total: getCartTotal(),
                fromCart: true
            };
            
            // Save to sessionStorage for checkout page
            sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
            
            // Go to checkout page
            window.location.href = 'checkout.html';
        });
    }
    
    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
}

// ===== MAKE FUNCTIONS GLOBAL =====
window.addToCart = addToCart;
window.addToCartFromProducts = addToCartFromProducts;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.openCart = openCart;
window.closeCart = closeCart;

// ===== CHECKOUT PAGE FUNCTIONS =====
function loadCheckoutData() {
    // Try to get data from sessionStorage (from Buy Now or View Order)
    const checkoutData = sessionStorage.getItem('checkoutData');
    const checkoutContent = document.getElementById('checkout-content');
    const checkoutActions = document.getElementById('checkout-actions');
    
    if (!checkoutContent) return; // Not on checkout page
    
    if (!checkoutData) {
        // No checkout data - show empty message
        checkoutContent.innerHTML = `
            <div class="empty-checkout">
                <p>No items to checkout!</p>
                <a href="products.html">Browse Products</a>
            </div>
        `;
        if (checkoutActions) checkoutActions.style.display = 'none';
        return;
    }
    
    const data = JSON.parse(checkoutData);
    const items = data.items || [];
    
    if (items.length === 0) {
        checkoutContent.innerHTML = `
            <div class="empty-checkout">
                <p>No items to checkout!</p>
                <a href="products.html">Browse Products</a>
            </div>
        `;
        if (checkoutActions) checkoutActions.style.display = 'none';
        return;
    }
    
    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    // Generate a random FOR number
    const forNumber = 'FOR:' + Math.floor(100000 + Math.random() * 900000);
    
    // Get current date for pickup (default to tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    
    // Generate HTML for left column
    const leftColumnHtml = `
        <div class="checkout-left">
            <!-- Order Summary Section -->
            <div class="checkout-section">
                <h2 class="section-title">Order Summary</h2>
                
                <div class="checkout-items-container">
                    ${items.map(item => `
                        <div class="checkout-item">
                            <div class="item-info">
                                <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='images/default.jpg'">
                                <div class="item-details">
                                    <span class="item-name">${item.name}</span>
                                    <div class="item-meta">
                                        <span class="item-price">₱${item.price.toFixed(2)}</span>
                                        <span class="item-quantity">${item.quantity}x</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Total Price -->
                <div class="order-total">
                    <span class="total-label">Total:</span>
                    <span class="total-value">₱${subtotal.toFixed(2)}</span>
                </div>
            </div>
            
            <!-- Pickup Schedule Section -->
            <div class="checkout-section">
                <h2 class="section-title">Pickup Schedule</h2>
                
                <div class="schedule-form">
                    <div class="form-field">
                        <label for="pickup-date">Date:</label>
                        <input type="date" id="pickup-date" name="pickup-date" value="${defaultDate}">
                    </div>
                    
                    <div class="form-field">
                        <label for="pickup-time">Time:</label>
                        <input type="time" id="pickup-time" name="pickup-time" value="12:00">
                    </div>
                </div>
            </div>
            
            <!-- Payment Method Section -->
            <div class="checkout-section">
                <h2 class="section-title">Payment Method</h2>
                
                <div class="payment-options">
                    <label class="payment-option">
                        <input type="radio" name="payment" value="Cash On Pickup" checked> 
                        <span>○ Cash On Pickup</span>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="payment" value="GCash"> 
                        <span>○ GCash</span>
                    </label>
                </div>
            </div>
            
            <!-- FOR Number -->
            <div class="for-number">
                <span>${forNumber}</span>
            </div>
        </div>
    `;
    
    // Generate HTML for right column
    const rightColumnHtml = `
        <div class="checkout-right">
            <!-- Order Summary (second instance) -->
            <div class="checkout-section">
                <h2 class="section-title">Order Summary</h2>
                
                ${items.map(item => `
                    <div class="checkout-item">
                        <div class="item-info">
                            <span class="item-name">${item.name}</span>
                            <div class="item-meta">
                                <span class="item-price">₱${item.price.toFixed(2)}</span>
                                <span class="item-quantity">${item.quantity}x</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Pickup & Payment Method Section -->
            <div class="checkout-section pickup-payment-section">
                <h2 class="section-title">Pickup & Payment Method</h2>
                
                <div class="info-rows">
                    <div class="info-row">
                        <span class="info-label">Pickup Date:</span>
                        <span class="info-value" id="summary-pickup">${defaultDate} 12:00</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Payment Method:</span>
                        <span class="info-value" id="summary-payment">Cash On Pickup</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="info-value status-pending">Pending</span>
                    </div>
                </div>
                
                <!-- Total in right column -->
                <div class="order-total right-total">
                    <span class="total-label">Total:</span>
                    <span class="total-value">₱${subtotal.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    // Combine both columns
    checkoutContent.innerHTML = leftColumnHtml + rightColumnHtml;
    if (checkoutActions) checkoutActions.style.display = 'flex';
    
    // Add event listeners for form changes
    setupCheckoutEventListeners(defaultDate);
    
    // Set up Place Order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        // Remove any existing event listeners by cloning and replacing
        const newPlaceOrderBtn = placeOrderBtn.cloneNode(true);
        placeOrderBtn.parentNode.replaceChild(newPlaceOrderBtn, placeOrderBtn);
        
        // Add new event listener
        newPlaceOrderBtn.addEventListener('click', function() {
            placeOrder(items, subtotal);
        });
    }
}

function setupCheckoutEventListeners(defaultDate) {
    const pickupDate = document.getElementById('pickup-date');
    const pickupTime = document.getElementById('pickup-time');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const summaryPickup = document.getElementById('summary-pickup');
    const summaryPayment = document.getElementById('summary-payment');
    
    if (pickupDate && pickupTime) {
        const updatePickupSummary = () => {
            const date = pickupDate.value || defaultDate;
            const time = pickupTime.value || '12:00';
            if (summaryPickup) summaryPickup.textContent = `${date} ${time}`;
        };
        
        pickupDate.addEventListener('change', updatePickupSummary);
        pickupTime.addEventListener('change', updatePickupSummary);
    }
    
    if (paymentRadios.length > 0 && summaryPayment) {
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    summaryPayment.textContent = this.value;
                }
            });
        });
    }
}

function placeOrder(items, subtotal) {
    // Get selected payment method
    const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value || 'Cash On Pickup';
    
    // Get pickup date and time
    const date = document.getElementById('pickup-date')?.value || '';
    const time = document.getElementById('pickup-time')?.value || '12:00';
    
    // Create order data
    const orderData = {
        items: items,
        total: subtotal,
        orderDate: new Date().toISOString(),
        orderNumber: 'OR-' + Math.floor(1000 + Math.random() * 9000),
        paymentMethod: selectedPayment,
        pickupDateTime: `${date} ${time}`,
        status: 'Pending'
    };
    
    // Save to sessionStorage for order confirmation
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    
    // ===== IMPORTANT: Clear the cart after order is placed =====
    // Clear the cart array
    cart = [];
    
    // Save empty cart to localStorage
    saveCart();
    
    // Clear the checkout data from sessionStorage
    sessionStorage.removeItem('checkoutData');
    
    // Go to order confirmation
    window.location.href = 'order-confirm.html';
}

// ===== ORDER CONFIRMATION PAGE FUNCTIONS =====
function loadOrderConfirmation() {
    // Try to get order data from sessionStorage
    const orderData = sessionStorage.getItem('orderData');
    const orderContainer = document.getElementById('order-items-container');
    const totalElement = document.getElementById('total-amount');
    const orderRefElement = document.getElementById('order-reference');
    const pickupDateElement = document.getElementById('pickup-date');
    const paymentMethodElement = document.getElementById('payment-method');
    
    if (!orderContainer) return; // Not on order confirmation page
    
    if (!orderData) {
        // No order data - show empty message
        orderContainer.innerHTML = `
            <div class="empty-order">
                <p>No order found!</p>
                <p><a href="products.html">Browse Products</a> to place an order.</p>
            </div>
        `;
        if (totalElement) totalElement.innerHTML = '<strong>₱0.00</strong>';
        if (orderRefElement) orderRefElement.innerHTML = '';
        return;
    }
    
    const data = JSON.parse(orderData);
    const items = data.items || [];
    const total = data.total || 0;
    const orderNumber = data.orderNumber || ('OR-' + Math.floor(1000 + Math.random() * 9000));
    const orderDate = data.orderDate ? new Date(data.orderDate) : new Date();
    const paymentMethod = data.paymentMethod || 'Cash On Pickup';
    const pickupDateTime = data.pickupDateTime || '';
    
    // Format date
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Set order reference
    if (orderRefElement) {
        orderRefElement.innerHTML = `
            <p><strong>Order #: ${orderNumber}</strong></p>
            <p class="order-date">${formattedDate}</p>
        `;
    }
    
    // Set payment method
    if (paymentMethodElement) {
        paymentMethodElement.textContent = paymentMethod;
    }
    
    // Set pickup date
    if (pickupDateElement) {
        if (pickupDateTime) {
            pickupDateElement.textContent = pickupDateTime;
        } else {
            // Default pickup (3 days from now)
            const pickupDate = new Date();
            pickupDate.setDate(pickupDate.getDate() + 3);
            const formattedPickup = pickupDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            pickupDateElement.textContent = formattedPickup;
        }
    }
    
    if (items.length === 0) {
        orderContainer.innerHTML = `
            <div class="empty-order">
                <p>No items in this order!</p>
            </div>
        `;
        if (totalElement) totalElement.innerHTML = '<strong>₱0.00</strong>';
        return;
    }
    
    // Generate HTML for each item
    let itemsHtml = '';
    items.forEach(item => {
        itemsHtml += `
            <div class="order-item-row">
                <div class="order-item-info">
                    <img src="${item.image}" alt="${item.name}" class="order-item-image" onerror="this.src='images/default.jpg'">
                    <span class="order-item-name">${item.name}</span>
                </div>
                <div class="order-item-details">
                    <span class="order-item-price">₱${item.price.toFixed(2)}</span>
                    <span class="order-item-quantity">${item.quantity}x</span>
                </div>
            </div>
        `;
    });
    
    // Update the DOM
    orderContainer.innerHTML = itemsHtml;
    if (totalElement) totalElement.innerHTML = `<strong>₱${total.toFixed(2)}</strong>`;
}

/**
 * profile-dropdown.js - Handle profile dropdown menu
 */

document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profile-icon-btn');
    const dropdownMenu = document.getElementById('profile-dropdown-menu');
    
    if (profileBtn && dropdownMenu) {
        // Toggle dropdown on button click
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
        
        // Prevent dropdown from closing when clicking inside it
        dropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show confirmation dialog
            const confirmLogout = confirm('Are you sure you want to log out?');
            
            if (confirmLogout) {
                // Clear user session data
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('userData');
                
                // Optional: Clear cart if you want
                // localStorage.removeItem('cart');
                
                // Show logout message
                alert('You have been successfully logged out!');
                
                // Redirect to home page
                window.location.href = 'index.html';
            }
        });
    }
});
// ===== MAKE ALL FUNCTIONS GLOBAL =====
window.loadCheckoutData = loadCheckoutData;
window.loadOrderConfirmation = loadOrderConfirmation;
window.placeOrder = placeOrder;