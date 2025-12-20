import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useQueries } from '@tanstack/react-query';
import { formatPrice } from '../utils/format';
import StatCard from '../components/StatCard';
import { blogApi, orderApi, productApi, userApi } from '../api/services';
import { TrendingUp, Storefront, People, Article } from '@mui/icons-material';
import {
  Bar,
  Line,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ComposedChart,
} from 'recharts';
import dayjs from 'dayjs';

const queriesConfig = [
  { key: 'products', fn: productApi.list },
  { key: 'orders', fn: () => orderApi.list() },
  { key: 'users', fn: userApi.list },
  { key: 'blogs', fn: blogApi.list },
];

const chartDataFromOrders = (orders = []) => {
  const grouped = orders.reduce((acc, order) => {
    const month = dayjs(order.createdAt).locale('fa').format('YYYY/MM');
    if (!acc[month]) {
      acc[month] = { month, total: 0, count: 0 };
    }
    acc[month].total += order.total;
    acc[month].count += 1;
    return acc;
  }, {});
  return Object.values(grouped)
    .map(({ month, total, count }) => ({
      month,
      total: Math.round(total),
      count,
    }))
    .sort((a, b) => (a.month > b.month ? 1 : -1));
};

export default function DashboardPage() {
  const results = useQueries({
    queries: queriesConfig.map(config => ({
      queryKey: [config.key],
      queryFn: config.fn,
    })),
  });

  const loading = results.some(result => result.isLoading);
  const [products, orders, users, blogs] = results.map(
    result => result.data || []
  );

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

  // داده برای نمودار دایره‌ای
  const pieData = [
    { name: 'محصولات', value: products.length, color: '#f59e0b' },
    { name: 'سفارش‌ها', value: orders.length, color: '#22c55e' },
    { name: 'کاربران', value: users.length, color: '#3b82f6' },
    { name: 'مقالات', value: blogs.length, color: '#a855f7' },
  ];

  return (
    <Box sx={{ marginLeft: 0, width: 1 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {/* ردیف کارت‌های آماری */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          width: '100%',
        }}
      >
        <Box
          sx={{
            flex: '1 1 calc(25% - 24px)',
            minWidth: { xs: '100%', md: 'calc(25% - 24px)' },
          }}
        >
          <StatCard
            title="تعداد محصولات"
            value={`${products.length} کالا`}
            icon={Storefront}
            color="#f59e0b"
          />
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(25% - 24px)',
            minWidth: { xs: '100%', md: 'calc(25% - 24px)' },
          }}
        >
          <StatCard
            title="مجموع سفارش‌ها"
            value={`${orders.length} سفارش`}
            icon={TrendingUp}
            color="#22c55e"
          />
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(25% - 24px)',
            minWidth: { xs: '100%', md: 'calc(25% - 24px)' },
          }}
        >
          <StatCard
            title="کاربران ثبت‌شده"
            value={`${users.length} نفر`}
            icon={People}
            color="#3b82f6"
          />
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(25% - 24px)',
            minWidth: { xs: '100%', md: 'calc(25% - 24px)' },
          }}
        >
          <StatCard
            title="مقالات بلاگ"
            value={`${blogs.length} مقاله`}
            icon={Article}
            color="#a855f7"
          />
        </Box>
      </Box>

      {/* ردیف اول: نمودار فروش ماهانه و توزیع محتوا */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          width: '100%',
          mt: 1,
        }}
      >
        <Box
          sx={{
            flex: '1 1 calc(50% - 12px)',
            minWidth: { xs: '100%', md: 'calc(50% - 12px)' },
          }}
        >
          <Card
            sx={{
              borderRadius: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)',
              },
              width: '100%',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  width: '100%',
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: '#1a1a1a' }}
                >
                  آمار فروش ماهانه
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: '#f59e0b',
                        boxShadow: '0 2px 4px rgba(245,158,11,0.3)',
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      درآمد
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: '#3b82f6',
                        boxShadow: '0 2px 4px rgba(59,130,246,0.3)',
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      تعداد سفارش
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={chartDataFromOrders(orders)}>
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#f59e0b"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#666', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    height={60}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#666', fontSize: 12 }}
                    tickFormatter={value => formatPrice(value)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#666', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      padding: '12px',
                    }}
                    formatter={(value, name) => {
                      if (name === 'total')
                        return [formatPrice(value), 'درآمد'];
                      if (name === 'count') return [value, 'تعداد سفارش'];
                      return [value, name];
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="total"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{
                      fill: '#3b82f6',
                      r: 5,
                      strokeWidth: 2,
                      stroke: '#fff',
                    }}
                    activeDot={{ r: 7 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(50% - 12px)',
            minWidth: { xs: '100%', md: 'calc(50% - 12px)' },
          }}
        >
          <Card
            sx={{
              borderRadius: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                mb={3}
                fontWeight={700}
                sx={{ color: '#1a1a1a' }}
              >
                توزیع محتوا
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      padding: '10px',
                    }}
                    formatter={(value, name) => [`${value} مورد`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  mt: 2,
                  justifyContent: 'center',
                }}
              >
                {pieData.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: item.color,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {item.name}: {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* ردیف دوم: خلاصه مالی، آمار فروش و آمار محتوا */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          width: '100%',
          mt: 1,
        }}
      >
        <Box
          sx={{
            flex: '1 1 calc(33.333% - 16px)',
            minWidth: { xs: '100%', md: 'calc(33.333% - 16px)' },
          }}
        >
          <Card
            sx={{
              borderRadius: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                mb={2}
                fontWeight={700}
                sx={{ color: '#1a1a1a' }}
              >
                خلاصه مالی
              </Typography>
              <Box
                sx={{
                  mb: 3,
                  p: 3,
                  background:
                    'linear-gradient(135deg, #f59e0b15 0%, #f59e0b08 100%)',
                  borderRadius: 1,
                  border: '1px solid rgba(245,158,11,0.2)',
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={1}
                  sx={{ fontWeight: 500 }}
                >
                  مجموع درآمد
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ color: '#f59e0b' }}
                  fontWeight={700}
                >
                  {formatPrice(totalRevenue)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <SummaryRow
                  label="محصولات فعال"
                  value={`${products.length}`}
                  icon="📦"
                />
                <SummaryRow
                  label="سفارش‌های معلق"
                  value={orders.filter(o => o.status === 'pending').length}
                  icon="⏳"
                />
                <SummaryRow
                  label="مقالات منتشرشده"
                  value={blogs.filter(b => b.published).length}
                  icon="📝"
                />
                <SummaryRow
                  label="کاربران ادمین"
                  value={users.filter(u => u.role === 'admin').length}
                  icon="👤"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(33.333% - 16px)',
            minWidth: { xs: '100%', md: 'calc(33.333% - 16px)' },
          }}
        >
          <Card
            sx={{
              borderRadius: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                mb={3}
                fontWeight={700}
                sx={{ color: '#1a1a1a' }}
              >
                آمار فروش
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StatBox
                  label="میانگین ارزش سفارش"
                  value={
                    orders.length > 0
                      ? formatPrice(totalRevenue / orders.length)
                      : formatPrice(0)
                  }
                  color="#f59e0b"
                  icon="💰"
                />
                <StatBox
                  label="نرخ تبدیل"
                  value={`${
                    orders.length > 0 && users.length > 0
                      ? ((orders.length / users.length) * 100).toFixed(1)
                      : 0
                  }%`}
                  color="#22c55e"
                  icon="📈"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box
          sx={{
            flex: '1 1 calc(33.333% - 16px)',
            minWidth: { xs: '100%', md: 'calc(33.333% - 16px)' },
          }}
        >
          <Card
            sx={{
              borderRadius: 1,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              height: '100%',
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                mb={3}
                fontWeight={700}
                sx={{ color: '#1a1a1a' }}
              >
                آمار محتوا
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StatBox
                  label="محصولات به ازای هر کاربر"
                  value={`${
                    users.length > 0
                      ? (products.length / users.length).toFixed(1)
                      : 0
                  }`}
                  color="#3b82f6"
                  icon="🛍️"
                />
                <StatBox
                  label="نرخ انتشار مقالات"
                  value={`${
                    blogs.length > 0
                      ? (
                          (blogs.filter(b => b.published).length /
                            blogs.length) *
                          100
                        ).toFixed(0)
                      : 0
                  }%`}
                  color="#a855f7"
                  icon="📰"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

function SummaryRow({ label, value, icon }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderRadius: 1,
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,249,250,0.8) 100%)',
        border: '1px solid rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.02)',
          transform: 'translateX(4px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {icon && (
          <Typography
            sx={{
              fontSize: '1.3rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          >
            {icon}
          </Typography>
        )}
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ fontWeight: 500, fontSize: '0.9rem' }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        fontWeight={700}
        variant="h6"
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function StatBox({ label, value, color, icon }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 1,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`,
        transition: 'all 0.3s ease',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
        },
        '&:hover': {
          background: `linear-gradient(135deg, ${color}20 0%, ${color}12 100%)`,
          transform: 'translateY(-6px)',
          boxShadow: `0 8px 24px ${color}50`,
          borderColor: `${color}50`,
        },
        cursor: 'pointer',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        {icon && (
          <Typography
            sx={{
              fontSize: '1.8rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
            }}
          >
            {icon}
          </Typography>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.875rem', fontWeight: 500 }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          color,
          textShadow: `0 2px 4px ${color}30`,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
