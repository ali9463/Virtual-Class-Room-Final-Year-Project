import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { faker } from '@faker-js/faker';
import { Award, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ClassFilter from '../../components/ClassFilter';

const generateGrades = (count) => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    student: faker.person.fullName(),
    subject: faker.company.name(),
    assignment: `${faker.word.verb()} ${faker.word.noun()}`,
    grade: Number(faker.number.float({ min: 55, max: 100, fractionDigits: 1 }).toFixed(1)),
    date: faker.date.recent({ days: 90 }).toLocaleDateString(),
  }));
};

const GradeColor = ({ grade }) => {
  let colorClass = '';
  if (grade >= 90) colorClass = 'bg-green-500/20 text-green-300';
  else if (grade >= 75) colorClass = 'bg-yellow-500/20 text-yellow-300';
  else if (grade >= 60) colorClass = 'bg-orange-500/20 text-orange-300';
  else colorClass = 'bg-red-500/20 text-red-300';
  return <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${colorClass}`}>{grade}%</span>;
};

const MarksPage = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState({ year: '', department: '', section: '' });
  const [grades, setGrades] = useState(generateGrades(15));
  const overallAverage = (grades.reduce((acc, g) => acc + g.grade, 0) / grades.length).toFixed(1);

  const handleEditGrade = (id) => {
    const current = grades.find(g => g.id === id);
    const input = window.prompt(`Enter new grade for ${current.student} (0-100):`, String(current.grade));
    if (input === null) return;
    const value = parseFloat(input);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      alert('Invalid grade');
      return;
    }
    setGrades(prev => prev.map(g => g.id === id ? { ...g, grade: Number(value.toFixed(1)) } : g));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-3xl font-bold mb-6 text-white">Marks & Grades</h1>

      {/* Class Filter */}
      <ClassFilter onFilterChange={setFilter} user={user} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
          <h3 className="text-gray-400 mb-2">Overall Average</h3>
          <p className="text-4xl font-bold text-cyan-400">{overallAverage}%</p>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
          <h3 className="text-gray-400 mb-2">Highest Grade</h3>
          <p className="text-4xl font-bold text-green-400">{Math.max(...grades.map(g => g.grade)).toFixed(1)}%</p>
          <p className="text-sm text-gray-400 mt-1 flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> Top Performance</p>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
          <h3 className="text-gray-400 mb-2">Lowest Grade</h3>
          <p className="text-4xl font-bold text-red-400">{Math.min(...grades.map(g => g.grade)).toFixed(1)}%</p>
          <p className="text-sm text-gray-400 mt-1 flex items-center"><TrendingDown className="w-4 h-4 mr-1" /> Area for Improvement</p>
        </div>
      </div>

      <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-cyan-500/20">
        <h2 className="text-xl font-bold mb-6">Gradebook</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">Student</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">Subject</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">Assignment/Quiz</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400 text-right">Grade</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.sort((a, b) => new Date(b.date) - new Date(a.date)).map((grade) => (
                <tr key={grade.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-4 px-4 text-cyan-400 font-medium">{grade.student}</td>
                  <td className="py-4 px-4 text-cyan-300">{grade.subject}</td>
                  <td className="py-4 px-4">{grade.assignment}</td>
                  <td className="py-4 px-4 text-gray-400">{grade.date}</td>
                  <td className="py-4 px-4 text-right"><GradeColor grade={grade.grade} /></td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => handleEditGrade(grade.id)} className="text-sm bg-cyan-500/80 px-3 py-1 rounded text-white">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default MarksPage;
