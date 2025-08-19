// Product Management Functions
let products = JSON.parse(localStorage.getItem('products') || '[]');

function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '';

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            </td>
            <td>${product.name}</td>
            <td>₹${product.price}</td>
            <td>₹${product.dailyEarning}</td>
            <td>${product.category}</td>
            <td>
                <span class="badge bg-${product.status === 'active' ? 'success' : 'danger'}">
                    ${product.status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Update products in localStorage and publish to website
    localStorage.setItem('products', JSON.stringify(products));
    publishProducts();
}

function showAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
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
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const productId = document.getElementById('productId').value;
    const imageFile = document.getElementById('productImage').files[0];
    
    // Convert image to base64
    let imageBase64 = '';
    if (imageFile) {
        imageBase64 = await convertImageToBase64(imageFile);
    }

    const productData = {
        id: productId || Date.now().toString(),
        name: document.getElementById('productName').value,
        price: Number(document.getElementById('productPrice').value),
        dailyEarning: Number(document.getElementById('productEarning').value),
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        status: document.getElementById('productStatus').value,
        image: imageBase64 || (productId ? products.find(p => p.id === productId)?.image : '')
    };

    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        // Add new product
        products.push(productData);
    }

    // Save and refresh
    localStorage.setItem('products', JSON.stringify(products));
    const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
    modal.hide();
    loadProducts();
    alert('Product saved successfully!');
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    products = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
    alert('Product deleted successfully!');
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
