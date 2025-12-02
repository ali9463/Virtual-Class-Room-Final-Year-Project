import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChooseClasses from './pages/ChooseClasses';
import ClassroomMeeting from './pages/ClassroomMeeting';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import MarksPage from './pages/dashboard/MarksPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import CreateAssigment from './pages/dashboard/CreateAssignment';
import CreateQuiz from './pages/dashboard/CreateQuiz';
import AssignmentChecker from './pages/dashboard/AssignmentChecker';
import QuizChecker from './pages/dashboard/QuizChecker';
import Attendence from './pages/dashboard/Attendence';
import Lectures from './pages/dashboard/Lectures';
import AiChatBot from './pages/dashboard/AiChatBot';
import Classes from './pages/dashboard/Classes';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen bg-black flex items-center justify-center text-white text-2xl">Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <div className="min-h-screen bg-black">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/choose-classes" element={<ChooseClasses />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="quizez" element={<CreateQuiz />} />
              <Route path="assignments" element={<CreateAssigment />} />
              <Route path="checkassignments" element={<AssignmentChecker />} />
              <Route path="checkquizes" element={<QuizChecker />} />
              <Route path="attendence" element={<Attendence />} />
              <Route path="lectures" element={<Lectures />} />
              <Route path="aichatbot" element={<AiChatBot />} />
              <Route path="classes" element={<Classes />} />
              <Route path="marks" element={<MarksPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route
              path="/classroom"
              element={
                <ProtectedRoute>
                  <ClassroomMeeting />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
