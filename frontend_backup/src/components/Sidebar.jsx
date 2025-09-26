import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUsers, FaUserTie, FaBuilding, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import { MdDashboard } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
import { AiFillSchedule } from "react-icons/ai";
import { getUserProfile, logout } from '../services/api';

const Sidebar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUserRole(userData.role);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        navigate('/login');
      }
    };
    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const basePath = `/${userRole}`;

  return (
    <div className="sidebar">
      <div className="logo">
        <h1 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center'}}>
          LABMate
        </h1>
      </div>
      <nav className="sidebar-nav">
        {(userRole === 'admin' || userRole === 'lecturer' || userRole === 'to') && (
          <NavLink 
            to={`${basePath}/dashboard`} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <MdDashboard /> Dashboard
          </NavLink>
        )}
        
        {(userRole === 'admin' || userRole === 'lecturer' || userRole === 'to' || userRole === 'student') && (
          <>
            <NavLink 
              to={`${basePath}/schedule-labs`} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaCalendarAlt /> Schedule Labs
            </NavLink>
            
            
          </>
        )}

        {userRole === 'to' && (
          <>
            <NavLink 
              to={`${basePath}/equipment-management`} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaBuilding /> Equipment Management
            </NavLink>

            <NavLink 
              to={`${basePath}/lab-booking-req`} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaBuilding /> Scheduiling Requests
            </NavLink>

            <NavLink 
              to={`${basePath}/equipment-borrowing-req`} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaBuilding /> Borrowing Requests
            </NavLink>
          </>
        )}
        
        {userRole === 'lecturer' && (
          <>
            <NavLink 
              to={`${basePath}/borrow-equipment`} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <AiFillSchedule /> Borrow Equipment
            </NavLink>
          </>
        )}

        {userRole === 'admin' && (
          <>
            <NavLink 
              to={`${basePath}/student-management`} 
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaUsers /> Student Management
            </NavLink>
            <NavLink 
              to={`${basePath}/lecturer-management`} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaUserTie /> Lecturer Management
            </NavLink>
            <NavLink 
              to={`${basePath}/lab-management`} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaBuilding /> Lab Management
            </NavLink>
            
            <NavLink 
              to={`${basePath}/to-management`} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FaUserShield /> TO Management
            </NavLink>
          </>
        )}

        {(userRole === 'student' || userRole === 'lecturer' || userRole === 'to') && (
          <>
            <NavLink 
              to={`${basePath}/notify`} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <IoIosNotifications  /> Notification
            </NavLink>
            
            
          </>
        )}

        <button onClick={handleLogout} className="nav-link logout">
          <FaSignOutAlt /> Logout
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;