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
import { brandApi } from "../api/services";
import useToast from "../hooks/useToast";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyBrand = {
  name: "",
  logo: "",
  logoFile: null,
  logoFilePreview: "",
  link: "",
  order: 0,
  isActive: true
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: brandApi.list
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(emptyBrand);
  const [confirmState, setConfirmState] = useState({ open: false, target: null });
  const { toast, showToast, handleClose } = useToast();

  const createMutation = useMutation({
    mutationFn: brandApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      showToast("برند ثبت شد");
      setDialogOpen(false);
    },
    onError: (err) => showToast(err?.response?.data?.message || "خطا در ثبت برند", "error")
  });

  const updateMutation = useMutation({
    mutationFn: brandApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      showToast("برند به‌روزرسانی شد");
      setDialogOpen(false);
    },
    onError: (err) => showToast(err?.response?.data?.message || "خطا در ویرایش", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: brandApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      showToast("برند حذف شد");
      setConfirmState({ open: false, target: null });
    },
    onError: () => showToast("حذف برند ناموفق بود", "error")
  });

  useEffect(() => {
    if (editing) {
      setValues({
        name: editing.name || "",
        logo: editing.logo || "",
        logoFile: null,
        logoFilePreview: editing.logo ? (editing.logo.startsWith("http") ? editing.logo : `${API_BASE}${editing.logo}`) : "",
        link: editing.link || "",
        order: editing.order ?? 0,
        isActive: editing.isActive ?? true
      });
    } else {
      setValues(emptyBrand);
    }
  }, [editing, dialogOpen]);

  useEffect(() => {
    if (!values.logoFilePreview) return;
    const previewUrl = values.logoFilePreview;
    if (previewUrl.startsWith("blob:")) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [values.logoFilePreview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.name || !values.logo) {
      showToast("نام و لوگو الزامی است", "warning");
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id || editing._id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleDeleteConfirm = () => {
    if (confirmState.target) {
      deleteMutation.mutate(confirmState.target.id || confirmState.target._id);
    }
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              مدیریت برندها
            </Typography>
            <Typography color="text.secondary">لوگو و لینک برندها را تنظیم کنید</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            برند جدید
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
                <TableCell>نام</TableCell>
                <TableCell>لوگو</TableCell>
                <TableCell>ترتیب</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell align="right">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">برندی ثبت نشده است</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow key={brand.id || brand._id} hover>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>
                      <img src={brand.logo} alt={brand.name} style={{ height: 32 }} />
                    </TableCell>
                    <TableCell>{brand.order ?? 0}</TableCell>
                    <TableCell>{brand.isActive ? "فعال" : "غیرفعال"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditing(brand);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => setConfirmState({ open: true, target: brand })}>
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
        <DialogTitle>{editing ? "ویرایش برند" : "برند جدید"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: "grid", gap: 2 }}>
            <TextField
              label="نام برند"
              value={values.name}
              onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
              required
              fullWidth
            />
            <Box>
              <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                آپلود لوگو
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const preview = URL.createObjectURL(file);
                      setValues((p) => ({
                        ...p,
                        logoFile: file,
                        logoFilePreview: preview,
                        logo: ""
                      }));
                    }
                  }}
                />
              </Button>
              {values.logoFilePreview && (
                <Box sx={{ mb: 2 }}>
                  <Box
                    component="img"
                    src={values.logoFilePreview}
                    alt="preview"
                    sx={{ width: "100%", maxHeight: 150, objectFit: "contain", borderRadius: 2 }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setValues((p) => ({ ...p, logoFile: null, logoFilePreview: "" }))}
                    sx={{ mt: 1 }}
                  >
                    حذف لوگو
                  </Button>
                </Box>
              )}
              <TextField
                label="یا آدرس لوگو (URL)"
                value={values.logo}
                onChange={(e) => setValues((p) => ({ ...p, logo: e.target.value, logoFile: null, logoFilePreview: "" }))}
                fullWidth
                helperText="در صورت آپلود لوگو نیازی به وارد کردن URL نیست"
              />
            </Box>
            <TextField
              label="لینک (اختیاری)"
              value={values.link}
              onChange={(e) => setValues((p) => ({ ...p, link: e.target.value }))}
              fullWidth
            />
            <TextField
              label="ترتیب نمایش"
              type="number"
              value={values.order}
              onChange={(e) => setValues((p) => ({ ...p, order: Number(e.target.value) }))}
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
        title="حذف برند"
        description={`آیا از حذف برند \"${confirmState.target?.name || ""}\" مطمئن هستید؟`}
        confirmText="حذف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmState({ open: false, target: null })}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

