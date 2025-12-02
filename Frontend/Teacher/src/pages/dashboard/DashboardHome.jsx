import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import {
  GraduationCap,
  Video,
  FileText,
  ClipboardCheck,
  Calendar,
  BookOpen,
  PlayCircle,
  Award,
  ArrowRight,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ClassFilter from '../../components/ClassFilter';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState({ year: '', department: '', section: '' });

  const [dashboardData] = useState(() => ({
    classesToday: faker.number.int({ min: 0, max: 3 }),
    scheduledClasses: faker.number.int({ min: 1, max: 10 }),
    students: faker.number.int({ min: 20, max: 120 }),
    pendingGrading: faker.number.int({ min: 0, max: 30 }),
    materials: faker.number.int({ min: 5, max: 40 }),
    assignmentsCreated: faker.number.int({ min: 1, max: 20 }),
  }));

  const statsCards = [
    { title: 'Classes Today', value: dashboardData.classesToday, icon: <Calendar className="w-8 h-8 text-yellow-400" /> },
    { title: 'Scheduled Classes', value: dashboardData.scheduledClasses, icon: <Video className="w-8 h-8 text-blue-400" /> },
    { title: 'Students', value: dashboardData.students, icon: <Users className="w-8 h-8 text-green-400" /> },
    { title: 'Pending Grading', value: dashboardData.pendingGrading, icon: <ClipboardCheck className="w-8 h-8 text-purple-400" /> },
    { title: 'Materials', value: dashboardData.materials, icon: <BookOpen className="w-8 h-8 text-cyan-400" /> },
    { title: 'Assignments', value: dashboardData.assignmentsCreated, icon: <FileText className="w-8 h-8 text-indigo-400" /> },
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
          <button onClick={() => navigate('/classroom')} className="bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg text-white font-semibold">Start Class</button>
          <button onClick={() => navigate('/dashboard/tasks')} className="bg-gray-700 px-4 py-2 rounded-lg text-white">Create Assignment</button>
          <button onClick={() => navigate('/dashboard/marks')} className="bg-gray-700 px-4 py-2 rounded-lg text-white">Gradebook</button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">Your Academic Overview</h2>
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
