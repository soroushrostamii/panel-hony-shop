import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { API_BASE_URL } from '../../constants/api';

const placements = [
  { value: 'hero', label: 'بنر اصلی' },
  { value: 'promo', label: 'بنر تبلیغاتی' },
  { value: 'grid', label: 'بنر شبکه‌ای/کوچک' },
  { value: 'mini', label: 'بنر مینی' },
];

const emptyBanner = {
  title: '',
  subtitle: '',
  image: '',
  imageFile: null,
  imageFilePreview: '',
  link: '',
  placement: 'hero',
  order: 0,
  isActive: true,
};

const API_BASE = API_BASE_URL;

export default function BannerDialog({ open, onClose, banner, onSubmit, loading }) {
  const [values, setValues] = useState(emptyBanner);

  useEffect(() => {
    if (banner) {
      setValues({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        imageFile: null,
        imageFilePreview: banner.image
          ? banner.image.startsWith('http')
            ? banner.image
            : `${API_BASE}${banner.image}`
          : '',
        link: banner.link || '',
        placement: banner.placement || 'hero',
        order: banner.order ?? 0,
        isActive: banner.isActive ?? true,
      });
    } else {
      setValues(emptyBanner);
    }
  }, [banner, open]);

  useEffect(() => {
    if (!values.imageFilePreview) return;
    const previewUrl = values.imageFilePreview;
    if (previewUrl.startsWith('blob:')) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [values.imageFilePreview]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!values.image && !values.imageFile) {
      return;
    }
    onSubmit(values);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{banner ? 'ویرایش بنر' : 'بنر جدید'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gap: 2 }}>
          <TextField
            label="عنوان"
            name="title"
            value={values.title}
            onChange={e => setValues(p => ({ ...p, title: e.target.value }))}
            fullWidth
          />
          <TextField
            label="زیرعنوان"
            name="subtitle"
            value={values.subtitle}
            onChange={e => setValues(p => ({ ...p, subtitle: e.target.value }))}
            fullWidth
          />
          <Box>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              آپلود تصویر
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setValues(p => ({
                      ...p,
                      imageFile: file,
                      imageFilePreview: preview,
                      image: '',
                    }));
                  }
                }}
              />
            </Button>
            {values.imageFilePreview && (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={values.imageFilePreview}
                  alt="preview"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 2,
                  }}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() =>
                    setValues(p => ({ ...p, imageFile: null, imageFilePreview: '' }))
                  }
                  sx={{ mt: 1 }}
                >
                  حذف تصویر
                </Button>
              </Box>
            )}
            <TextField
              label="یا آدرس تصویر (URL)"
              name="image"
              value={values.image}
              onChange={e =>
                setValues(p => ({
                  ...p,
                  image: e.target.value,
                  imageFile: null,
                  imageFilePreview: '',
                }))
              }
              fullWidth
              helperText="در صورت آپلود تصویر نیازی به وارد کردن URL نیست"
            />
          </Box>
          <TextField
            label="لینک"
            name="link"
            value={values.link}
            onChange={e => setValues(p => ({ ...p, link: e.target.value }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>موقعیت</InputLabel>
            <Select
              value={values.placement}
              onChange={e => setValues(p => ({ ...p, placement: e.target.value }))}
              label="موقعیت"
            >
              {placements.map(p => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="ترتیب"
            type="number"
            value={values.order}
            onChange={e => setValues(p => ({ ...p, order: Number(e.target.value) }))}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>وضعیت</InputLabel>
            <Select
              value={values.isActive ? 'active' : 'inactive'}
              onChange={e => setValues(p => ({ ...p, isActive: e.target.value === 'active' }))}
              label="وضعیت"
            >
              <MenuItem value="active">فعال</MenuItem>
              <MenuItem value="inactive">غیرفعال</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>لغو</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'در حال ذخیره...' : 'ذخیره'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

