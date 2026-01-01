import { TableCell, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const placementOptions = [
  { value: 'hero', label: 'بنر صفحه اصلی' },
  { value: 'carousel', label: 'اسلایدر تبلیغات' },
  { value: 'sidebar', label: 'ستون کناری' },
  { value: 'footer', label: 'فوتر سایت' },
];

export function useAdTable({ ads, onEdit, onDelete }) {
  const renderRow = ad => {
    return (
      <>
        <TableCell>{ad.title}</TableCell>
        <TableCell>
          {placementOptions.find(opt => opt.value === ad.placement)?.label || ad.placement}
        </TableCell>
        <TableCell>{ad.ctaLabel}</TableCell>
        <TableCell>{ad.priority}</TableCell>
        <TableCell>{ad.active ? 'بله' : 'خیر'}</TableCell>
        <TableCell align="right">
          <IconButton color="primary" onClick={() => onEdit(ad)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => onDelete(ad.id || ad._id)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

