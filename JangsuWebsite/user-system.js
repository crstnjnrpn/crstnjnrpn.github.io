/**
 * user-system.js - Handles user authentication, profile management, and product filtering
 */

// ===== SAMPLE ORDER DATA =====
var ordersData = [
    { reference: '#123654', date: 'May 19, 2025', pickup: 'May 19, 2025', status: 'pending', statusText: 'Pending', statusIcon: '☑️' },
    { reference: '#123632', date: 'May 19, 2025', pickup: 'May 19, 2025', status: 'confirmed', statusText: 'Confirmed', statusIcon: '✔️' },
    { reference: '#123667', date: 'May 19, 2025', pickup: 'May 19, 2025', status: 'ready', statusText: 'Ready For Pickup', statusIcon: '✅' },
    { reference: '#123600', date: 'May 19, 2025', pickup: 'May 19, 2025', status: 'completed', statusText: 'Completed', statusIcon: '☑️' },
    { reference: '#123638', date: 'May 19, 2025', pickup: 'May 19, 2025', status: 'cancelled', statusText: 'Cancelled', statusIcon: '❌' }
];

// ===== PRODUCT DATABASE =====
var productData = [
    { id: 1, name: "Milk Drink", price: 95.00, category: "drinks", image: "images/drinks.jpg", description: "Delicious and creamy milk drink" },
    { id: 2, name: "Spicy Ramen", price: 99.00, category: "noodles", image: "images/noodles.jpg", description: "Delicious spicy noodles" },
    { id: 3, name: "Pepero", price: 50.00, category: "snacks", image: "images/snacks.jpg", description: "Sweet chocolate biscuit sticks" },
    { id: 4, name: "Ice Cream", price: 45.00, category: "dessert", image: "images/ice-cream.jpg", description: "Creamy ice cream" },
    { id: 5, name: "Kimchi", price: 75.00, category: "food", image: "images/kimchi.jpg", description: "Authentic Korean kimchi" },
    { id: 6, name: "Strawberry Milk", price: 55.00, category: "drinks", image: "images/strawberry-drink.jpg", description: "Sweet strawberry milk" },
    { id: 7, name: "Topokki", price: 85.00, category: "noodles", image: "images/topokki.jpg", description: "Extra spicy topokki" },
    { id: 8, name: "Seaweed", price: 20.00, category: "snacks", image: "images/seaweed.jpg", description: "Salty and Savory Seaweed" }
];

// ===== USER SYSTEM INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('User system initializing');
    
    var isLoggedIn = isUserLoggedIn();
    var path = window.location.pathname;
    
    // Initialize based on page
    if (path.includes('products.html')) {
        initProductsPage();
    }
    if (path.includes('user-login.html')) {
        initLoginForm();
    }
    
    if (path.includes('user-signup.html')) {
        initSignupForm();
    }
    
    if (path.includes('user-profile.html')) {
        if (!isLoggedIn) {
            redirectToLogin('Please log in to view your profile');
            return;
        }
        loadUserProfileData();
        initProfileTabs();
        loadOrdersTable();
        initSearchAndFilter();
        initProfileLogout();
    }
    
    if (path.includes('order-detail.html') || path.includes('order-page.html')) {
        if (!isLoggedIn) {
            redirectToLogin('Please log in to view your orders');
            return;
        }
    }
    
    initProfileDropdown(isLoggedIn);
    updateProfileIcon();
    initProtectedActions();
});

// ===== USER DATA MANAGEMENT =====
function getCurrentUser() {
    var userData = localStorage.getItem('userData');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
        }
    }
    return null;
}

function isUserLoggedIn() {
    return localStorage.getItem('userLoggedIn') === 'true' && getCurrentUser() !== null;
}

function saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userLoggedIn', 'true');
    updateProfileIcon();
}

function clearUserData() {
    localStorage.removeItem('userData');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('redirectAfterLogin');
    updateProfileIcon();
}

// ===== REDIRECT HANDLING =====
function redirectToLogin(message) {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    if (message) {
        localStorage.setItem('loginMessage', message);
    }
    window.location.href = 'user-login.html';
}

function handlePostLoginRedirect() {
    var redirectUrl = localStorage.getItem('redirectAfterLogin');
    var message = localStorage.getItem('loginMessage');
    
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('loginMessage');
    
    if (message) {
        alert(message);
    }
    
    if (redirectUrl && redirectUrl !== '/user-login.html' && redirectUrl !== '/user-signup.html') {
        window.location.href = redirectUrl;
    } else {
        window.location.href = 'index.html';
    }
}

// ===== PROFILE DROPDOWN VISIBILITY =====
function updateProfileDropdownVisibility(isLoggedIn) {
    var dropdownToggle = document.getElementById('dropdown-toggle');
    var dropdownMenu = document.getElementById('dropdown-menu');
    
    if (dropdownToggle) {
        dropdownToggle.style.display = isLoggedIn ? 'flex' : 'none';
    }
    
    if (dropdownMenu) {
        dropdownMenu.classList.remove('show');
    }
    
    var profileLink = document.querySelector('.profile-icon-link');
    if (profileLink) {
        var newLink = profileLink.cloneNode(true);
        profileLink.parentNode.replaceChild(newLink, profileLink);
        
        if (isLoggedIn) {
            newLink.addEventListener('click', function(e) {
                window.location.href = 'user-profile.html';
            });
        } else {
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                redirectToLogin('Please sign up or log in to continue');
            });
        }
    }
}

// ===== PROTECTED ACTIONS =====
function initProtectedActions() {
    var viewOrderBtn = document.getElementById('view-order-btn');
    if (viewOrderBtn) {
        viewOrderBtn.addEventListener('click', function(e) {
            if (!isUserLoggedIn()) {
                e.preventDefault();
                redirectToLogin('Please log in or sign up to proceed to checkout');
                return false;
            }
            return true;
        });
    }
    
    var buyNowButtons = document.querySelectorAll('.buy-now-btn');
    for (var i = 0; i < buyNowButtons.length; i++) {
        buyNowButtons[i].addEventListener('click', function(e) {
            if (!isUserLoggedIn()) {
                e.preventDefault();
                redirectToLogin('Please log in or sign up to proceed with checkout');
                return false;
            }
            return true;
        });
    }
    
    var placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            if (!isUserLoggedIn()) {
                e.preventDefault();
                redirectToLogin('Please log in or sign up to place your order');
                return false;
            }
            return true;
        });
    }
}

// ===== PROFILE ICON MANAGEMENT =====
function updateProfileIcon() {
    var profileAvatars = document.querySelectorAll('.profile-avatar');
    var user = getCurrentUser();
    
    if (profileAvatars.length > 0) {
        var initials = '';
        if (user) {
            initials = user.initials || user.username.substring(0, 2).toUpperCase();
        }
        for (var i = 0; i < profileAvatars.length; i++) {
            profileAvatars[i].textContent = initials;
        }
    }
}

// ===== LOGIN FUNCTIONALITY =====
function initLoginForm() {
    var loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    var loginMessage = localStorage.getItem('loginMessage');
    if (loginMessage) {
        alert(loginMessage);
        localStorage.removeItem('loginMessage');
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        var userData = {
            username: username,
            name: username,
            initials: username.substring(0, 2).toUpperCase(),
            email: username + '@example.com',
            phone: '+1 (555) 123-4567'
        };
        
        saveUserData(userData);
        alert('Login successful! Welcome back ' + username);
        
        setTimeout(function() {
            handlePostLoginRedirect();
        }, 1000);
    });
}

// ===== SIGNUP FUNCTIONALITY =====
function initSignupForm() {
    var signupForm = document.getElementById('signup-form');
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var email = document.getElementById('email').value;
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        
        if (!email || !username || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        var userData = {
            email: email,
            username: username,
            name: username,
            initials: username.substring(0, 2).toUpperCase(),
            phone: '+1 (555) 123-4567'
        };
        
        saveUserData(userData);
        alert('Sign up successful! Welcome ' + username);
        
        setTimeout(function() {
            handlePostLoginRedirect();
        }, 1000);
    });
}

// ===== PROFILE PAGE FUNCTIONALITY =====
function loadUserProfileData() {
    var user = getCurrentUser();
    if (!user) {
        redirectToLogin('Please log in to view your profile');
        return;
    }
    
    var profileName = document.getElementById('profile-name');
    var profileEmail = document.getElementById('profile-email');
    var profilePhone = document.getElementById('profile-phone');
    
    if (profileName) profileName.textContent = user.name || user.username;
    if (profileEmail) profileEmail.textContent = user.email || 'user@example.com';
    if (profilePhone) profilePhone.textContent = user.phone || '+1 (555) 123-4567';
}

// ===== PROFILE LOGOUT FUNCTIONALITY =====
function initProfileLogout() {
    var logoutBtn = document.getElementById('profile-logout-btn');
    
    if (logoutBtn) {
        var newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var confirmLogout = confirm('Are you sure you want to log out?');
            if (confirmLogout) {
                localStorage.removeItem('userData');
                localStorage.removeItem('userLoggedIn');
                localStorage.removeItem('redirectAfterLogin');
                alert('You have been successfully logged out!');
                window.location.href = 'index.html';
            }
        });
    }
}

// ===== PROFILE TABS =====
function initProfileTabs() {
    var tabs = document.querySelectorAll('.tab-btn');
    var contents = document.querySelectorAll('.tab-content');
    
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function() {
            var tabId = this.getAttribute('data-tab');
            
            for (var j = 0; j < tabs.length; j++) {
                tabs[j].classList.remove('active');
            }
            for (var k = 0; k < contents.length; k++) {
                contents[k].classList.remove('active');
            }
            
            this.classList.add('active');
            var activeContent = document.getElementById(tabId + '-tab');
            if (activeContent) {
                activeContent.classList.add('active');
            }
            
            if (tabId === 'orders') {
                loadOrdersTable();
            }
        });
    }
}

// ===== ORDERS TABLE =====
function loadOrdersTable(filter) {
    if (filter === undefined) filter = 'all';
    
    var tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    var filteredOrders = ordersData;
    if (filter !== 'all') {
        filteredOrders = [];
        for (var i = 0; i < ordersData.length; i++) {
            if (ordersData[i].status === filter) {
                filteredOrders.push(ordersData[i]);
            }
        }
    }
    
    var html = '';
    for (var i = 0; i < filteredOrders.length; i++) {
        var order = filteredOrders[i];
        html += '<tr>';
        html += '<td>' + order.reference + '</td>';
        html += '<td>' + order.date + '</td>';
        html += '<td>' + order.pickup + '</td>';
        html += '<td><span class="status-badge status-' + order.status + '">' + order.statusIcon + ' ' + order.statusText + '</span></td>';
        html += '<td><a href="order-detail.html?ref=' + order.reference + '" class="view-details-link">View Details</a></td>';
        html += '</tr>';
    }
    
    if (filteredOrders.length === 0) {
        html = '<tr><td colspan="5" class="no-orders">No orders found</td></tr>';
    }
    
    tbody.innerHTML = html;
}

function initSearchAndFilter() {
    var searchInput = document.getElementById('order-search');
    var filterSelect = document.getElementById('order-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            var filter = filterSelect ? filterSelect.value : 'all';
            filterAndSearchOrders(filter, searchInput.value.toLowerCase());
        });
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
            filterAndSearchOrders(filterSelect.value, searchTerm);
        });
    }
}

function filterAndSearchOrders(filter, searchTerm) {
    var filteredOrders = ordersData;
    
    if (filter !== 'all') {
        filteredOrders = [];
        for (var i = 0; i < ordersData.length; i++) {
            if (ordersData[i].status === filter) {
                filteredOrders.push(ordersData[i]);
            }
        }
    }
    
    if (searchTerm) {
        var searchedOrders = [];
        for (var i = 0; i < filteredOrders.length; i++) {
            if (filteredOrders[i].reference.toLowerCase().includes(searchTerm)) {
                searchedOrders.push(filteredOrders[i]);
            }
        }
        filteredOrders = searchedOrders;
    }
    
    var tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    var html = '';
    for (var i = 0; i < filteredOrders.length; i++) {
        var order = filteredOrders[i];
        html += '<tr>';
        html += '<td>' + order.reference + '</td>';
        html += '<td>' + order.date + '</td>';
        html += '<td>' + order.pickup + '</td>';
        html += '<td><span class="status-badge status-' + order.status + '">' + order.statusIcon + ' ' + order.statusText + '</span></td>';
        html += '<td><a href="order-detail.html?ref=' + order.reference + '" class="view-details-link">View Details</a></td>';
        html += '</tr>';
    }
    
    if (filteredOrders.length === 0) {
        html = '<tr><td colspan="5" class="no-orders">No orders found<\/td><\/tr>';
    }
    
    tbody.innerHTML = html;
}

// ===== PRODUCTS PAGE FUNCTIONALITY =====
function renderProducts(category) {
    var container = document.getElementById('products-container');
    if (!container) return;
    
    var filteredProducts = productData;
    
    if (category !== 'all') {
        filteredProducts = [];
        for (var i = 0; i < productData.length; i++) {
            if (productData[i].category === category) {
                filteredProducts.push(productData[i]);
            }
        }
    }
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="no-products">No products found in this category.</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < filteredProducts.length; i++) {
        var product = filteredProducts[i];
        html += '<div class="product-card" onclick="location.href=\'order.html?product=' + product.id + '\';">';
        html += '<img src="' + product.image + '" alt="' + product.name + '" onerror="this.src=\'images/default.jpg\'">';
        html += '<h3>' + product.name + '</h3>';
        html += '<p class="price">₱' + product.price.toFixed(2) + '</p>';
        // VIEW PRODUCT button - redirects to order page
        html += '<button class="btn-small view-product" onclick="event.stopPropagation(); location.href=\'order.html?product=' + product.id + '\'">View Product</button>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

function getCategoryFromUrl() {
    var urlParams = new URLSearchParams(window.location.search);
    var category = urlParams.get('category');
    return category || 'all';
}

function initProductsPage() {
    var categorySelect = document.getElementById('category');
    var urlCategory = getCategoryFromUrl();
    
    if (categorySelect && urlCategory !== 'all') {
        categorySelect.value = urlCategory;
    }
    
    renderProducts(urlCategory);
    
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            var selectedCategory = this.value;
            var newUrl = new URL(window.location);
            newUrl.searchParams.set('category', selectedCategory);
            window.history.pushState({}, '', newUrl);
            renderProducts(selectedCategory);
        });
    }
}

// ===== PROFILE DROPDOWN =====
function initProfileDropdown(isLoggedIn) {
    var dropdownToggle = document.getElementById('dropdown-toggle');
    var dropdownMenu = document.getElementById('dropdown-menu');
    
    if (!isLoggedIn) {
        if (dropdownToggle) dropdownToggle.style.display = 'none';
        if (dropdownMenu) dropdownMenu.classList.remove('show');
        return;
    }
    
    if (dropdownToggle) {
        dropdownToggle.style.display = 'flex';
        
        var newToggle = dropdownToggle.cloneNode(true);
        dropdownToggle.parentNode.replaceChild(newToggle, dropdownToggle);
        
        newToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            var menu = document.getElementById('dropdown-menu');
            if (menu) menu.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            var toggle = document.getElementById('dropdown-toggle');
            var menu = document.getElementById('dropdown-menu');
            if (toggle && menu && !toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('show');
            }
        });
    }
    
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        var newBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                clearUserData();
                alert('You have been successfully logged out!');
                window.location.href = 'index.html';
            }
        });
    }
}

// ===== EXPOSE FUNCTIONS =====
window.isUserLoggedIn = isUserLoggedIn;
window.handleLogout = function() {
    if (confirm('Are you sure you want to log out?')) {
        clearUserData();
        alert('You have been successfully logged out!');
        window.location.href = 'index.html';
    }
};