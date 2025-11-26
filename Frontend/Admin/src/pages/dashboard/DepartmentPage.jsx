import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Trash2, Edit2, Save, X } from 'lucide-react';

const DepartmentPage = () => {
  const [years, setYears] = useState([]);
  const [depts, setDepts] = useState([]);
  const [students, setStudents] = useState([]);
  const [newYear, setNewYear] = useState({ code: '', label: '' });
  const [newDept, setNewDept] = useState({ code: '', label: '' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentData, setEditStudentData] = useState({});
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch data on mount
  useEffect(() => {
    fetchYears();
    fetchDepts();
    fetchStudents();
  }, []);

  const fetchYears = async () => {
    try {
      setLoadingYears(true);
      const res = await axios.get(`${API}/api/admin/years`);
      setYears(res.data || []);
    } catch (err) {
      console.error('Error fetching years:', err);
      toast.error('Failed to fetch years');
    } finally {
      setLoadingYears(false);
    }
  };

  const fetchDepts = async () => {
    try {
      setLoadingDepts(true);
      const res = await axios.get(`${API}/api/admin/departments`);
      setDepts(res.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast.error('Failed to fetch departments');
    } finally {
      setLoadingDepts(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await axios.get(`${API}/api/admin/users`);
      const filteredStudents = res.data.filter(u => u.role === 'student');
      setStudents(filteredStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to fetch students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const addYear = async () => {
    if (!newYear.code || !newYear.label) return toast.error('Provide code and label');
    try {
      const res = await axios.post(`${API}/api/admin/years`, newYear);
      setYears(prev => [res.data, ...prev]);
      setNewYear({ code: '', label: '' });
      toast.success('Year added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add year');
    }
  };

  const removeYear = async (id) => {
    try {
      await axios.delete(`${API}/api/admin/years/${id}`);
      setYears(prev => prev.filter(y => y._id !== id));
      toast.success('Year deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete year');
    }
  };

  const addDept = async () => {
    if (!newDept.code || !newDept.label) return toast.error('Provide code and label');
    try {
      const res = await axios.post(`${API}/api/admin/departments`, newDept);
      setDepts(prev => [res.data, ...prev]);
      setNewDept({ code: '', label: '' });
      toast.success('Department added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add department');
    }
  };

  const removeDept = async (id) => {
    try {
      await axios.delete(`${API}/api/admin/departments/${id}`);
      setDepts(prev => prev.filter(d => d._id !== id));
      toast.success('Department deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 className="text-3xl font-bold mb-6 text-white">Department Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Years Section */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
          <h2 className="text-xl font-bold mb-4">Manage Academic Years</h2>
          {loadingYears ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  value={newYear.code}
                  onChange={e => setNewYear(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Code (e.g. FA24)"
                  className="px-3 py-2 bg-gray-900 rounded text-white text-sm w-36"
                />
                <input
                  value={newYear.label}
                  onChange={e => setNewYear(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Label"
                  className="px-3 py-2 bg-gray-900 rounded text-white text-sm flex-1"
                />
                <button onClick={addYear} className="bg-cyan-500 hover:bg-cyan-600 px-3 py-2 rounded text-white font-semibold text-sm">
                  Add
                </button>
              </div>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {years.map(y => (
                  <li key={y._id} className="flex justify-between items-center bg-gray-900 p-3 rounded">
                    <div>
                      <div className="text-sm text-cyan-300 font-medium">{y.code}</div>
                      <div className="text-xs text-gray-400">{y.label}</div>
                    </div>
                    <button onClick={() => removeYear(y._id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Departments Section */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/20">
          <h2 className="text-xl font-bold mb-4">Manage Departments</h2>
          {loadingDepts ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  value={newDept.code}
                  onChange={e => setNewDept(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Code (e.g. BCS)"
                  className="px-3 py-2 bg-gray-900 rounded text-white text-sm w-36"
                />
                <input
                  value={newDept.label}
                  onChange={e => setNewDept(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Label"
                  className="px-3 py-2 bg-gray-900 rounded text-white text-sm flex-1"
                />
                <button onClick={addDept} className="bg-cyan-500 hover:bg-cyan-600 px-3 py-2 rounded text-white font-semibold text-sm">
                  Add
                </button>
              </div>
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {depts.map(d => (
                  <li key={d._id} className="flex justify-between items-center bg-gray-900 p-3 rounded">
                    <div>
                      <div className="text-sm text-cyan-300 font-medium">{d.code}</div>
                      <div className="text-xs text-gray-400">{d.label}</div>
                    </div>
                    <button onClick={() => removeDept(d._id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default DepartmentPage;
