import { useEffect, useState } from 'react';
import { getLabs } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Calendar = () => {
  const [labs, setLabs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(currentWeek.getDate() + i);
    return `${date.toLocaleString('en-US', { weekday: 'short' })} ${date.getDate()}`;
  });
  const hours = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'];

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await getLabs();
        setLabs(response.data);

        // Process bookings for the calendar
        const allBookings = response.data.flatMap(lab =>
          lab.bookings.map(booking => ({
            labName: lab.lab_name,
            date: new Date(booking.date),
            start: new Date(booking.duration.from).getHours() - 7, // Adjust to match calendar hours
            end: new Date(booking.duration.to).getHours() - 7,
            day: new Date(booking.date).getDay(),
            color: getRandomColor(),
          }))
        );
        setBookings(allBookings);
      } catch (error) {
        console.error('Error fetching labs:', error);
      }
    };
    fetchLabs();
  }, []);

  const getRandomColor = () => {
    const colors = ['lightgreen', 'lightblue', 'lightpurple', 'lightpink'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handlePrevWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button onClick={handlePrevWeek}  style={{ backgroundColor: "#f4f4f5", padding: "5px", borderTopLeftRadius: "5px", borderBottomLeftRadius:"5px"}}>
            <FontAwesomeIcon icon={faArrowLeft} style={{height: '15px', width: '15px'}} />
          </button>
          <span  style={{ backgroundColor: "#f4f4f5", padding: "5px 15px"}}>Today</span>
          <button onClick={handleNextWeek} style={{ backgroundColor: "#f4f4f5", padding: "5px", borderTopRightRadius: "5px", borderBottomRightRadius:"5px"}}>
            <FontAwesomeIcon icon={faArrowRight} style={{height: '15px', width: '15px'}} />
          </button>
          
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <button className="view-btn active">Day</button>
          <button className="view-btn">Week</button>
          <button className="view-btn">Month</button>
          <button className="view-btn">Year</button>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <div className="calendar-grid">
        <div className="time-column">
          {hours.map((hour, index) => (
            <div key={index} className="time-slot">{hour}</div>
          ))}
        </div>
        <div className="days-grid">
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="day-column">
              <div className="day-header">{day}</div>
              {hours.map((_, hourIndex) => (
                <div key={hourIndex} className="hour-slot">
                  {bookings.map((booking, bookingIndex) => {
                    if (booking.day === dayIndex && hourIndex >= booking.start && hourIndex < booking.end) {
                      return (
                        <div
                          key={bookingIndex}
                          className="booking"
                          style={{
                            backgroundColor: booking.color,
                            gridRow: `${booking.start + 2} / ${booking.end + 2}`,
                            position: 'absolute',
                            width: '100%',
                            height: `${(booking.end - booking.start) * 60}px`,
                            top: `${booking.start * 60}px`,
                          }}
                        >
                          {booking.labName}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;