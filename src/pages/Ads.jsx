import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adsApi } from '../api/services';
import useToast from '../hooks/useToast';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import AdDialog from '../components/ads/AdDialog';
import { useAdTable } from '../components/ads/AdTable';
import { Add } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

export default function AdsPage() {
  const queryClient = useQueryClient();
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['ads'],
    queryFn: () => adsApi.list(),
  });
  const { toast, showToast, handleClose } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');

  const createMutation = useMutation({
    mutationFn: adsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      showToast('تبلیغ جدید ذخیره شد');
      setDialogOpen(false);
    },
    onError: () => showToast('ایجاد تبلیغ با خطا مواجه شد', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: adsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      showToast('تبلیغ ویرایش شد');
      setDialogOpen(false);
    },
    onError: () => showToast('ویرایش تبلیغ ناموفق بود', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: adsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      showToast('تبلیغ حذف شد');
    },
    onError: () => showToast('حذف تبلیغ ناموفق بود', 'error'),
  });

  const handleSubmit = values => {
    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id || editingAd._id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedAds = [...ads].sort((a, b) => {
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
      case 'priority':
        aValue = Number(a.priority) || 0;
        bValue = Number(b.priority) || 0;
        break;
      case 'active':
        aValue = a.active ? 1 : 0;
        bValue = b.active ? 1 : 0;
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
    { id: 'ctaLabel', label: 'متن دکمه', sortable: false },
    { id: 'priority', label: 'اولویت', sortable: true },
    { id: 'active', label: 'فعال', sortable: true },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useAdTable({
    ads: sortedAds,
    onEdit: ad => {
      setEditingAd(ad);
      setDialogOpen(true);
    },
    onDelete: adId => deleteMutation.mutate(adId),
  });

  return (
    <Box>
      <PageHeader
        title="مدیریت تبلیغات"
        description="ایجاد و مدیریت تبلیغات سایت"
        actionLabel="تبلیغ جدید"
        actionIcon={<Add />}
        onAction={() => {
          setEditingAd(null);
          setDialogOpen(true);
        }}
      />

      <DataTable
        columns={columns}
        data={sortedAds}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="تبلیغی ثبت نشده است"
      />

      <AdDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        ad={editingAd}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
