import { TableCell, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const placements = [
  { value: 'hero', label: 'بنر اصلی' },
  { value: 'promo', label: 'بنر تبلیغاتی' },
  { value: 'grid', label: 'بنر شبکه‌ای/کوچک' },
  { value: 'mini', label: 'بنر مینی' },
];

export function useBannerTable({ banners, onEdit, onDelete }) {
  const renderRow = banner => {
    return (
      <>
        <TableCell>{banner.title || 'بدون عنوان'}</TableCell>
        <TableCell>
          {placements.find(p => p.value === banner.placement)?.label || banner.placement}
        </TableCell>
        <TableCell>{banner.order ?? 0}</TableCell>
        <TableCell>{banner.isActive ? 'فعال' : 'غیرفعال'}</TableCell>
        <TableCell align="right">
          <IconButton color="primary" onClick={() => onEdit(banner)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(banner)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

