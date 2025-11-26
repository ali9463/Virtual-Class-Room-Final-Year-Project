import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import {
  GraduationCap,
  FileText,
  ClipboardCheck,
  Calendar,
  BookOpen,
  ArrowRight,
  Users,
  Settings
} from 'lucide-react';

const DashboardHome = () => {
  const navigate = useNavigate();

  const [dashboardData] = useState(() => ({
    totalUsers: faker.number.int({ min: 50, max: 500 }),
    totalYears: faker.number.int({ min: 3, max: 8 }),
    totalDepartments: faker.number.int({ min: 3, max: 12 }),
    pendingRequests: faker.number.int({ min: 0, max: 20 }),
    activeAdmins: faker.number.int({ min: 1, max: 5 }),
  }));

  const statsCards = [
    { title: 'Total Users', value: dashboardData.totalUsers, icon: <Users className="w-8 h-8 text-green-400" /> },
    { title: 'Academic Years', value: dashboardData.totalYears, icon: <Calendar className="w-8 h-8 text-yellow-400" /> },
    { title: 'Departments', value: dashboardData.totalDepartments, icon: <BookOpen className="w-8 h-8 text-cyan-400" /> },
    { title: 'Pending Requests', value: dashboardData.pendingRequests, icon: <ClipboardCheck className="w-8 h-8 text-purple-400" /> },
    { title: 'Active Admins', value: dashboardData.activeAdmins, icon: <Settings className="w-8 h-8 text-indigo-400" /> },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-cyan-500/20 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold mb-2">Admin Console</h2>
          <p className="text-gray-300">Manage years, departments and users from a single place.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-wrap justify-center">
          <button onClick={() => navigate('/admin/years')} className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg text-white font-semibold">Manage Years</button>
          <button onClick={() => navigate('/admin/departments')} className="bg-gray-700 px-4 py-2 rounded-lg text-white">Manage Departments</button>
          <button onClick={() => navigate('/admin/users')} className="bg-gray-700 px-4 py-2 rounded-lg text-white">Manage Users</button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">System Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:shadow-glow-cyan"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gray-700">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.title}</p>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: statsCards.length * 0.1 }}
          className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between hover:shadow-glow-cyan sm:col-span-2 lg:col-span-1"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Explore More</h3>
            <p className="text-gray-400 text-sm mb-4">Dive into your tasks and check your progress.</p>
          </div>
          <button onClick={() => navigate('/dashboard/tasks')} className="w-full mt-auto flex items-center justify-center p-3 bg-cyan-500/20 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all">
            Go to Tasks
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHome;
