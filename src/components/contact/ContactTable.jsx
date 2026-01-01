import { TableCell, IconButton, Chip } from '@mui/material';
import { Delete, Visibility, CheckCircle, Archive } from '@mui/icons-material';
import { formatDate } from '../../utils/format';

const statusOptions = [
  { value: '', label: 'همه' },
  { value: 'new', label: 'جدید' },
  { value: 'read', label: 'خوانده شده' },
  { value: 'replied', label: 'پاسخ داده شده' },
  { value: 'archived', label: 'آرشیو شده' },
];

const statusColors = {
  new: 'error',
  read: 'warning',
  replied: 'success',
  archived: 'default',
};

export function useContactTable({ messages, onView, onStatusChange, onDelete }) {
  const renderRow = message => {
    return (
      <>
        <TableCell>{message.name}</TableCell>
        <TableCell>{message.email}</TableCell>
        <TableCell>{message.subject || '-'}</TableCell>
        <TableCell>{formatDate(message.createdAt)}</TableCell>
        <TableCell>
          <Chip
            label={statusOptions.find(s => s.value === message.status)?.label || message.status}
            color={statusColors[message.status] || 'default'}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <IconButton color="primary" size="small" onClick={() => onView(message)}>
            <Visibility />
          </IconButton>
          {message.status !== 'replied' && (
            <IconButton
              color="success"
              size="small"
              onClick={() => onStatusChange(message, 'replied')}
            >
              <CheckCircle />
            </IconButton>
          )}
          {message.status !== 'archived' && (
            <IconButton
              color="default"
              size="small"
              onClick={() => onStatusChange(message, 'archived')}
            >
              <Archive />
            </IconButton>
          )}
          <IconButton color="error" size="small" onClick={() => onDelete(message)}>
            <Delete />
          </IconButton>
        </TableCell>
      </>
    );
  };

  return { renderRow };
}

