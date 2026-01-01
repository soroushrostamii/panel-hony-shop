import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { bannerApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import BannerDialog from '../components/banners/BannerDialog';
import { useBannerTable } from '../components/banners/BannerTable';
import { Add } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

export default function BannersPage() {
  const queryClient = useQueryClient();
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: bannerApi.list,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const { toast, showToast, handleClose } = useToast();

  const createMutation = useMutation({
    mutationFn: bannerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showToast('بنر ثبت شد');
      setDialogOpen(false);
    },
    onError: err => showToast(err?.response?.data?.message || 'خطا در ثبت بنر', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: bannerApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showToast('بنر به‌روزرسانی شد');
      setDialogOpen(false);
    },
    onError: err => showToast(err?.response?.data?.message || 'خطا در ویرایش', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: bannerApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      showToast('بنر حذف شد');
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast('حذف بنر ناموفق بود', 'error'),
  });

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  const handleSubmit = values => {
    if (!values.image && !values.imageFile) {
      showToast('تصویر الزامی است', 'warning');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id || editing._id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedBanners = [...banners].sort((a, b) => {
    if (!orderBy) return 0;

    let aValue, bValue;

    switch (orderBy) {
      case 'title':
        aValue = a.title || '';
        bValue = b.title || '';
        break;
      case 'placement':
        aValue = a.placement || '';
        bValue = b.placement || '';
        break;
      case 'order':
        aValue = Number(a.order) || 0;
        bValue = Number(b.order) || 0;
        break;
      case 'isActive':
        aValue = a.isActive ? 1 : 0;
        bValue = b.isActive ? 1 : 0;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string') {
      return order === 'asc'
        ? aValue.localeCompare(bValue, 'fa')
        : bValue.localeCompare(aValue, 'fa');
    } else {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  const columns = [
    { id: 'title', label: 'عنوان', sortable: true },
    { id: 'placement', label: 'جایگاه', sortable: true },
    { id: 'order', label: 'ترتیب', sortable: true },
    { id: 'isActive', label: 'وضعیت', sortable: true },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useBannerTable({
    banners: sortedBanners,
    onEdit: banner => {
      setEditing(banner);
      setDialogOpen(true);
    },
    onDelete: banner => setConfirmState({ open: true, target: banner }),
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت بنرها"
        description="ایجاد و مدیریت بنرهای تبلیغاتی"
        actionLabel="بنر جدید"
        actionIcon={<Add />}
        onAction={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
      />

      <DataTable
        columns={columns}
        data={sortedBanners}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="بنری ثبت نشده است"
      />

      <BannerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        banner={editing}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmState.open}
        title="حذف بنر"
        description={`آیا از حذف بنر "${confirmState.target?.title || ''}" مطمئن هستید؟`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmState({ open: false, target: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
