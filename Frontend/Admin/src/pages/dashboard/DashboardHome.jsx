import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GraduationCap, Calendar, BookOpen, Users, Settings, FileText } from 'lucide-react';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalMeetings: 0,
    totalDepartments: 0,
    totalYears: 0,
    totalSections: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:7000';

  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, yearsRes, deptsRes, sectionsRes, meetingsRes] = await Promise.all([
        axios.get(`${API}/api/admin/users`).then(r => r.data),
        axios.get(`${API}/api/admin/years`).then(r => r.data),
        axios.get(`${API}/api/admin/departments`).then(r => r.data),
        axios.get(`${API}/api/admin/sections`).then(r => r.data),
        axios.get(`${API}/api/meetings/admin`).then(r => r.data),
      ]);

      const totalStudents = Array.isArray(usersRes) ? usersRes.filter(u => u.role === 'student').length : 0;
      const totalTeachers = Array.isArray(usersRes) ? usersRes.filter(u => u.role === 'teacher').length : 0;
      const totalMeetings = Array.isArray(meetingsRes) ? meetingsRes.length : 0;
      const totalDepartments = Array.isArray(deptsRes) ? deptsRes.length : 0;
      const totalYears = Array.isArray(yearsRes) ? yearsRes.length : 0;
      const totalSections = Array.isArray(sectionsRes) ? sectionsRes.length : 0;

      setCounts({ totalStudents, totalTeachers, totalMeetings, totalDepartments, totalYears, totalSections });
    } catch (err) {
      console.error('Failed to load admin counts', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: 'Total Students', value: counts.totalStudents, icon: <Users className="w-8 h-8 text-green-400" /> ,
      onClick: () => navigate('/dashboard/students'),
    },
    { title: 'Total Teachers', value: counts.totalTeachers, icon: <GraduationCap className="w-8 h-8 text-indigo-400" /> 
    , onClick: () => navigate('/dashboard/teachers'),
    },
    { title: 'Total Meetings', value: counts.totalMeetings, icon: <Calendar className="w-8 h-8 text-yellow-400" /> 
    , onClick: () => navigate('/dashboard/meetings'),
    },
    { title: 'Departments', value: counts.totalDepartments, icon: <BookOpen className="w-8 h-8 text-cyan-400" /> 
    , onClick: () => navigate('/dashboard/departments'),
    },
    { title: 'Academic Years', value: counts.totalYears, icon: <FileText className="w-8 h-8 text-sky-400" />
    , onClick: () => navigate('/dashboard/departments'),
     },

  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-cyan-500/20 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold mb-2">Admin Console</h2>
          <p className="text-gray-300">Manage departments and students from a single place.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-wrap justify-center">
          <button onClick={() => navigate('/dashboard/departments')} className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg text-white font-semibold">Manage Departments</button>
          <button onClick={() => navigate('/dashboard/teachers')} className="bg-gray-700 px-4 py-2 rounded-lg text-white">Manage Teachers</button>
          <button onClick={() => navigate('/dashboard/students')} className="bg-gray-700 px-4 py-2 rounded-lg text-white">Manage Students</button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">System Overview</h2>
      {error && <div className="bg-red-900/30 border border-red-500/50 p-3 rounded mb-4 text-sm text-red-200">{error}</div>}
      {loading && <div className="text-sm text-gray-300 mb-4">Loading...</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={stat.onClick}
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
            <h3 className="text-xl font-bold text-white mb-2">Quick Actions</h3>
            <p className="text-gray-400 text-sm mb-4">Manage core entities quickly from here.</p>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <button onClick={() => navigate('/dashboard/students')} className="w-full py-2 bg-cyan-600 rounded text-white">Manage Students</button>
            <div className="flex gap-2 mt-2">
              <button onClick={() => navigate('/dashboard/departments')} className="flex-1 py-2 bg-gray-700 rounded text-white">Departments</button>
             
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHome;
