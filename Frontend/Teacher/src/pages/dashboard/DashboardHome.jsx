import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Video, FileText, ClipboardCheck, Calendar, BookOpen, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ClassFilter from '../../components/ClassFilter';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [filter, setFilter] = useState({ year: '', department: '', section: '' });
  const [dashboardData, setDashboardData] = useState({
    classesToday: 0,
    scheduledClasses: 0,
    students: 0,
    pendingGrading: 0,
    materials: 0,
    assignmentsCreated: 0,
  });
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:7000';

  useEffect(() => {
    if (!token) return;
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const opts = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

      // Fetch teacher resources and meetings
      const [assignResRaw, quizResRaw, lecturesResRaw, meetingsResRaw] = await Promise.all([
        fetch(`${API}/api/assignments`, opts),
        fetch(`${API}/api/quizzes`, opts),
        fetch(`${API}/api/lectures/teacher/all`, opts),
        fetch(`${API}/api/meetings/my`, opts),
      ]);

      const safeJson = async (r) => {
        try {
          if (!r || !r.ok) return [];
          return await r.json();
        } catch (e) {
          return [];
        }
      };

      const assignRes = await safeJson(assignResRaw);
      const quizRes = await safeJson(quizResRaw);
      const lecturesRes = await safeJson(lecturesResRaw);
      const meetingsRes = await safeJson(meetingsResRaw);

      const assignmentsCount = Array.isArray(assignRes) ? assignRes.length : 0;
      const quizzesCount = Array.isArray(quizRes) ? quizRes.length : 0;
      const materialsCount = Array.isArray(lecturesRes) ? lecturesRes.length : 0;

      // Compute classes today and scheduled upcoming classes from meetings
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      let classesToday = 0;
      let scheduledClasses = 0;
      if (Array.isArray(meetingsRes)) {
        meetingsRes.forEach(m => {
          const start = m.startsAt ? new Date(m.startsAt) : null;
          if (!start) return;
          if (start >= startOfToday && start < endOfToday) classesToday += 1;
          if (start >= now) scheduledClasses += 1;
        });
      }

      // Students and pending grading depend on class filter
      let studentsCount = 0;
      let pendingGrading = 0;

      if (filter.year && filter.department && filter.section) {
        const studentsResRaw = await fetch(
          `${API}/api/attendance/students?year=${encodeURIComponent(filter.year)}&department=${encodeURIComponent(filter.department)}&section=${encodeURIComponent(filter.section)}`,
          opts,
        );
        const studentsRes = await safeJson(studentsResRaw);
        studentsCount = Array.isArray(studentsRes) ? studentsRes.length : 0;

        const submissionsResRaw = await fetch(
          `${API}/api/student-assignments/class/submissions/all?year=${encodeURIComponent(filter.year)}&department=${encodeURIComponent(filter.department)}&section=${encodeURIComponent(filter.section)}`,
          opts,
        );
        const submissionsRes = await safeJson(submissionsResRaw);
        if (Array.isArray(submissionsRes)) {
          pendingGrading = submissionsRes.filter(s => s.marks === null || s.marks === undefined).length;
        }
      }

      setDashboardData({
        classesToday,
        scheduledClasses,
        students: studentsCount,
        pendingGrading,
        materials: materialsCount,
        assignmentsCreated: assignmentsCount,
      });
      setQuizzesCount(Array.isArray(quizRes) ? quizRes.length : 0);
    } catch (err) {
      console.error('Error fetching teacher dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Assignments', value: dashboardData.assignmentsCreated, icon: <FileText className="w-8 h-8 text-indigo-400" />,
      onClick: () => navigate('/dashboard/assignments'),
    },
    {
      title: 'Total Quizzes', value: quizzesCount, icon: <Video className="w-8 h-8 text-blue-400" />,
      onClick: () => navigate('/dashboard/quizzes'),
    },
    {
      title: 'Total Lectures', value: dashboardData.materials, icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
      onClick: () => navigate('/dashboard/lectures'),
    },
    {
      title: 'Pending Grading', value: dashboardData.pendingGrading, icon: <CheckCircle className="w-8 h-8 text-red-400" />,
      onClick: () => navigate('/dashboard/marks'),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <ClassFilter onFilterChange={setFilter} user={user} />

      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-cyan-500/20 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold mb-2">Instructor Dashboard</h2>
          <p className="text-gray-300">Quick actions for teachers: start class, create assignments, and grade students.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto flex-wrap justify-center">
          <button onClick={() => navigate('/dashboard/meetings')} className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg text-white font-semibold">Start Class</button>
          <button onClick={() => navigate('/dashboard/assignments')} className="bg-gray-700 px-4 py-2 rounded-lg text-white">Create Assignment</button>
          <button onClick={() => navigate('/dashboard/marks')} className="bg-gray-700 px-4 py-2 rounded-lg text-white">Marks</button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">Your Academic Overview</h2>
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
            <h3 className="text-xl font-bold text-white mb-2">Class Snapshot</h3>
            <p className="text-gray-400 text-sm mb-2">{filter.year && filter.department && filter.section ? `${filter.year}-${filter.department}-${filter.section}` : 'Select a class to view details'}</p>
            <p className="text-gray-400 text-sm">Students: <span className="font-semibold text-white">{dashboardData.students}</span></p>
            <p className="text-gray-400 text-sm">Pending Grading: <span className="font-semibold text-white">{dashboardData.pendingGrading}</span></p>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={fetchDashboardData} disabled={loading} className="flex-1 p-3 bg-cyan-500/20 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all disabled:opacity-50">Refresh</button>
            <button onClick={() => navigate('/dashboard/checkassignments')} className="flex-1 p-3 bg-gray-700 rounded-lg text-white">View Submissions</button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHome;
