import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import moment from "moment-jalaali";
import { dealApi } from "../api/services";
import useToast from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";
import JalaliDatePicker from "../components/JalaliDatePicker";

moment.loadPersian({ dialect: "persian-modern" });

const emptyDeal = {
  productId: "",
  title: "",
  discountPercent: 0,
  dealPrice: "",
  expiresAt: "",
  isActive: true
};

export default function DealsPage() {
  const queryClient = useQueryClient();
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: dealApi.list
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(emptyDeal);
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const { toast, showToast, handleClose } = useToast();

  const createMutation = useMutation({
    mutationFn: dealApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      showToast("آفر ثبت شد");
      setDialogOpen(false);
    },
    onError: (err) => showToast(err?.response?.data?.message || "خطا در ثبت آفر", "error")
  });

  const updateMutation = useMutation({
    mutationFn: dealApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      showToast("آفر به‌روزرسانی شد");
      setDialogOpen(false);
    },
    onError: (err) => showToast(err?.response?.data?.message || "خطا در ویرایش", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: dealApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      showToast("آفر حذف شد");
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast("حذف آفر ناموفق بود", "error")
  });

  useEffect(() => {
    if (editing) {
      setValues({
        productId: editing.productId || "",
        title: editing.title || "",
        discountPercent: editing.discountPercent || 0,
        dealPrice: editing.dealPrice ?? "",
        expiresAt: editing.expiresAt ? editing.expiresAt.split("T")[0] : "",
        isActive: editing.isActive ?? true
      });
    } else {
      setValues(emptyDeal);
    }
  }, [editing, dialogOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.productId) {
      showToast("شناسه محصول الزامی است", "warning");
      return;
    }
    const payload = { ...values };
    if (!payload.expiresAt) delete payload.expiresAt;
    if (!payload.dealPrice) delete payload.dealPrice;
    if (editing) {
      updateMutation.mutate({ id: editing.id || editing._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString("fa-IR") : "-");

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              پیشنهاد شگفت‌انگیز / آفرها
            </Typography>
            <Typography color="text.secondary">تخفیف‌های زمان‌دار روی محصولات</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            آفر جدید
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Card} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>محصول</TableCell>
                <TableCell>درصد تخفیف</TableCell>
                <TableCell>قیمت ویژه</TableCell>
                <TableCell>انقضا</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">آفری ثبت نشده است</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                deals.map((deal) => (
                  <TableRow key={deal.id || deal._id} hover>
                    <TableCell>{deal.productId}</TableCell>
                    <TableCell>{deal.discountPercent || 0}%</TableCell>
                    <TableCell>{deal.dealPrice ? `${deal.dealPrice} ریال` : "-"}</TableCell>
                    <TableCell>{formatDate(deal.expiresAt)}</TableCell>
                    <TableCell>{deal.isActive ? "فعال" : "غیرفعال"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditing(deal);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => setConfirmState({ open: true, target: deal })}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "ویرایش آفر" : "آفر جدید"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "grid", gap: 2 }}>
            <TextField
              label="شناسه محصول (ObjectId)"
              value={values.productId}
              onChange={(e) => setValues((p) => ({ ...p, productId: e.target.value }))}
              required
              fullWidth
            />
            <TextField
              label="عنوان آفر (اختیاری)"
              value={values.title}
              onChange={(e) => setValues((p) => ({ ...p, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="درصد تخفیف"
              type="number"
              value={values.discountPercent}
              onChange={(e) => setValues((p) => ({ ...p, discountPercent: Number(e.target.value) }))}
              fullWidth
            />
            <TextField
              label="قیمت ویژه (اختیاری)"
              type="number"
              value={values.dealPrice}
              onChange={(e) => setValues((p) => ({ ...p, dealPrice: e.target.value }))}
              fullWidth
            />
            <JalaliDatePicker
              label="تاریخ انقضا"
              value={values.expiresAt}
              onChange={(e) => setValues((p) => ({ ...p, expiresAt: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>وضعیت</InputLabel>
              <Select
                value={values.isActive ? "active" : "inactive"}
                onChange={(e) => setValues((p) => ({ ...p, isActive: e.target.value === "active" }))}
                label="وضعیت"
              >
                <MenuItem value="active">فعال</MenuItem>
                <MenuItem value="inactive">غیرفعال</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>لغو</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      <ConfirmDialog
        open={confirmState.open}
        title="حذف آفر"
        description={`آیا از حذف آفر این محصول مطمئن هستید؟`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmState({ open: false, target: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

