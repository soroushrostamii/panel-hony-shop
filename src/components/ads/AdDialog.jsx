import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { API_BASE_URL } from '../../constants/api';

const placementOptions = [
  { value: 'hero', label: 'بنر صفحه اصلی' },
  { value: 'carousel', label: 'اسلایدر تبلیغات' },
  { value: 'sidebar', label: 'ستون کناری' },
  { value: 'footer', label: 'فوتر سایت' },
];

const emptyAd = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  imageFile: null,
  imageFilePreview: '',
  ctaLabel: 'مشاهده',
  ctaLink: '/',
  placement: 'hero',
  priority: 1,
  active: true,
};

const API_BASE = API_BASE_URL;

export default function AdDialog({ open, onClose, ad, onSubmit, loading }) {
  const [values, setValues] = useState(emptyAd);

  useEffect(() => {
    if (ad) {
      setValues({
        ...emptyAd,
        ...ad,
        imageFile: null,
        imageFilePreview: '',
      });
    } else {
      setValues(emptyAd);
    }
  }, [ad, open]);

  useEffect(() => {
    if (!values.imageFilePreview) {
      return undefined;
    }
    const previewUrl = values.imageFilePreview;
    if (previewUrl.startsWith('blob:')) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [values.imageFilePreview]);

  const handleChange = event => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = event => {
    setValues(prev => ({ ...prev, active: event.target.checked }));
  };

  const handleFileChange = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setValues(prev => ({
      ...prev,
      imageFile: file,
      imageFilePreview: preview,
      image: '',
    }));
  };

  const currentPreview = () => {
    if (values.imageFilePreview) return values.imageFilePreview;
    if (values.image?.startsWith('http')) return values.image;
    if (values.image) return `${API_BASE}${values.image}`;
    return '';
  };

  const handleSubmit = event => {
    event.preventDefault();
    onSubmit(values);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {ad ? 'ویرایش تبلیغ' : 'تبلیغ جدید'}
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* ردیف اول: عنوان و زیرعنوان */}
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <TextField
                label="عنوان"
                name="title"
                value={values.title}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <TextField
                label="زیرعنوان"
                name="subtitle"
                value={values.subtitle}
                onChange={handleChange}
                fullWidth
              />
            </Box>
          </Box>

          {/* ردیف دوم: توضیحات */}
          <Box sx={{ width: '100%' }}>
            <TextField
              label="توضیحات"
              name="description"
              value={values.description}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={3}
            />
          </Box>

          {/* ردیف سوم: آپلود تصویر */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={600} mb={1}>
              تصویر تبلیغ
            </Typography>
            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
              آپلود تصویر
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {currentPreview() && (
              <Box sx={{ mb: 2 }}>
                <Box
                  component="img"
                  src={currentPreview()}
                  alt="preview"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                {values.imageFilePreview && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() =>
                      setValues(p => ({
                        ...p,
                        imageFile: null,
                        imageFilePreview: '',
                      }))
                    }
                    sx={{ mt: 1 }}
                  >
                    حذف تصویر
                  </Button>
                )}
              </Box>
            )}
            <TextField
              label="یا آدرس تصویر (URL)"
              name="image"
              value={values.image}
              onChange={handleChange}
              fullWidth
              helperText="در صورت آپلود تصویر نیازی به وارد کردن URL نیست"
            />
          </Box>

          {/* ردیف چهارم: متن دکمه و لینک */}
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <TextField
                label="متن دکمه"
                name="ctaLabel"
                value={values.ctaLabel}
                onChange={handleChange}
                fullWidth
              />
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <TextField
                label="لینک دکمه"
                name="ctaLink"
                value={values.ctaLink}
                onChange={handleChange}
                fullWidth
              />
            </Box>
          </Box>

          {/* ردیف پنجم: جایگاه و اولویت */}
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Box sx={{ flex: 1, width: '100%' }}>
              <FormControl fullWidth>
                <InputLabel>جایگاه</InputLabel>
                <Select
                  name="placement"
                  value={values.placement}
                  onChange={handleChange}
                  label="جایگاه"
                >
                  {placementOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              <TextField
                label="اولویت"
                name="priority"
                type="number"
                value={values.priority}
                onChange={handleChange}
                fullWidth
              />
            </Box>
          </Box>

          {/* ردیف ششم: وضعیت فعال */}
          <Box sx={{ width: '100%' }}>
            <FormControlLabel
              control={<Switch checked={values.active} onChange={handleToggle} />}
              label="فعال"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}
      >
        <Button onClick={handleClose} disabled={loading}>
          لغو
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          type="submit"
        >
          {loading ? 'در حال ذخیره...' : 'ذخیره'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

