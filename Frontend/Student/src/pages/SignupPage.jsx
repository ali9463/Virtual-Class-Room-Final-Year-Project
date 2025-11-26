import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { GraduationCap, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollYear: '',
    rollDept: '',
    rollSerial: '',
    section: ''
  });
  const [role, setRole] = useState('student');
  const [years, setYears] = useState([]);
  const [depts, setDepts] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch years and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [yearsRes, deptsRes] = await Promise.all([
          fetch(`${API}/api/admin/years`).then(r => r.json()),
          fetch(`${API}/api/admin/departments`).then(r => r.json())
        ]);
        setYears(yearsRes || []);
        setDepts(deptsRes || []);
      } catch (err) {
        console.error('Error fetching years/depts:', err);
      }
    };
    fetchData();
  }, [API]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (role === 'student' && (!formData.rollYear || !formData.rollDept || !formData.rollSerial || !formData.section)) {
      setError('Please provide year, department, serial number, and section');
      return;
    }

    if (role === 'student' && !['A', 'B', 'C', 'D', 'E', 'F'].includes(formData.section.toUpperCase())) {
      setError('Section must be filled');
      return;
    }

    if (role === 'teacher' && !formData.email) {
      setError('Teachers must provide an email');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    const payload = { ...formData, role };
    const res = await signup(payload);
    if (res.success) {
      toast.success('Account created successfully');
      navigate('/dashboard');
    } else {
      toast.error(res.message || 'Failed to create account');
      setError(res.message || 'Failed to create account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-600/5"></div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-cyan-500/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GraduationCap className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">Virtual CUI</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Student Account</h1>
            <p className="text-gray-300">Join thousands of students and teachers in the future of education</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">



            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {role === 'student' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Roll Number *</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="rollYear" className="block text-xs text-gray-400 mb-1">Year</label>
                    <select
                      id="rollYear"
                      name="rollYear"
                      value={formData.rollYear}
                      onChange={handleChange}
                      className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm"
                    >
                      <option value="">Select Year</option>
                      {years.map(y => (
                        <option key={y._id} value={y.code}>{y.code}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rollDept" className="block text-xs text-gray-400 mb-1">Department</label>
                    <select
                      id="rollDept"
                      name="rollDept"
                      value={formData.rollDept}
                      onChange={handleChange}
                      className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm"
                    >
                      <option value="">Select Dept</option>
                      {depts.map(d => (
                        <option key={d._id} value={d.code}>{d.code} </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="rollSerial" className="block text-xs text-gray-400 mb-1">Serial</label>
                    <input
                      id="rollSerial"
                      name="rollSerial"
                      type="text"
                      value={formData.rollSerial}
                      onChange={handleChange}
                      className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g., 255"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="section" className="block text-sm font-medium text-gray-300 mb-2">Section *</label>
                  <select
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                  >
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email {role === 'teacher' ? '*' : ''}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all"
                placeholder="Enter email"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all pr-12"
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all pr-12"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2" />
              <span className="ml-2 text-sm text-gray-300">
                I agree to the <a href="#" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a> and <a href="#" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 px-4 rounded-lg text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div >
    </div >
  );
};

export default SignupPage;
