// Add these functions after your existing JavaScript

function saveDiscoverItem() {
    const form = document.getElementById('addDiscoverItemForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const reader = new FileReader();
    const imageFile = document.getElementById('discoverItemImage').files[0];

    reader.onload = function(e) {
        const newItem = {
            id: Date.now(),
            image: e.target.result,
            name: document.getElementById('discoverItemName').value,
            currentBid: document.getElementById('discoverItemBid').value,
            endDate: document.getElementById('discoverItemEndDate').value
        };

        // Save to localStorage
        let discoverItems = JSON.parse(localStorage.getItem('discoverItems') || '[]');
        discoverItems.push(newItem);
        localStorage.setItem('discoverItems', JSON.stringify(discoverItems));

        // Reset form and close modal
        form.reset();
        document.getElementById('discoverImagePreview').classList.add('d-none');
        bootstrap.Modal.getInstance(document.getElementById('addDiscoverItemModal')).hide();

        // Refresh items table
        loadDiscoverItems();
    };

    if (imageFile) {
        reader.readAsDataURL(imageFile);
    }
}

function loadDiscoverItems() {
    const items = JSON.parse(localStorage.getItem('discoverItems') || '[]');
    const tbody = document.getElementById('discoverItemsTableBody');
    
    if (!tbody) return;

    tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.id}</td>
            <td><img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
            <td>${item.name}</td>
            <td>${item.currentBid} ETH</td>
            <td>${item.endDate}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick='editDiscoverItem(${JSON.stringify(item)})'>
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteDiscoverItem(${item.id})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function editDiscoverItem(item) {
    // Similar to your existing edit function but for discover items
    const modal = new bootstrap.Modal(document.getElementById('editDiscoverItemModal'));
    document.getElementById('editDiscoverItemId').value = item.id;
    document.getElementById('editDiscoverItemName').value = item.name;
    document.getElementById('editDiscoverItemBid').value = item.currentBid;
    document.getElementById('editDiscoverItemEndDate').value = item.endDate;
    document.getElementById('editDiscoverImagePreview').src = item.image;
    modal.show();
}

function deleteDiscoverItem(id) {
    if (confirm('Are you sure you want to delete this discover item?')) {
        let items = JSON.parse(localStorage.getItem('discoverItems') || '[]');
        items = items.filter(item => item.id != id);
        localStorage.setItem('discoverItems', JSON.stringify(items));
        loadDiscoverItems();
        
        // Refresh explore page if open
        window.opener?.location.reload();
    }
}

// Add image preview for discover items
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('discoverItemImage')?.addEventListener('change', function(e) {
        const preview = document.getElementById('discoverImagePreview');
        preview.src = URL.createObjectURL(e.target.files[0]);
        preview.classList.remove('d-none');
    });
});

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const tbody = document.getElementById('productTableBody');
    
    if (!tbody) return;

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.price}/day</td>
            <td>₹${product.total}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick='openEditModal(${JSON.stringify(product)})'>
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}