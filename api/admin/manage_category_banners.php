<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Category Banners - Sunleaf Tech</title>
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

        .category-tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 1rem;
        }

        .tab {
            padding: 0.75rem 1.5rem;
            background: #f3f4f6;
            border: none;
            border-radius: 8px 8px 0 0;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            color: #6b7280;
        }

        .tab.active {
            background: #6366f1;
            color: white;
            transform: translateY(-2px);
        }

        .tab:hover:not(.active) {
            background: #e5e7eb;
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

        .banner-category {
            font-size: 0.875rem;
            font-weight: 700;
            color: #6366f1;
            margin-bottom: 0.5rem;
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
        .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #6366f1;
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

            .category-tabs {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>🎨 Category Banners Manager</h1>
                <div class="header-info">Manage banners for Solar Outdoor, Lithium Batteries, Inverters, etc.</div>
            </div>

    <!-- Link Picker Modal -->
    <div id="linkPickerModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Choose Destination</h2>
                <button class="close-btn" onclick="closeLinkPicker()">&times;</button>
            </div>

            <div style="display:flex; gap:.5rem; margin-bottom:1rem; flex-wrap:wrap;">
                <button class="btn btn-secondary" id="lpTabCategory" onclick="switchLinkTab('category')">Category</button>
                <button class="btn" id="lpTabProduct" style="background:#e5e7eb;" onclick="switchLinkTab('product')">Product</button>
                <button class="btn" id="lpTabCustom" style="background:#e5e7eb;" onclick="switchLinkTab('custom')">Custom URL</button>
            </div>

            <!-- Category Picker -->
            <div id="lpCategory" class="lp-panel">
                <label style="font-weight:600; color:#374151;">Select a category</label>
                <select id="lpCategorySelect" style="width:100%; padding:.75rem; border:2px solid #e5e7eb; border-radius:8px; margin:.5rem 0;">
                </select>
                <button class="btn btn-primary" onclick="applyCategoryLink()" style="width:100%;">Use this category</button>
            </div>

            <!-- Product Picker (placeholder) -->
            <div id="lpProduct" class="lp-panel" style="display:none;">
                <div class="info-box">
                    <p><strong>Note:</strong> Product link pattern not yet confirmed. We can enable product search once the URL format is provided (e.g., /product/{id} or /products/{slug}).</p>
                </div>
                <button class="btn btn-secondary" onclick="switchLinkTab('category')">Pick Category instead</button>
            </div>

            <!-- Custom URL -->
            <div id="lpCustom" class="lp-panel" style="display:none;">
                <label style="font-weight:600; color:#374151;">Enter a URL</label>
                <input type="text" id="lpCustomInput" placeholder="/categories?category=Inverters or https://example.com/page" style="width:100%; padding:.75rem; border:2px solid #e5e7eb; border-radius:8px; margin:.5rem 0;" />
                <button class="btn btn-primary" onclick="applyCustomLink()" style="width:100%;">Use this link</button>
            </div>
        </div>
    </div>
            <button class="btn btn-primary" onclick="openModal()">+ Add New Banner</button>
        </div>

        <div class="content">
            <div class="info-box">
                <p><strong>📐 Banner Guide:</strong></p>
                <p>• Each category section displays 3 small banners below the product grid</p>
                <p>• Recommended: Exactly 3 banners per category for best layout</p>
                <p>• Banners are displayed in order (1, 2, 3)</p>
            </div>

            <div class="category-tabs" id="categoryTabs">
                <button class="tab active" onclick="switchCategory('all')">All Categories</button>
            </div>

            <div id="loading" class="loading">
                <div class="spinner"></div>
                <p>Loading banners...</p>
            </div>

            <div id="bannersContainer" style="display: none;">
                <div class="banners-grid" id="bannersGrid"></div>
            </div>

            <div id="emptyState" class="empty-state" style="display: none;">
                <h3>No banners yet</h3>
                <p>Create your first category banner to get started</p>
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
                    <label for="categoryName">Category *</label>
                    <input type="text" id="categoryName" name="category_name" required placeholder="e.g., Solar Outdoor Lights, Lithium Batteries, Inverters" list="categoryList">
                    <datalist id="categoryList">
                        <option value="Solar Outdoor Lights">
                        <option value="Lithium Batteries">
                        <option value="Inverters">
                        <option value="Solar Panels">
                        <option value="Solar Water Heaters">
                        <option value="Batteries">
                    </datalist>
                </div>

                <div class="form-group">
                    <label for="linkUrl">Link URL</label>
                    <div style="display:flex; gap:.5rem; align-items:center; margin-bottom:.5rem; flex-wrap: wrap;">
                      <button type="button" class="btn btn-secondary" onclick="openLinkPicker('category')">Pick Category</button>
                      <button type="button" class="btn btn-secondary" onclick="openLinkPicker('product')">Pick Product</button>
                      <button type="button" class="btn" style="background:#e5e7eb;" onclick="promptCustomUrl()">Custom URL</button>
                      <button type="button" class="btn btn-warning" onclick="clearLinkUrl()">Clear</button>
                    </div>
                    <input type="text" id="linkUrl" name="link_url" placeholder="/categories?category=Solar%20Outdoor%20Lights">
                    <small id="linkPreview" style="display:block; color:#6b7280; margin-top:.5rem;">Preview: <span id="linkPreviewValue">(none)</span> <a id="testLinkBtn" href="#" target="_blank" style="margin-left:.5rem; display:none;">Test</a></small>
                </div>

                <div class="form-group">
                    <label for="displayOrder">Display Order (1-3)</label>
                    <input type="number" id="displayOrder" name="display_order" value="1" min="1" max="3">
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
        let currentCategory = 'all';
        let allBanners = [];
        let knownCategories = [];

        document.addEventListener('DOMContentLoaded', () => {
            loadBanners();
            loadCategories();
        });

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

        async function loadCategories() {
            try {
                const response = await fetch(`${API_BASE}/category_banners.php?action=categories`);
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    const tabsContainer = document.getElementById('categoryTabs');
                    knownCategories = data.data;
                    data.data.forEach(category => {
                        const tab = document.createElement('button');
                        tab.className = 'tab';
                        tab.textContent = category;
                        tab.onclick = () => switchCategory(category);
                        tabsContainer.appendChild(tab);
                    });
                }
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        }

        function switchCategory(category) {
            currentCategory = category;
            
            // Update active tab
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
                if ((category === 'all' && tab.textContent === 'All Categories') || 
                    tab.textContent === category) {
                    tab.classList.add('active');
                }
            });

            displayBanners(category === 'all' ? allBanners : allBanners.filter(b => b.category_name === category));
        }

        async function loadBanners() {
            try {
                const response = await fetch(`${API_BASE}/category_banners.php`);
                const data = await response.json();

                document.getElementById('loading').style.display = 'none';

                if (data.success && data.data.length > 0) {
                    allBanners = data.data;
                    document.getElementById('bannersContainer').style.display = 'block';
                    displayBanners(data.data);
                } else {
                    document.getElementById('emptyState').style.display = 'block';
                }
            } catch (error) {
                console.error('Error loading banners:', error);
                document.getElementById('loading').innerHTML = '<p style="color: #ef4444;">Failed to load banners</p>';
            }
        }

        // ---------- Link Picker Logic ----------
        function updateLinkPreview() {
            const v = document.getElementById('linkUrl').value.trim();
            const preview = document.getElementById('linkPreviewValue');
            const testBtn = document.getElementById('testLinkBtn');
            if (v) {
                preview.textContent = v;
                testBtn.href = v.startsWith('http') ? v : API_BASE.replace('/api','') + v;
                testBtn.style.display = 'inline';
            } else {
                preview.textContent = '(none)';
                testBtn.style.display = 'none';
            }
        }

        function openLinkPicker(defaultTab = 'category') {
            // Populate category select
            const sel = document.getElementById('lpCategorySelect');
            sel.innerHTML = '';
            const inputCat = (document.getElementById('categoryName').value || '').trim();
            const categories = [...new Set([inputCat, ...knownCategories.filter(Boolean)])].filter(Boolean);
            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                sel.appendChild(opt);
            });
            switchLinkTab(defaultTab);
            document.getElementById('linkPickerModal').classList.add('active');
        }

        function closeLinkPicker() {
            document.getElementById('linkPickerModal').classList.remove('active');
        }

        function switchLinkTab(tab) {
            const tabs = ['category','product','custom'];
            tabs.forEach(t => {
                document.getElementById('lp' + capitalize(t)).style.display = (t === tab) ? 'block' : 'none';
                const btn = document.getElementById('lpTab' + capitalize(t));
                if (btn) btn.style.background = (t === tab) ? '#6366f1' : '#e5e7eb';
                if (btn) btn.style.color = (t === tab) ? '#fff' : '#111827';
            });
        }

        function capitalize(s){ return (s||'').charAt(0).toUpperCase() + (s||'').slice(1); }

        function applyCategoryLink() {
            const c = document.getElementById('lpCategorySelect').value.trim();
            if (!c) { alert('Please select a category'); return; }
            const link = `/categories?category=${encodeURIComponent(c)}`;
            document.getElementById('linkUrl').value = link;
            updateLinkPreview();
            closeLinkPicker();
        }

        function applyCustomLink() {
            const raw = document.getElementById('lpCustomInput').value.trim();
            if (!raw) { alert('Please enter a URL'); return; }
            // Basic validation: allow absolute http(s) or site-relative starting with /
            const ok = /^https?:\/\//i.test(raw) || raw.startsWith('/');
            if (!ok) { alert('Enter a valid URL starting with http(s):// or /'); return; }
            document.getElementById('linkUrl').value = raw;
            updateLinkPreview();
            closeLinkPicker();
        }

        function promptCustomUrl() {
            switchLinkTab('custom');
            document.getElementById('lpCustomInput').value = document.getElementById('linkUrl').value || '';
            document.getElementById('linkPickerModal').classList.add('active');
        }

        function clearLinkUrl() {
            document.getElementById('linkUrl').value = '';
            updateLinkPreview();
        }

        // keep preview in sync if user edits manually
        document.addEventListener('input', (e) => {
            if (e.target && e.target.id === 'linkUrl') updateLinkPreview();
        });

        function displayBanners(banners) {
            const container = document.getElementById('bannersGrid');
            container.innerHTML = '';

            if (banners.length === 0) {
                document.getElementById('emptyState').style.display = 'block';
                document.getElementById('bannersContainer').style.display = 'none';
                return;
            }

            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('bannersContainer').style.display = 'block';

            banners.forEach(banner => {
                const card = document.createElement('div');
                card.className = 'banner-card';
                card.innerHTML = `
                    <img src="${API_BASE.replace('/api', '')}${banner.image_url}" alt="${banner.category_name}" class="banner-image" onerror="this.src='/images/placeholder.jpg'">
                    <div class="banner-content">
                        <div class="banner-category">${banner.category_name}</div>
                        <div class="banner-meta">
                            <span class="badge ${banner.status === 'active' ? 'badge-active' : 'badge-inactive'}">
                                ${banner.status.toUpperCase()}
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
            console.log('Opening category banner modal with banner:', banner);
            const modal = document.getElementById('modal');
            const form = document.getElementById('bannerForm');
            form.reset();

            if (banner) {
                document.getElementById('modalTitle').textContent = 'Edit Banner';
                document.getElementById('bannerId').value = banner.id;
                document.getElementById('imageUrl').value = banner.image_url;
                document.getElementById('categoryName').value = banner.category_name;
                document.getElementById('linkUrl').value = banner.link_url || '';
                document.getElementById('displayOrder').value = banner.display_order;
                document.getElementById('status').value = banner.status;

                const preview = document.getElementById('previewImage');
                preview.src = `${API_BASE.replace('/api', '')}/images/category_banners/${banner.image_url}`;
                preview.style.display = 'block';
            } else {
                document.getElementById('modalTitle').textContent = 'Add New Banner';
                document.getElementById('previewImage').style.display = 'none';
            }

            console.log('Adding active class to category banner modal');
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
                const response = await fetch(`${API_BASE}/category_banners.php?action=upload`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    document.getElementById('imageUrl').value = data.image_url;
                    const preview = document.getElementById('previewImage');
                    preview.src = `${API_BASE.replace('/api', '')}${data.image_url}`;
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
                const response = await fetch(`${API_BASE}/category_banners.php${action}`, {
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
                console.log('Editing category banner with ID:', id);
                const response = await fetch(`${API_BASE}/category_banners.php`);
                const data = await response.json();
                console.log('Category banner data:', data);

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
            const banner = allBanners.find(b => b.id == id); // Use loose equality

            if (!banner) {
                console.error('Banner not found for status toggle, ID:', id);
                return;
            }

            console.log('Toggling status for banner:', id, 'from', currentStatus, 'to', newStatus);
            try {
                const response = await fetch(`${API_BASE}/category_banners.php`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id,
                        category_name: banner.category_name,
                        image_url: banner.image_url,
                        link_url: banner.link_url,
                        display_order: banner.display_order,
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
                const response = await fetch(`${API_BASE}/category_banners.php?id=${id}`, {
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
