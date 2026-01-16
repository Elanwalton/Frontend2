<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Hero Banners - Sunleaf Tech</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }

        .container {
            max-width: 1600px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #081e31 0%, #0a2540 100%);
            color: white;
            padding: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .header h1 {
            font-size: 2rem;
            font-weight: 700;
        }

        .header-info {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.95rem;
        }

        .btn-primary {
            background: #10b981;
            color: white;
        }

        .btn-primary:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-secondary {
            background: #6366f1;
            color: white;
        }

        .btn-secondary:hover {
            background: #4f46e5;
        }

        .btn-danger {
            background: #ef4444;
            color: white;
        }

        .btn-danger:hover {
            background: #dc2626;
        }

        .btn-warning {
            background: #f59e0b;
            color: white;
        }

        .btn-warning:hover {
            background: #d97706;
        }

        .content {
            padding: 2rem;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .section-divider {
            margin: 2rem 0;
            border: none;
            height: 2px;
            background: linear-gradient(90deg, #f7c843, transparent);
        }

        .banners-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
            margin-top: 1.5rem;
        }

        .banner-card {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .banner-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            border-color: #6366f1;
        }

        .banner-image {
            width: 100%;
            height: 180px;
            object-fit: cover;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .banner-content {
            padding: 1.5rem;
        }

        .banner-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }

        .banner-subtitle {
            color: #6b7280;
            font-size: 0.875rem;
            margin-bottom: 1rem;
            line-height: 1.5;
        }

        .banner-meta {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge-active {
            background: #d1fae5;
            color: #065f46;
        }

        .badge-inactive {
            background: #fee2e2;
            color: #991b1b;
        }

        .badge-main {
            background: #dbeafe;
            color: #1e40af;
        }

        .badge-side {
            background: #fef3c7;
            color: #92400e;
        }

        .badge-order {
            background: #e0e7ff;
            color: #3730a3;
        }

        .banner-actions {
            display: flex;
            gap: 0.5rem;
        }

        .banner-actions button {
            flex: 1;
            padding: 0.5rem;
            font-size: 0.85rem;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .modal.active {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 2rem;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .modal-header h2 {
            font-size: 1.5rem;
            color: #1f2937;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }

        .close-btn:hover {
            color: #1f2937;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #374151;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #6366f1;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }

        .file-upload {
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .file-upload:hover {
            border-color: #6366f1;
            background: #f9fafb;
        }

        .file-upload.dragover {
            border-color: #10b981;
            background: #ecfdf5;
        }

        .preview-image {
            max-width: 100%;
            max-height: 200px;
            margin-top: 1rem;
            border-radius: 8px;
        }

        .loading {
            text-align: center;
            padding: 3rem;
            color: #6b7280;
        }

        .spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #6b7280;
        }

        .info-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 1rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
        }

        .info-box p {
            margin: 0.5rem 0;
            font-size: 0.9rem;
            color: #1e40af;
        }

        @media (max-width: 768px) {
            .banners-grid {
                grid-template-columns: 1fr;
            }

            .header {
                flex-direction: column;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>🎨 Hero Banners Manager</h1>
                <div class="header-info">Manage main carousel and side banners</div>
            </div>
            <button class="btn btn-primary" onclick="openModal()">+ Add New Banner</button>
        </div>

        <div class="content">
            <div class="info-box">
                <p><strong>📐 Layout Guide:</strong></p>
                <p>• <strong>Main Banner:</strong> Large carousel on the left (desktop) or top (mobile)</p>
                <p>• <strong>Side Banners:</strong> 4 smaller banners on the right (desktop) or below (mobile)</p>
                <p>• Recommended: 1-3 main banners for carousel, exactly 4 side banners</p>
            </div>

            <div id="loading" class="loading">
                <div class="spinner"></div>
                <p>Loading banners...</p>
            </div>

            <!-- Main Banners Section -->
            <div id="mainSection" style="display: none;">
                <h2 class="section-title">🎯 Main Carousel Banners</h2>
                <div id="mainBannersContainer" class="banners-grid"></div>
            </div>

            <hr class="section-divider">

            <!-- Side Banners Section -->
            <div id="sideSection" style="display: none;">
                <h2 class="section-title">📦 Side Banners (Max 4)</h2>
                <div id="sideBannersContainer" class="banners-grid"></div>
            </div>

            <div id="emptyState" class="empty-state" style="display: none;">
                <h3>No banners yet</h3>
                <p>Create your first banner to get started</p>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div id="modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Add New Banner</h2>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>

            <form id="bannerForm" onsubmit="handleSubmit(event)">
                <input type="hidden" id="bannerId" name="id">

                <div class="form-group">
                    <label>Banner Image *</label>
                    <div class="file-upload" id="fileUpload" onclick="document.getElementById('imageInput').click()">
                        <p>📁 Click to upload or drag & drop</p>
                        <p style="font-size: 0.85rem; color: #6b7280; margin-top: 0.5rem;">JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                    <input type="file" id="imageInput" accept="image/*" style="display: none;" onchange="handleFileSelect(event)">
                    <input type="hidden" id="imageUrl" name="image_url" required>
                    <img id="previewImage" class="preview-image" style="display: none;">
                </div>

                <div class="form-group">
                    <label for="title">Title *</label>
                    <input type="text" id="title" name="title" required placeholder="e.g., Power Your Future with Solar">
                </div>

                <div class="form-group">
                    <label for="subtitle">Subtitle</label>
                    <textarea id="subtitle" name="subtitle" placeholder="Optional description"></textarea>
                </div>

                <div class="form-group">
                    <label for="linkUrl">Link URL</label>
                    <input type="text" id="linkUrl" name="link_url" placeholder="/categories?category=solar%20panels">
                </div>

                <div class="form-group">
                    <label for="position">Position *</label>
                    <select id="position" name="position" required>
                        <option value="main">Main Banner (Large Carousel)</option>
                        <option value="side">Side Banner (Small)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="displayOrder">Display Order</label>
                    <input type="number" id="displayOrder" name="display_order" value="0" min="0">
                </div>

                <div class="form-group">
                    <label for="status">Status</label>
                    <select id="status" name="status">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%;">Save Banner</button>
            </form>
        </div>
    </div>

    <script>
        const API_BASE = `${window.location.origin}/api`;

        document.addEventListener('DOMContentLoaded', loadBanners);

        const fileUpload = document.getElementById('fileUpload');
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                uploadImage(file);
            }
        });

        async function loadBanners() {
            try {
                const response = await fetch(`${API_BASE}/hero_banners.php`);
                const data = await response.json();

                document.getElementById('loading').style.display = 'none';

                if (data.success && data.data.length > 0) {
                    const mainBanners = data.data.filter(b => b.position === 'main');
                    const sideBanners = data.data.filter(b => b.position === 'side');

                    if (mainBanners.length > 0) {
                        document.getElementById('mainSection').style.display = 'block';
                        displayBanners(mainBanners, 'mainBannersContainer');
                    }

                    if (sideBanners.length > 0) {
                        document.getElementById('sideSection').style.display = 'block';
                        displayBanners(sideBanners, 'sideBannersContainer');
                    }
                } else {
                    document.getElementById('emptyState').style.display = 'block';
                }
            } catch (error) {
                console.error('Error loading banners:', error);
                document.getElementById('loading').innerHTML = '<p style="color: #ef4444;">Failed to load banners</p>';
            }
        }

        function displayBanners(banners, containerId) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';

            banners.forEach(banner => {
                const card = document.createElement('div');
                card.className = 'banner-card';
                card.innerHTML = `
                    <img src="${API_BASE.replace('/api', '')}/images/hero/${banner.image_url}" alt="${banner.title}" class="banner-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbT0iYmFzZWxpbmUiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='">
                    <div class="banner-content">
                        <h3 class="banner-title">${banner.title}</h3>
                        <p class="banner-subtitle">${banner.subtitle || 'No subtitle'}</p>
                        <div class="banner-meta">
                            <span class="badge ${banner.status === 'active' ? 'badge-active' : 'badge-inactive'}">
                                ${banner.status.toUpperCase()}
                            </span>
                            <span class="badge ${banner.position === 'main' ? 'badge-main' : 'badge-side'}">
                                ${banner.position === 'main' ? 'MAIN' : 'SIDE'}
                            </span>
                            <span class="badge badge-order">Order: ${banner.display_order}</span>
                        </div>
                        <div class="banner-actions">
                            <button class="btn btn-secondary" onclick="editBanner(${banner.id})">Edit</button>
                            <button class="btn btn-warning" onclick="toggleStatus(${banner.id}, '${banner.status}')">
                                ${banner.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button class="btn btn-danger" onclick="deleteBanner(${banner.id})">Delete</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function openModal(banner = null) {
            console.log('Opening modal with banner:', banner);
            const modal = document.getElementById('modal');
            const form = document.getElementById('bannerForm');
            form.reset();

            if (banner) {
                document.getElementById('modalTitle').textContent = 'Edit Banner';
                document.getElementById('bannerId').value = banner.id;
                document.getElementById('imageUrl').value = banner.image_url;
                document.getElementById('title').value = banner.title;
                document.getElementById('subtitle').value = banner.subtitle || '';
                document.getElementById('linkUrl').value = banner.link_url || '';
                document.getElementById('position').value = banner.position;
                document.getElementById('displayOrder').value = banner.display_order;
                document.getElementById('status').value = banner.status;

                const preview = document.getElementById('previewImage');
                preview.src = `${API_BASE.replace('/api', '')}/images/hero/${banner.image_url}`;
                preview.style.display = 'block';
            } else {
                document.getElementById('modalTitle').textContent = 'Add New Banner';
                document.getElementById('previewImage').style.display = 'none';
            }

            console.log('Adding active class to modal');
            modal.classList.add('active');
        }

        function closeModal() {
            document.getElementById('modal').classList.remove('active');
        }

        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) {
                uploadImage(file);
            }
        }

        async function uploadImage(file) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch(`${API_BASE}/hero_banners.php?action=upload`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('imageUrl').value = data.image_url;
                    const preview = document.getElementById('previewImage');
                    preview.src = `${API_BASE.replace('/api', '')}/images/hero/${data.image_url}`;
                    preview.style.display = 'block';
                    alert('Image uploaded successfully!');
                } else {
                    alert('Failed to upload image: ' + data.error);
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image');
            }
        }

        async function handleSubmit(event) {
            event.preventDefault();

            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            const bannerId = document.getElementById('bannerId').value;
            const method = bannerId ? 'PUT' : 'POST';
            const action = bannerId ? '' : '?action=create';

            if (bannerId) {
                data.id = bannerId;
            }

            try {
                const response = await fetch(`${API_BASE}/hero_banners.php${action}`, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    closeModal();
                    location.reload();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error saving banner:', error);
                alert('Failed to save banner');
            }
        }

        async function editBanner(id) {
            try {
                console.log('Editing banner with ID:', id);
                const response = await fetch(`${API_BASE}/hero_banners.php`);
                const data = await response.json();
                console.log('Banner data:', data);

                if (data.success) {
                    console.log('Available banner IDs:', data.data.map(b => ({ id: b.id, type: typeof b.id })));
                    console.log('Looking for ID:', id, 'type:', typeof id);
                    
                    // Try both string and number comparison
                    const banner = data.data.find(b => b.id == id);
                    console.log('Found banner:', banner);
                    if (banner) {
                        openModal(banner);
                    } else {
                        console.error('Banner not found with ID:', id);
                        console.error('Available IDs:', data.data.map(b => b.id));
                    }
                } else {
                    console.error('Failed to load banners:', data);
                }
            } catch (error) {
                console.error('Error loading banner:', error);
            }
        }

        async function toggleStatus(id, currentStatus) {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

            try {
                const response = await fetch(`${API_BASE}/hero_banners.php`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id,
                        status: newStatus
                    })
                });

                const result = await response.json();

                if (result.success) {
                    location.reload();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error toggling status:', error);
            }
        }

        async function deleteBanner(id) {
            if (!confirm('Are you sure you want to delete this banner?')) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/hero_banners.php?id=${id}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    location.reload();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error deleting banner:', error);
                alert('Failed to delete banner');
            }
        }
    </script>
</body>
</html>
