import { Box, Card, CardContent, LinearProgress, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useQueries } from "@tanstack/react-query";
import { formatPrice } from "../utils/format";
import StatCard from "../components/StatCard";
import {
  blogApi,
  orderApi,
  productApi,
  userApi
} from "../api/services";
import { TrendingUp, Storefront, People, Article } from "@mui/icons-material";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import dayjs from "dayjs";

const queriesConfig = [
  { key: "products", fn: productApi.list },
  { key: "orders", fn: () => orderApi.list() },
  { key: "users", fn: userApi.list },
  { key: "blogs", fn: blogApi.list }
];

const chartDataFromOrders = (orders = []) => {
  const grouped = orders.reduce((acc, order) => {
    const month = dayjs(order.createdAt).locale("fa").format("YYYY/MM");
    acc[month] = (acc[month] || 0) + order.total;
    return acc;
  }, {});
  return Object.entries(grouped)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => (a.month > b.month ? 1 : -1));
};

export default function DashboardPage() {
  const results = useQueries({
    queries: queriesConfig.map((config) => ({
      queryKey: [config.key],
      queryFn: config.fn
    }))
  });

  const loading = results.some((result) => result.isLoading);
  const [products, orders, users, blogs] = results.map((result) => result.data || []);

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

  return (
    <Box>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="تعداد محصولات"
            value={`${products.length} کالا`}
            icon={Storefront}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="مجموع سفارش‌ها"
            value={`${orders.length} سفارش`}
            icon={TrendingUp}
            color="#22c55e"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="کاربران ثبت‌شده"
            value={`${users.length} نفر`}
            icon={People}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="مقالات بلاگ"
            value={`${blogs.length} مقاله`}
            icon={Article}
            color="#a855f7"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" mb={2} fontWeight={700}>
                رشد فروش ماهانه
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartDataFromOrders(orders)}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPrice(value)} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" mb={1} fontWeight={700}>
                خلاصه فروش
              </Typography>
              <Typography variant="h4" color="primary" fontWeight={700}>
                {formatPrice(totalRevenue)}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                مجموع درآمد ثبت‌شده در همه سفارش‌ها
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <SummaryRow label="محصولات فعال" value={`${products.length}`} />
                <SummaryRow label="سفارش‌های معلق" value={orders.filter((o) => o.status === "pending").length} />
                <SummaryRow label="مقالات منتشرشده" value={blogs.filter((b) => b.published).length} />
                <SummaryRow label="کاربران ادمین" value={users.filter((u) => u.role === "admin").length} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={600}>{value}</Typography>
    </Box>
  );
}

