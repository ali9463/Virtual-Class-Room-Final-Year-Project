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
  ArrowRight
} from 'lucide-react';

const DashboardHome = () => {
  const navigate = useNavigate();
  
  const [dashboardData] = useState(() => ({
    assignments: faker.number.int({ min: 5, max: 15 }),
    quizzes: faker.number.int({ min: 3, max: 10 }),
    attendance: faker.number.float({ min: 75, max: 98, fractionDigits: 1 }),
    averageMarks: faker.number.float({ min: 70, max: 95, fractionDigits: 1 }),
    lectureNotes: faker.number.int({ min: 20, max: 50 }),
    lectureVideos: faker.number.int({ min: 15, max: 40 }),
    subjects: faker.number.int({ min: 4, max: 8 }),
  }));

  const statsCards = [
    { title: 'Total Assignments', value: dashboardData.assignments, icon: <FileText className="w-8 h-8 text-blue-400" /> },
    { title: 'Quizzes', value: dashboardData.quizzes, icon: <ClipboardCheck className="w-8 h-8 text-green-400" /> },
    { title: 'Attendance', value: `${dashboardData.attendance}%`, icon: <Calendar className="w-8 h-8 text-yellow-400" /> },
    { title: 'Average Marks', value: `${dashboardData.averageMarks}%`, icon: <Award className="w-8 h-8 text-purple-400" /> },
    { title: 'Lecture Notes', value: dashboardData.lectureNotes, icon: <BookOpen className="w-8 h-8 text-cyan-400" /> },
    { title: 'Lecture Videos', value: dashboardData.lectureVideos, icon: <PlayCircle className="w-8 h-8 text-red-400" /> },
    { title: 'Subjects', value: dashboardData.subjects, icon: <GraduationCap className="w-8 h-8 text-indigo-400" /> },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-cyan-500/20 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold mb-2">Ready for your next class?</h2>
          <p className="text-gray-300">Your live virtual classroom is just one click away.</p>
        </div>
        <button
          onClick={() => navigate('/classroom')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:scale-105 text-white flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          Join Class
          <Video className="w-5 h-5" />
        </button>
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
