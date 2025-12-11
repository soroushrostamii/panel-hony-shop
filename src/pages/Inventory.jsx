import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { inventoryApi } from "../api/services";
import useToast from "../hooks/useToast";

const operations = [
  { value: "set", label: "تنظیم مقدار دقیق" },
  { value: "increase", label: "افزایش" },
  { value: "decrease", label: "کاهش" }
];

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: inventoryApi.list
  });

  const { toast, showToast, handleClose } = useToast();
  const [formState, setFormState] = useState({});

  const adjustMutation = useMutation({
    mutationFn: inventoryApi.adjust,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("موجودی به‌روزرسانی شد");
    },
    onError: () => showToast("خطا در به‌روزرسانی موجودی", "error")
  });

  const handleChange = (productId, field, value) => {
    setFormState((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleSubmit = (productId) => {
    const payload = formState[productId];
    if (!payload?.quantity) {
      showToast("لطفاً مقدار را وارد کنید", "warning");
      return;
    }
    adjustMutation.mutate({
      productId,
      quantity: Number(payload.quantity),
      operation: payload.operation || "set"
    });
  };

  return (
    <Box>
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>
            مدیریت موجودی
          </Typography>
          <Typography color="text.secondary">
            کنترل لحظه‌ای موجودی و تنظیم انبار محصولات
          </Typography>
        </CardContent>
      </Card>

      {isLoading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Card} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>نام محصول</TableCell>
                <TableCell>موجودی فعلی</TableCell>
                <TableCell>مقدار جدید</TableCell>
                <TableCell>نوع عملیات</TableCell>
                <TableCell>اقدام</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const state = formState[product.id] || { operation: "set", quantity: "" };
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={state.quantity}
                        onChange={(event) =>
                          handleChange(product.id, "quantity", event.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={state.operation}
                        onChange={(event) =>
                          handleChange(product.id, "operation", event.target.value)
                        }
                      >
                        {operations.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleSubmit(product.id)}
                        disabled={adjustMutation.isPending}
                      >
                        ثبت
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={toast.severity} onClose={handleClose} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

