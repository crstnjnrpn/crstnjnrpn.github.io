// ===== admin-system.js =====
// Complete Admin System - Products Management with Edit navigation to separate page

(function() {
    'use strict';

    // ===== DEFAULT PRODUCTS DATA =====
    const DEFAULT_PRODUCTS = [
        { id: 1, name: "Shin Ramen Bundle", category: "Ramen", price: 420.00, currentStock: 25, reservedStock: 12, status: "Active", lowStockThreshold: 5, image: null, createdAt: new Date().toISOString() },
        { id: 2, name: "Buldak Spicy Ramen", category: "Ramen", price: 198.00, currentStock: 18, reservedStock: 5, status: "Active", lowStockThreshold: 5, image: null, createdAt: new Date().toISOString() },
        { id: 3, name: "Pepero Chocolate", category: "Snacks", price: 85.00, currentStock: 42, reservedStock: 8, status: "Active", lowStockThreshold: 10, image: null, createdAt: new Date().toISOString() },
        { id: 4, name: "Milk Drink (Limited)", category: "Drinks", price: 95.00, currentStock: 0, reservedStock: 0, status: "Inactive", lowStockThreshold: 5, image: null, createdAt: new Date().toISOString() }
    ];

    // ===== HELPER FUNCTIONS =====
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    // ===== PRODUCT STORAGE FUNCTIONS =====
    function getProducts() {
        const stored = localStorage.getItem('adminProducts');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch(e) {
                console.warn("Failed to parse stored products", e);
            }
        }
        // Initialize localStorage with defaults
        localStorage.setItem('adminProducts', JSON.stringify(DEFAULT_PRODUCTS));
        return [...DEFAULT_PRODUCTS];
    }

    function saveProducts(products) {
        localStorage.setItem('adminProducts', JSON.stringify(products));
    }

    // ===== TOAST NOTIFICATION =====
    function showToast(message, type = 'success') {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    // ===== RENDER PRODUCT TABLE WITH ACTIONS =====
    function renderProductTableWithActions() {
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;
        
        const products = getProducts();
        
        if (!products || products.length === 0) {
            tableBody.innerHTML = `<div class="empty-table-message" style="text-align:center; padding:40px;">No products available. Click "Add Product" to create one.</div>`;
            return;
        }
        
        let html = '';
        products.forEach(product => {
            const prodName = escapeHtml(product.name || 'Unnamed');
            const category = escapeHtml(product.category || 'General');
            const priceVal = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || 0).toFixed(2);
            const currentStock = product.currentStock !== undefined ? product.currentStock : 0;
            const reservedStock = product.reservedStock !== undefined ? product.reservedStock : 0;
            const status = (product.status === 'Active' || product.status === 'active') ? 'Active' : 'Inactive';
            const statusClass = status === 'Active' ? 'active' : 'inactive';
            
            const lowStockThreshold = product.lowStockThreshold || 5;
            const stockBadgeClass = currentStock <= lowStockThreshold ? 'low' : 'normal';
            
            html += `
                <div class="table-row data-row" data-product-id="${product.id}">
                    <div class="table-cell product-image-col" data-label="Product Image">
                        <div class="product-image-sample">${product.image ? '🖼️' : '📦'} ${product.image ? 'Image' : 'Sample'}</div>
                    </div>
                    <div class="table-cell product-name-col" data-label="Product Name">${prodName}</div>
                    <div class="table-cell category-col" data-label="Category">${category}</div>
                    <div class="table-cell price-col" data-label="Price">₱ ${priceVal}</div>
                    <div class="table-cell stock-col" data-label="Current Stock">
                        <span class="stock-badge ${stockBadgeClass}">${currentStock} ${currentStock <= lowStockThreshold ? '⚠️' : ''}</span>
                    </div>
                    <div class="table-cell reserved-col" data-label="Reserved Stock">${reservedStock}</div>
                    <div class="table-cell status-col" data-label="Status">
                        <span class="status-badge ${statusClass}">${status}</span>
                    </div>
                    <div class="table-cell actions-col" data-label="Actions">
                        <div class="action-buttons-cell">
                            <button class="edit-btn" onclick="window.location.href='edit-product.html?id=${product.id}'">✏️ Edit</button>
                            <button class="delete-btn" onclick="window.openDeleteModal(${product.id}, '${prodName.replace(/'/g, "\\'")}')">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        tableBody.innerHTML = html;
    }
    

    // ===== DELETE MODAL FUNCTIONS =====
    let currentDeleteProductId = null;
    let currentDeleteProductName = null;

    function openDeleteModal(productId, productName) {
        currentDeleteProductId = productId;
        currentDeleteProductName = productName;
        
        const deleteModal = document.getElementById('deleteModal');
        const deleteProductNameSpan = document.getElementById('deleteProductName');
        
        if (deleteModal && deleteProductNameSpan) {
            deleteProductNameSpan.textContent = productName;
            deleteModal.classList.add('active');
        }
    }

    function closeDeleteModal() {
        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.classList.remove('active');
        }
        currentDeleteProductId = null;
        currentDeleteProductName = null;
    }

    function confirmDelete() {
        if (currentDeleteProductId) {
            const products = getProducts();
            const productToDelete = products.find(p => p.id === currentDeleteProductId);
            const productName = productToDelete ? productToDelete.name : 'Product';
            
            const newProducts = products.filter(p => p.id !== currentDeleteProductId);
            saveProducts(newProducts);
            renderProductTableWithActions();
            closeDeleteModal();
            showToast(`🗑️ "${productName}" has been deleted.`, 'success');
        }
    }

    // ===== ADD PRODUCT PAGE FUNCTIONS =====
    function initImageUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('product-image');
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        const removeImageBtn = document.getElementById('remove-image');
        
        if (!uploadArea) return;
        
        uploadArea.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
        
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    if (!file.type.match('image.*')) {
                        showToast('Please select an image file (PNG, JPG, JPEG)', 'error');
                        return;
                    }
                    
                    if (file.size > 2 * 1024 * 1024) {
                        showToast('Image size should be less than 2MB', 'error');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (previewImg) previewImg.src = event.target.result;
                        if (uploadArea) uploadArea.style.display = 'none';
                        if (imagePreview) imagePreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (fileInput) fileInput.value = '';
                if (uploadArea) uploadArea.style.display = 'block';
                if (imagePreview) imagePreview.style.display = 'none';
            });
        }
    }

    function initAddProductForm() {
        const form = document.getElementById('add-product-form');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productName = document.getElementById('product-name')?.value.trim();
            const productPrice = document.getElementById('product-price')?.value;
            const stockQuantity = document.getElementById('stock-quantity')?.value;
            const lowStockThreshold = document.getElementById('low-stock-threshold')?.value;
            const productCategory = document.getElementById('product-category')?.value;
            
            if (!productName) {
                showToast('Please enter product name', 'error');
                return;
            }
            
            if (!productPrice || parseFloat(productPrice) < 0) {
                showToast('Please enter a valid price', 'error');
                return;
            }
            
            if (!stockQuantity || parseInt(stockQuantity) < 0) {
                showToast('Please enter valid stock quantity', 'error');
                return;
            }
            
            if (!lowStockThreshold || parseInt(lowStockThreshold) < 0) {
                showToast('Please enter low stock threshold', 'error');
                return;
            }
            
            if (!productCategory) {
                showToast('Please select a category', 'error');
                return;
            }
            
            let products = getProducts();
            
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            
            let productImage = null;
            const previewImg = document.getElementById('preview-img');
            if (previewImg && previewImg.src && previewImg.src !== '#') {
                productImage = previewImg.src;
            }
            
            const newProduct = {
                id: newId,
                name: productName,
                price: parseFloat(productPrice),
                category: productCategory,
                currentStock: parseInt(stockQuantity),
                reservedStock: 0,
                status: parseInt(stockQuantity) > 0 ? 'Active' : 'Inactive',
                lowStockThreshold: parseInt(lowStockThreshold),
                image: productImage,
                createdAt: new Date().toISOString()
            };
            
            products.push(newProduct);
            saveProducts(products);
            
            showToast(`✅ Product "${productName}" has been added successfully!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'admin-product.html';
            }, 1500);
        });
    }

    // ===== EDIT PRODUCT PAGE FUNCTIONS =====
    function initEditProductPage() {
        // Only run this function if we're on the edit product page
        if (!document.getElementById('edit-product-form')) return;
        
        // Get product ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        // Check if productId exists and is valid
        if (!productId) {
            console.log('No product ID found in URL');
            showToast('No product specified. Redirecting...', 'error');
            setTimeout(() => {
                window.location.href = 'admin-product.html';
            }, 2000);
            return;
        }
        
        // Validate that productId is a number
        const parsedId = parseInt(productId);
        if (isNaN(parsedId)) {
            showToast('Invalid product ID', 'error');
            setTimeout(() => {
                window.location.href = 'admin-product.html';
            }, 2000);
            return;
        }
        
        loadProductData(parsedId);
        initEditImageUpload();
        
        // Setup form submission
        const form = document.getElementById('edit-product-form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProductChanges(parsedId);
            });
        }
    }
    
    function loadProductData(productId) {
        const products = getProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showToast('Product not found. Redirecting...', 'error');
            setTimeout(() => {
                window.location.href = 'admin-product.html';
            }, 2000);
            return;
        }
        
        // Populate form fields
        const productIdField = document.getElementById('product-id');
        const productNameField = document.getElementById('product-name');
        const productPriceField = document.getElementById('product-price');
        const stockQuantityField = document.getElementById('stock-quantity');
        const reservedStockField = document.getElementById('reserved-stock');
        const lowStockThresholdField = document.getElementById('low-stock-threshold');
        const productCategoryField = document.getElementById('product-category');
        
        if (productIdField) productIdField.value = product.id;
        if (productNameField) productNameField.value = product.name || '';
        if (productPriceField) productPriceField.value = product.price || 0;
        if (stockQuantityField) stockQuantityField.value = product.currentStock || 0;
        if (reservedStockField) reservedStockField.value = product.reservedStock || 0;
        if (lowStockThresholdField) lowStockThresholdField.value = product.lowStockThreshold || 5;
        if (productCategoryField) productCategoryField.value = product.category || 'Other';
        
        // Set status radio button
        const statusValue = (product.status === 'Active' || product.status === 'active') ? 'Active' : 'Inactive';
        const statusRadios = document.querySelectorAll('input[name="status"]');
        statusRadios.forEach(radio => {
            if (radio.value === statusValue) {
                radio.checked = true;
                const parentLabel = radio.closest('.status-option');
                if (parentLabel) {
                    parentLabel.classList.add('selected');
                }
            }
        });
        
        // Add click handlers for status options
        document.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.status-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
            });
        });
        
        // Display current image if exists
        if (product.image) {
            const currentImagePreview = document.getElementById('current-image-preview');
            if (currentImagePreview) {
                currentImagePreview.innerHTML = `<img src="${product.image}" alt="Current product image">`;
            }
        }
    }
    
    function initEditImageUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('product-image');
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        const removeImageBtn = document.getElementById('remove-image');
        
        if (!uploadArea) return;
        
        uploadArea.addEventListener('click', function() {
            if (fileInput) fileInput.click();
        });
        
        if (fileInput) {
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    if (!file.type.match('image.*')) {
                        showToast('Please select an image file (PNG, JPG, JPEG)', 'error');
                        return;
                    }
                    
                    if (file.size > 2 * 1024 * 1024) {
                        showToast('Image size should be less than 2MB', 'error');
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (previewImg) previewImg.src = event.target.result;
                        if (uploadArea) uploadArea.style.display = 'none';
                        if (imagePreview) imagePreview.style.display = 'block';
                        window.newImageSelected = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (fileInput) fileInput.value = '';
                if (uploadArea) uploadArea.style.display = 'block';
                if (imagePreview) imagePreview.style.display = 'none';
                window.newImageSelected = null;
            });
        }
    }
    
    function saveProductChanges(productId) {
        const productName = document.getElementById('product-name')?.value.trim();
        const productPrice = parseFloat(document.getElementById('product-price')?.value);
        const stockQuantity = parseInt(document.getElementById('stock-quantity')?.value);
        const reservedStock = parseInt(document.getElementById('reserved-stock')?.value || 0);
        const lowStockThreshold = parseInt(document.getElementById('low-stock-threshold')?.value);
        const productCategory = document.getElementById('product-category')?.value;
        
        let status = 'Inactive';
        const statusRadios = document.querySelectorAll('input[name="status"]');
        statusRadios.forEach(radio => {
            if (radio.checked) {
                status = radio.value;
            }
        });
        
        // Validation
        if (!productName) {
            showToast('Please enter product name', 'error');
            return;
        }
        
        if (isNaN(productPrice) || productPrice < 0) {
            showToast('Please enter a valid price', 'error');
            return;
        }
        
        if (isNaN(stockQuantity) || stockQuantity < 0) {
            showToast('Please enter valid stock quantity', 'error');
            return;
        }
        
        if (!productCategory) {
            showToast('Please select a category', 'error');
            return;
        }
        
        let finalStatus = status;
        if (status === 'Active' && stockQuantity === 0) {
            finalStatus = 'Inactive';
            showToast('Stock is 0, status automatically set to Inactive', 'error');
        }
        
        let products = getProducts();
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            showToast('Product not found', 'error');
            return;
        }
        
        let productImage = products[productIndex].image;
        if (window.newImageSelected) {
            productImage = window.newImageSelected;
        }
        
        products[productIndex] = {
            ...products[productIndex],
            name: productName,
            price: productPrice,
            category: productCategory,
            currentStock: stockQuantity,
            reservedStock: reservedStock,
            status: finalStatus,
            lowStockThreshold: lowStockThreshold,
            image: productImage,
            updatedAt: new Date().toISOString()
        };
        
        saveProducts(products);
        showToast(`✅ Product "${productName}" updated successfully!`, 'success');
        
        setTimeout(() => {
            window.location.href = 'admin-product.html';
        }, 1500);
    }

    // ===== INITIALIZE PAGES =====
    function initProductManagementPage() {
        if (!document.getElementById('productsTableBody')) return;
        
        getProducts();
        renderProductTableWithActions();
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            const deleteModal = document.getElementById('deleteModal');
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        });
    }

    function initAddProductPage() {
        if (document.getElementById('add-product-form')) {
            initImageUpload();
            initAddProductForm();
        }
    }

    // ===== STORAGE SYNC =====
    function initStorageSync() {
        window.addEventListener('storage', function(event) {
            if (event.key === 'adminProducts' && document.getElementById('productsTableBody')) {
                renderProductTableWithActions();
            }
        });
    }

    // ===== EXPORT GLOBAL FUNCTIONS =====
    window.getProducts = getProducts;
    window.saveProducts = saveProducts;
    window.showToast = showToast;
    window.renderProductTableWithActions = renderProductTableWithActions;
    window.openDeleteModal = openDeleteModal;
    window.closeDeleteModal = closeDeleteModal;
    window.confirmDelete = confirmDelete;
    window.initProductManagementPage = initProductManagementPage;
    window.initAddProductPage = initAddProductPage;
    window.initEditProductPage = initEditProductPage;

    // ===== AUTO-INITIALIZE ON PAGE LOAD =====
    document.addEventListener('DOMContentLoaded', function() {
        initProductManagementPage();
        initAddProductPage();
        initEditProductPage();  // This will only run on edit-product.html
        initStorageSync();
    });
})();