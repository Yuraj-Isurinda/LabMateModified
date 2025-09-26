import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AdminDashboard from './pages/AdminDashboard';
import ScheduleLabs from './pages/ScheduleLabs';
import StudentManagement from './pages/StudentManagement';
import LecturerManagement from './pages/LecturerManagement';
import LabManagement from './pages/LabManagement';
import EquipmentManagement from './pages/EquipmentManagement';
import TOManagement from './pages/TOManagement';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import LabBookingRequests from './pages/LabBookingRequests';
import BookEquipment from './pages/BookEquipment';
import EquipmentBorrowingRequest from './pages/EquipmentBorrowingRequest';
import NotificationDisplay from './pages/NotificationDisplay';
import LecturerDashboard from './pages/LecturerDashboard';
import TODashboard from './pages/TODashboard';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={['admin']} />}
          >
            <Route
              path="/admin/*"
              element={
                <div className="main-layout">
                  <Sidebar />
                  <div className="content">
                    <Routes>
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/schedule-labs" element={<ScheduleLabs />} />
                      <Route path="/student-management" element={<StudentManagement />} />
                      <Route path="/lecturer-management" element={<LecturerManagement />} />
                      <Route path="/lab-management" element={<LabManagement />} />
                      <Route path="/to-management" element={<TOManagement />} />
                      <Route path="/equipment-management" element={<EquipmentManagement />} />
                      <Route path="/borrow-equipment" element={<BookEquipment />} />
                      <Route path="/lab-booking-req" element={<LabBookingRequests />} />
                      <Route path="/equipment-borrowing-req" element={<LabBookingRequests />} />
                      <Route path="/notify" element={<NotificationDisplay />} />
                    </Routes>
                  </div>
                </div>
              }
            />
          </Route>

          {/* Lecturer Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={['lecturer']} />}
          >
            <Route
              path="/lecturer/*"
              element={
                <div className="main-layout">
                  <Sidebar />
                  <div className="content">
                    <Routes>
                      <Route path="/dashboard" element={<LecturerDashboard />} />
                      <Route path="/schedule-labs" element={<ScheduleLabs />} />
                      <Route path="/borrow-equipment" element={<BookEquipment />} />
                      <Route path="/notify" element={<NotificationDisplay />} />
                    </Routes>
                  </div>
                </div>
              }
            />
          </Route>

          {/* Student Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={['student']} />}
          >
            <Route
              path="/student/*"
              element={
                <div className="main-layout">
                  <Sidebar />
                  <div className="content">
                    <Routes>
                      <Route path="/" element={<ScheduleLabs />} />
                      <Route path="/schedule-labs" element={<ScheduleLabs />} />
                      <Route path="/notify" element={<NotificationDisplay />} />
                    </Routes>
                  </div>
                </div>
              }
            />
          </Route>

          {/* TO Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={['to']} />}
          >
            <Route
              path="/to/*"
              element={
                <div className="main-layout">
                  <Sidebar />
                  <div className="content">
                    <Routes>
                      <Route path="/dashboard" element={<TODashboard />} />
                      <Route path="/schedule-labs" element={<ScheduleLabs />} />
                      <Route path="/lab-booking-req" element={<LabBookingRequests />} />
                      <Route path="/equipment-management" element={<EquipmentManagement />} />
                      <Route path="/equipment-borrowing-req" element={<EquipmentBorrowingRequest />} />
                      <Route path="/notify" element={<NotificationDisplay />} />
                    </Routes>
                  </div>
                </div>
              }
            />
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;