import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  GraduationCap,
  Video,
  FileText,
  ClipboardCheck,
  Calendar,
  BookOpen,
  PlayCircle,
  Award,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Notifications from '../../components/Notifications';
import useNotifications from '../../hooks/useNotifications';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  useNotifications(user);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:7000';

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assignments
      const assignmentsRes = await axios.get(`${API}/api/student-assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const assignments = assignmentsRes.data || [];

      // Fetch quizzes
      const quizzesRes = await axios.get(`${API}/api/student-quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const quizzes = quizzesRes.data || [];

      // Fetch lectures
      const lecturesRes = await axios.get(`${API}/api/lectures/student/my-lectures`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lectures = lecturesRes.data || [];

      setDashboardData({
        assignments: assignments.length,
        quizzes: quizzes.length,
        attendance: 0,
        averageMarks: 0,
        lectureNotes: lectures.length,
        lectureVideos: 0,
        subjects: new Set([
          ...assignments.map(a => a.courseName),
          ...quizzes.map(q => q.courseName),
        ]).size,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setDashboardData({
        assignments: 0,
        quizzes: 0,
        attendance: 0,
        averageMarks: 0,
        lectureNotes: 0,
        lectureVideos: 0,
        subjects: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Assignments',
      value: dashboardData?.assignments || 0,
      icon: <FileText className="w-8 h-8 text-blue-400" />,
      onClick: () => navigate('/dashboard/assignments'),
      color: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Quizzes',
      value: dashboardData?.quizzes || 0,
      icon: <ClipboardCheck className="w-8 h-8 text-green-400" />,
      onClick: () => navigate('/dashboard/quizzes'),
      color: 'bg-green-500/10 border-green-500/20'
    },
    {
      title: 'Attendance',
      value: `${dashboardData?.attendance || 0}%`,
      icon: <Calendar className="w-8 h-8 text-yellow-400" />,
      onClick: () => navigate('/dashboard/attendance'),
      color: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      title: 'Average Marks',
      value: `${dashboardData?.averageMarks || 0}%`,
      icon: <Award className="w-8 h-8 text-purple-400" />,
      onClick: () => navigate('/dashboard/marks'),
      color: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Lecture Notes',
      value: dashboardData?.lectureNotes || 0,
      icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
      onClick: () => navigate('/dashboard/lectures'),
      color: 'bg-cyan-500/10 border-cyan-500/20'
    },
    {
      title: 'Lecture Videos',
      value: dashboardData?.lectureVideos || 0,
      icon: <PlayCircle className="w-8 h-8 text-red-400" />,
      onClick: () => navigate('/dashboard/recordings'),
      color: 'bg-red-500/10 border-red-500/20'
    },
    {
      title: 'Subjects',
      value: dashboardData?.subjects || 0,
      icon: <GraduationCap className="w-8 h-8 text-indigo-400" />,
      onClick: () => navigate('/dashboard/classes'),
      color: 'bg-indigo-500/10 border-indigo-500/20'
    },
  ];

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-cyan-500/20 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold mb-2">Ready for your next class?</h2>
          <p className="text-gray-300">Your live virtual classroom is just one click away.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/classroom')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:scale-105 text-white flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Join Class
            <Video className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            {/* Notifications dropdown */}
            <Notifications />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Academic Overview</h2>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="text-cyan-400 hover:text-cyan-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6">
        <div className="bg-gray-800/50 p-4 rounded-xl border border-cyan-500/20 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">AI Chatbot</h3>
            <p className="text-gray-400 text-sm">Ask questions about your courses, grades or upload a file for context. Open the full chat for detailed help.</p>
          </div>
          <div>
            <button onClick={() => navigate('/dashboard/aichatbot')} className="px-4 py-2 bg-cyan-600 rounded-lg text-white">Open Chat</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={stat.onClick}
            className={`text-left bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border ${stat.color} hover:border-opacity-100 transition-all hover:shadow-lg transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gray-700">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.title}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardHome;
