// Product Management Functions
let products = []; // Will be populated from API
let adminToken = localStorage.getItem('adminToken');

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!adminToken) {
        window.location.href = 'admin_Login_page.html';
        return;
    }
    loadProducts();
    setupImagePreview();
});

async function loadProducts() {
    try {
        const response = await fetch('https://investloom7x.onrender.com/api/admin/products', {
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'x-admin-secret': localStorage.getItem('adminSecret')
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        products = data.products;
        
        const productsContainer = document.getElementById('productsList');
        if (!productsContainer) return;

        productsContainer.innerHTML = products.length === 0 ? getEmptyProductsTemplate() : 
            products.map(product => getProductCardTemplate(product)).join('');

    } catch (error) {
        console.error('Failed to load products:', error);
        showToast('error', 'Failed to load products: ' + error.message);
    }
}


function setupImagePreview() {
    const imageInput = document.getElementById('productImage');
    if (!imageInput) return;

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                preview.src = e.target.result;
                preview.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        }
    });
}

function getEmptyProductsTemplate() {
    return `
        <div class="text-center p-5">
            <i class="bi bi-box-seam" style="font-size: 4rem; color: #ccc;"></i>
            <h3 class="mt-3">No products available</h3>
            <p class="text-muted">Click "Add New Product" to create your first product</p>
        </div>
    `;
}

function getProductCardTemplate(product) {
    return `
        <div class="card">
            <div class="card-img-container">
                <img src="${product.image}" class="card-img-top" alt="${product.name}" 
                     onerror="this.src='../assets/images/placeholder.jpg'">
            </div>
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <div class="category-badge">${product.category}</div>
                <div class="price-info">
                    <div class="total-price">
                        <span class="label">Total Price:</span>
                        <span class="amount">₹${product.price}</span>
                    </div>
                    <div class="daily-earning">
                        <span class="label">Daily Earning:</span>
                        <span class="amount">₹${product.dailyEarning}</span>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                </div>
            </div>
        </div>
    `;
}

// Save new product
async function saveProduct() {
    try {
        const formData = new FormData();
        const imageFile = document.getElementById('productImage').files[0];
        const productName = document.getElementById('productName').value;
        const productCategory = document.getElementById('productCategory').value;
        const productPricePerDay = document.getElementById('productPricePerDay').value;
        const productTotalAmount = document.getElementById('productTotalAmount').value;

        if (!imageFile || !productName || !productCategory || !productPricePerDay || !productTotalAmount) {
            showToast('error', 'Please fill all fields');
            return;
        }

        formData.append('image', imageFile);
        formData.append('name', productName);
        formData.append('category', productCategory);
        formData.append('dailyEarning', productPricePerDay);
        formData.append('price', productTotalAmount);

        const response = await fetch('https://investloom7x.onrender.com/api/admin/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'x-admin-secret': localStorage.getItem('adminSecret')
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to save product');

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        document.getElementById('addProductForm').reset();
        document.getElementById('imagePreview').classList.add('d-none');

        // Reload products
        loadProducts();
        showToast('success', 'Product added successfully');
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('error', 'Failed to save product');
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`https://investloom7x.onrender.com/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'x-admin-secret': localStorage.getItem('adminSecret')
            }
        });

        if (!response.ok) throw new Error('Failed to delete product');

        loadProducts();
        showToast('success', 'Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('error', 'Failed to delete product');
    }
}

// Toast notification
function showToast(type, message) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

function editProduct(productId) {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productEarning').value = product.dailyEarning;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productStatus').value = product.status;

    // Show existing image
    document.getElementById('imagePreview').innerHTML = `
        <img src="${product.image}" alt="Preview" style="max-width: 200px; margin-top: 10px;">
    `;

    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

async function saveProduct() {
    try {
        const formData = new FormData();
        const imageFile = document.getElementById('productImage').files[0];
        const productName = document.getElementById('productName').value;
        const productCategory = document.getElementById('productCategory').value;
        const productPricePerDay = document.getElementById('productPricePerDay').value;
        const productTotalAmount = document.getElementById('productTotalAmount').value;

        if (!imageFile || !productName || !productCategory || !productPricePerDay || !productTotalAmount) {
            showToast('error', 'Please fill all fields');
            return;
        }

        formData.append('image', imageFile);
        formData.append('name', productName);
        formData.append('category', productCategory);
        formData.append('dailyEarning', productPricePerDay);
        formData.append('price', productTotalAmount);

        const response = await fetch('https://investloom7x.onrender.com/api/admin/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'x-admin-secret': localStorage.getItem('adminSecret')
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to save product');

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        document.getElementById('addProductForm').reset();
        document.getElementById('imagePreview').classList.add('d-none');

        // Reload products
        loadProducts();
        showToast('success', 'Product added successfully');
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('error', 'Failed to save product');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`https://investloom7x.onrender.com/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'x-admin-secret': localStorage.getItem('adminSecret')
            }
        });

        if (!response.ok) throw new Error('Failed to delete product');

        loadProducts();
        showToast('success', 'Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('error', 'Failed to delete product');
    }
}

// Toast notification
function showToast(type, message) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}
    

        if (!response.ok) {
            throw new Error('Failed to add product');
        }

        // Refresh product list
        await loadAdminProducts();
        
        // Show success message
        showAlert('Product added successfully', 'success');
        catch (error) {
        console.error('Error adding product:', error);
        showAlert('Failed to add product', 'error');
    }


// Add this function to handle product status toggle
async function toggleProductStatus(productId, isActive) {
    try {
        const response = await fetch(`/api/products/${productId}/toggle`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ isActive })
        });

        if (!response.ok) {
            throw new Error('Failed to update product status');
        }

        // Refresh product list
        await loadAdminProducts();
        
        showAlert('Product status updated successfully', 'success');
    } catch (error) {
        console.error('Error updating product status:', error);
        showAlert('Failed to update product status', 'error');
    }
}

// Helper function to convert image to base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Function to publish products to website
function publishProducts() {
    // Filter only active products
    const activeProducts = products.filter(p => p.status === 'active');
    
    // Save to a separate key for the main website
    localStorage.setItem('publishedProducts', JSON.stringify(activeProducts));
}

// Image preview
document.getElementById('productImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 200px; margin-top: 10px;">
            `;
        }
        reader.readAsDataURL(file);
    }
});

// Load products on page load
document.addEventListener('DOMContentLoaded', loadProducts);

async function saveProductToServer(product) {
  // product contains name, price, dailyEarning, category, image (base64 or url), description, status
  const url = product.id ? '/api/products/' + product.id : '/api/products';
  const method = product.id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Product save failed');
  return res.json();
}
async function deleteProductFromServer(id) {
  const res = await fetch('/api/products/' + id, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}
