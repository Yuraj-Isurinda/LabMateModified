import { useEffect, useState } from 'react';
import LabScheduleCalendar from '../components/LabSheduleCalendar';
import BorrowingHistory from '../components/BorrowingHistory';
import api, { getUserProfile } from '../services/api';

const TODashboard = () => {
  const [user, setUser] = useState(null);
  const [lecturer, setLecturer] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUser(response);
        console.log('User Profile:', response);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchLecturer = async () => {
      try {
        const response = await api.get(`auth/lecturer/${user.profile}`);
        setLecturer(response.data);
        console.log('Lecturer Profile:', response.data);
      } catch (error) {
        console.error('Error fetching lecturer profile:', error);
      }
    }

    if (user?.profile) {
      fetchLecturer();
    } else {
      setLecturer(null);
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
          <h2>Welcome back, {lecturer?.name || 'User'}!</h2>
          <p>Control everything in one place</p>
        </div>
        <div className="welcome-image">
          <img src="../src/assets/admin_dashboard.png" className="welcome-image"/>
        </div>
      </div>
      <LabScheduleCalendar />
    </div>
  );
};

export default TODashboard;