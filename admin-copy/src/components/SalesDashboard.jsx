import React, { useState, useEffect } from 'react';
import { backendUrl } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const SalesDashboard = ({ token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Live auto-refresh via polling (every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchAnalytics();
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/analytics`, {
        headers: { token }
      });
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  // Prepare chart data
  const categoryChartData = analytics?.categorySales?.map((c) => ({
    category: c.category,
    Successful: c.revenue,
    Cancelled: c.cancelledRevenue
  })) || [];

  const orderStatusPieData = analytics ? [
    { name: 'Successful Orders', value: analytics.summary.successfulOrders, color: '#10b981' },
    { name: 'Cancelled Orders', value: analytics.summary.cancelledOrders, color: '#ef4444' }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Sales Dashboard</h2>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
        >
          Refresh Data
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(analytics.summary.totalRevenue)}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-lg font-semibold text-blue-600">{analytics.summary.totalOrders}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Successful Orders</p>
          <p className="text-lg font-semibold text-green-600">{analytics.summary.successfulOrders}</p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Cancelled Orders</p>
          <p className="text-lg font-semibold text-red-600">{analytics.summary.cancelledOrders}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Avg Order Value</p>
          <p className="text-lg font-semibold text-purple-600">{formatCurrency(analytics.summary.averageOrderValue)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Category Revenue (Bar) */}
        <div className="col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-indigo-100">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Revenue by Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 8, right: 16, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="Successful" fill="#34d399" radius={[4,4,0,0]} />
                <Bar dataKey="Cancelled" fill="#f87171" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status (Pie) */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Order Status Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={orderStatusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {orderStatusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales by Category Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Sales by Category</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Successful Revenue</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Successful Orders</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Successful Qty</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Cancelled Revenue</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Cancelled Orders</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Cancelled Qty</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.categorySales.map((category, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{category.category}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right text-green-600">{formatCurrency(category.revenue)}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{category.orders}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{category.quantity}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right text-red-600">{formatCurrency(category.cancelledRevenue)}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{category.cancelledOrders}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{category.cancelledQuantity}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right font-semibold">{formatCurrency(category.revenue + category.cancelledRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products Table */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">Product Name</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Successful Revenue</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Successful Orders</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Successful Qty</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Cancelled Revenue</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Cancelled Orders</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Cancelled Qty</th>
                <th className="border border-gray-200 px-4 py-2 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.slice(0, 10).map((product, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{product.name}</td>
                  <td className="border border-gray-200 px-4 py-2">{product.category}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right text-green-600">{formatCurrency(product.revenue)}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{product.orders}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{product.quantity}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right text-red-600">{formatCurrency(product.cancelledRevenue)}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{product.cancelledOrders}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right">{product.cancelledQuantity}</td>
                  <td className="border border-gray-200 px-4 py-2 text-right font-semibold">{formatCurrency(product.revenue + product.cancelledRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
