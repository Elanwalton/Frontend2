'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PageHeader from '@/components/admin/PageHeader';
import { apiGet, getApiEndpoint } from '@/utils/apiClient';

type BannerStatus = 'active' | 'inactive';

type HeroBanner = {
  id: number;
  image_url: string;
  title: string;
  subtitle: string | null;
  link_url: string | null;
  status: BannerStatus;
  display_order: number;
  position: string;
  created_at?: string;
};

type LinkTargetType = 'none' | 'category' | 'product';

type ProductOption = {
  id: number;
  name: string;
  category?: string;
};

export default function HeroBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [linkTargetType, setLinkTargetType] = useState<LinkTargetType>('none');
  const [linkCategory, setLinkCategory] = useState<string>('');
  const [linkProduct, setLinkProduct] = useState<ProductOption | null>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);

  const initialForm = useMemo(
    () => ({
      id: 0,
      image_url: '',
      title: '',
      subtitle: '',
      link_url: '',
      status: 'active' as BannerStatus,
      display_order: 1,
      position: 'main',
    }),
    []
  );

  const [form, setForm] = useState(initialForm);
  const [uploading, setUploading] = useState(false);

  async function readJsonSafe(response: Response) {
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    if (!contentType.includes('application/json')) {
      const snippet = text.slice(0, 200);
      throw new Error(`Unexpected response (${response.status}). Expected JSON but got: ${snippet}`);
    }
    try {
      return JSON.parse(text);
    } catch {
      const snippet = text.slice(0, 200);
      throw new Error(`Invalid JSON response (${response.status}): ${snippet}`);
    }
  }

  async function loadProductsForPicker() {
    try {
      const res = await apiGet<{ success: boolean; data: any[] }>('getProductsClients', {
        page: 1,
        limit: 200,
      } as any);
      if (!res?.success) return;

      const items: ProductOption[] = (res.data || []).map((p) => ({
        id: Number(p.id),
        name: String(p.name ?? ''),
        category: p.category ? String(p.category) : undefined,
      }));
      setProductOptions(items.filter((p) => p.id && p.name));
    } catch {
      // ignore picker loading failures
    }
  }

  async function loadBanners() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ success: boolean; data: HeroBanner[]; error?: string }>('hero_banners');
      if (!res?.success) throw new Error(res?.error || 'Failed to load banners');
      setBanners(res.data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBanners();
    loadProductsForPicker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  }

  function openEdit(b: HeroBanner) {
    setEditing(b);
    setForm({
      id: b.id,
      image_url: b.image_url || '',
      title: b.title || '',
      subtitle: b.subtitle || '',
      link_url: b.link_url || '',
      status: (b.status || 'active') as BannerStatus,
      display_order: Number(b.display_order ?? 1),
      position: b.position || 'main',
    });

    // Best-effort parse existing link_url into picker state
    const link = b.link_url || '';
    const categoryMatch = link.match(/\/categories\?category=(.+)$/);
    if (categoryMatch?.[1]) {
      setLinkTargetType('category');
      setLinkCategory(decodeURIComponent(categoryMatch[1]));
      setLinkProduct(null);
    } else {
      const productMatch = link.match(/\/product\/(\d+)$/);
      if (productMatch?.[1]) {
        setLinkTargetType('product');
        const id = Number(productMatch[1]);
        const found = productOptions.find((p) => p.id === id) || { id, name: `Product #${id}` };
        setLinkProduct(found);
        setLinkCategory('');
      } else {
        setLinkTargetType('none');
        setLinkCategory('');
        setLinkProduct(null);
      }
    }
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(initialForm);
    setLinkTargetType('none');
    setLinkCategory('');
    setLinkProduct(null);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('image', file);

      const response = await fetch(getApiEndpoint('hero_banners') + '?action=upload', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });

      const data = await readJsonSafe(response);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Upload failed (${response.status})`);
      }

      setForm((prev) => ({ ...prev, image_url: data.image_url || data.url || '' }));
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function saveBanner() {
    setError(null);
    try {
      const isEdit = Boolean(editing);
      const action = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? getApiEndpoint('hero_banners') : getApiEndpoint('hero_banners') + '?action=create';

      const payload = {
        ...(isEdit ? { id: form.id } : {}),
        image_url: form.image_url,
        title: form.title,
        subtitle: form.subtitle || '',
        link_url:
          linkTargetType === 'category'
            ? `/categories?category=${encodeURIComponent(linkCategory)}`
            : linkTargetType === 'product'
              ? `/product/${linkProduct?.id ?? ''}`
              : '',
        status: form.status,
        display_order: Number(form.display_order || 0),
        position: form.position || 'main',
      };

      const response = await fetch(url, {
        method: action,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await readJsonSafe(response);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Save failed (${response.status})`);
      }

      closeModal();
      await loadBanners();
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    }
  }

  async function deleteBanner(id: number) {
    setError(null);
    try {
      const response = await fetch(getApiEndpoint('hero_banners') + `?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await readJsonSafe(response);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || `Delete failed (${response.status})`);
      }
      await loadBanners();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    }
  }

  return (
    <Box>
      <PageHeader
        title="Hero Banners"
        subtitle="Create, upload images, edit, activate/deactivate, and delete hero banners."
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={openCreate}>
          New Banner
        </Button>
        <Button variant="outlined" onClick={loadBanners} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {banners.map((b) => (
          <Card key={b.id} variant="outlined">
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {b.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {b.status} | Position: {b.position} | Order: {b.display_order}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-word' }}>
                    Image: {b.image_url}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => openEdit(b)}>
                    Edit
                  </Button>
                  <Button color="error" variant="outlined" onClick={() => deleteBanner(b.id)}>
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {!loading && banners.length === 0 && (
          <Typography color="text.secondary">No banners yet.</Typography>
        )}
      </Stack>

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Banner' : 'New Banner'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Button variant="outlined" component="label" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                }}
              />
            </Button>

            <TextField
              label="Image URL"
              value={form.image_url}
              onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
              fullWidth
              required
            />

            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              fullWidth
              required
            />

            <TextField
              label="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="hero-link-target-label">Link Target</InputLabel>
              <Select
                labelId="hero-link-target-label"
                label="Link Target"
                value={linkTargetType}
                onChange={(e) => {
                  const v = e.target.value as LinkTargetType;
                  setLinkTargetType(v);
                  if (v !== 'category') setLinkCategory('');
                  if (v !== 'product') setLinkProduct(null);
                }}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="product">Product</MenuItem>
              </Select>
            </FormControl>

            {linkTargetType === 'category' && (
              <TextField
                label="Category"
                value={linkCategory}
                onChange={(e) => setLinkCategory(e.target.value)}
                fullWidth
                required
                placeholder="e.g. Solar Panels"
              />
            )}

            {linkTargetType === 'product' && (
              <Autocomplete
                options={productOptions}
                getOptionLabel={(o) => (o?.name ? String(o.name) : '')}
                filterOptions={(options, state) => {
                  const q = state.inputValue.trim().toLowerCase();
                  if (!q) return options.slice(0, 50);

                  const tokens = q.split(/\s+/).filter(Boolean);
                  const scored = options
                    .map((o) => {
                      const hay = `${o.name} ${o.category ?? ''} ${o.id}`.toLowerCase();
                      let score = 0;
                      for (const t of tokens) {
                        if (hay.includes(t)) score += 2;
                        if (o.name.toLowerCase().startsWith(t)) score += 2;
                      }
                      if (String(o.id) === q) score += 5;
                      return { o, score };
                    })
                    .filter((x) => x.score > 0)
                    .sort((a, b) => b.score - a.score);

                  // Keep results diverse by category
                  const byCategory = new Map<string, number>();
                  const out: ProductOption[] = [];
                  for (const { o } of scored) {
                    const cat = o.category || 'Other';
                    const used = byCategory.get(cat) || 0;
                    if (used >= 5) continue;
                    out.push(o);
                    byCategory.set(cat, used + 1);
                    if (out.length >= 50) break;
                  }
                  return out;
                }}
                value={linkProduct}
                onChange={(_, v) => setLinkProduct(v)}
                renderOption={(props, option) => (
                  <li {...props}>
                    <span style={{ fontWeight: 600 }}>{option.name}</span>
                    <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 12 }}>
                      #{option.id}{option.category ? ` • ${option.category}` : ''}
                    </span>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Product" fullWidth required placeholder="Search by name, category, or id" />
                )}
              />
            )}

            <FormControl fullWidth>
              <InputLabel id="hero-position-label">Position</InputLabel>
              <Select
                labelId="hero-position-label"
                label="Position"
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: String(e.target.value) }))}
              >
                <MenuItem value="main">Main</MenuItem>
                <MenuItem value="secondary">Secondary</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Display Order"
              type="number"
              value={form.display_order}
              onChange={(e) => setForm((p) => ({ ...p, display_order: Number(e.target.value) }))}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <FormControl fullWidth>
              <InputLabel id="hero-status-label">Status</InputLabel>
              <Select
                labelId="hero-status-label"
                label="Status"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as BannerStatus }))}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={saveBanner} variant="contained" disabled={uploading}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
