import { Card, CardContent, Box, TextField, MenuItem } from '@mui/material';

const statusOptions = [
  { value: '', label: 'همه' },
  { value: 'new', label: 'جدید' },
  { value: 'read', label: 'خوانده شده' },
  { value: 'replied', label: 'پاسخ داده شده' },
  { value: 'archived', label: 'آرشیو شده' },
];

export default function ContactFilters({ statusFilter, searchQuery, onStatusChange, onSearchChange }) {
  return (
    <Card sx={{ borderRadius: 4, mb: 3 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            select
            label="وضعیت"
            value={statusFilter}
            onChange={e => onStatusChange(e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            {statusOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="جستجو (نام، ایمیل، موضوع)"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 240 }}
            placeholder="جستجو..."
          />
        </Box>
      </CardContent>
    </Card>
  );
}

