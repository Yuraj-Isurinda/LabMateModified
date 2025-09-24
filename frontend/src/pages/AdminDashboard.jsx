import { useEffect, useState } from 'react';
import LabSheduleCalendar from '../components/LabSheduleCalendar';
import api, { getUserProfile } from '../services/api';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUser(response);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await api.get(`auth/admin/${user.profile}`);
        setAdmin(response.data);
        console.log('Admin Profile:', response.data);
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      }
    }

    if (user?.profile) {
      fetchAdmin();
    } else {
      setAdmin(null);
    }
    
  }, [user]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="admin-dashboard">
      <div className="welcome-card">
        <div className="welcome-text">
          <h1 style={{marginBottom: '20px', fontWeight: 300, color: "#c7d5f7"}}>{currentDate}</h1>
          <h2>Welcome back, {admin?.name || 'User'}!</h2>
          <p>Control everything in one place</p>
        </div>
        <div className="welcome-image">
          <img src="../src/assets/admin_dashboard.png" className="welcome-image"/>
        </div>
      </div>
      <LabSheduleCalendar />
    </div>
  );
};

export default AdminDashboard;