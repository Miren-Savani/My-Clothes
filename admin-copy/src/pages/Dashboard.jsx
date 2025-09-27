import React from 'react';
import SalesDashboard from '../components/SalesDashboard';

const Dashboard = ({ token }) => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Complete sales analytics and performance tracking</p>
      </div>
      <SalesDashboard token={token} />
    </div>
  );
};

export default Dashboard;
