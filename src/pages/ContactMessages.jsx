import { Box } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { contactApi } from '../api/services';
import useToast from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import ContactFilters from '../components/contact/ContactFilters';
import ViewMessageDialog from '../components/contact/ViewMessageDialog';
import ReplyDialog from '../components/contact/ReplyDialog';
import { useContactTable } from '../components/contact/ContactTable';
import { Snackbar, Alert } from '@mui/material';

export default function ContactMessagesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [viewDialog, setViewDialog] = useState({ open: false, message: null });
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    message: null,
    status: 'read',
  });
  const [replyMessage, setReplyMessage] = useState('');
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const { toast, showToast, handleClose } = useToast();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['contactMessages', statusFilter, searchQuery],
    queryFn: () =>
      contactApi.list({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: contactApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      showToast('وضعیت پیام به‌روزرسانی شد');
      setStatusDialog({ open: false, message: null, status: 'read' });
      setReplyMessage('');
    },
    onError: error =>
      showToast(error?.response?.data?.message || 'خطا در به‌روزرسانی وضعیت', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: contactApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      showToast('پیام حذف شد');
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast('حذف پیام ناموفق بود', 'error'),
  });

  const handleView = message => {
    setViewDialog({ open: true, message });
    if (message.status === 'new') {
      updateStatusMutation.mutate({ id: message.id, status: 'read' });
    }
  };

  const handleStatusChange = (message, newStatus) => {
    if (newStatus === 'replied') {
      setStatusDialog({ open: true, message, status: newStatus });
    } else {
      updateStatusMutation.mutate({ id: message.id, status: newStatus });
    }
  };

  const handleDeleteRequest = message => {
    setConfirmState({ open: true, target: message });
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  const handleReplySubmit = e => {
    e.preventDefault();
    if (!statusDialog.message || !replyMessage.trim()) {
      showToast('لطفاً متن پاسخ را وارد کنید', 'warning');
      return;
    }
    updateStatusMutation.mutate({
      id: statusDialog.message.id,
      status: 'replied',
      reply: replyMessage.trim(),
    });
  };

  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedMessages = [...messages].sort((a, b) => {
    if (!orderBy) return 0;

    let aValue, bValue;

    switch (orderBy) {
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'email':
        aValue = a.email || '';
        bValue = b.email || '';
        break;
      case 'subject':
        aValue = a.subject || '';
        bValue = b.subject || '';
        break;
      case 'createdAt':
        aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
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
    { id: 'name', label: 'نام', sortable: true },
    { id: 'email', label: 'ایمیل', sortable: true },
    { id: 'subject', label: 'موضوع', sortable: true },
    { id: 'createdAt', label: 'تاریخ', sortable: true },
    { id: 'status', label: 'وضعیت', sortable: true },
    { id: 'actions', label: 'عملیات', align: 'right', sortable: false },
  ];

  const { renderRow } = useContactTable({
    messages: sortedMessages,
    onView: handleView,
    onStatusChange: handleStatusChange,
    onDelete: handleDeleteRequest,
  });

  return (
    <Box>
      <PageHeader
        title="پیام‌های تماس"
        description="مدیریت و پاسخ به پیام‌های دریافتی از مشتریان"
      />

      <ContactFilters
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
      />

      <DataTable
        columns={columns}
        data={sortedMessages}
        isLoading={isLoading}
        renderRow={renderRow}
        orderBy={orderBy}
        order={order}
        onRequestSort={handleRequestSort}
        emptyMessage="پیامی یافت نشد"
      />

      <ViewMessageDialog
        open={viewDialog.open}
        message={viewDialog.message}
        onClose={() => setViewDialog({ open: false, message: null })}
      />

      <ReplyDialog
        open={statusDialog.open}
        message={statusDialog.message}
        replyText={replyMessage}
        onChange={e => setReplyMessage(e.target.value)}
        onSubmit={handleReplySubmit}
        onClose={() => {
          if (!updateStatusMutation.isPending) {
            setStatusDialog({ open: false, message: null, status: 'read' });
            setReplyMessage('');
          }
        }}
        loading={updateStatusMutation.isPending}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmState.open}
        title="حذف پیام"
        description={`آیا از حذف پیام "${confirmState.target?.subject || ''}" مطمئن هستید؟`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmState({ open: false, target: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
