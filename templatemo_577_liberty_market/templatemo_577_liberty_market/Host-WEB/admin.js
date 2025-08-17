// Product Management Functions
const productsManager = {
    async loadProducts() {
        try {
            const response = await fetch('/api/products');
            const products = await response.json();
            this.displayProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Failed to load products');
        }
    },

    displayProducts(products) {
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';

        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.image_url}" alt="${product.name}" style="width: 50px; height: 50px;"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>₹${product.price}</td>
                <td>₹${product.total_amount || product.price}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="productsManager.editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="productsManager.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    async addProduct(formData) {
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                $('#addProductModal').modal('hide');
                this.loadProducts(); // Reload products after adding
                alert('Product added successfully!');
            } else {
                alert('Failed to add product: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add product');
        }
    },

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                this.loadProducts(); // Reload products after deletion
                alert('Product deleted successfully!');
            } else {
                alert('Failed to delete product: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete product');
        }
    },

    async editProduct(id) {
        // Implement edit functionality
        // This will open a modal with product details for editing
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    productsManager.loadProducts();

    // Handle Add Product Form Submit
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        await productsManager.addProduct(formData);
    });
});