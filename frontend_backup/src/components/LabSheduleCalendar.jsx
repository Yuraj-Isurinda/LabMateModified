import { useEffect, useState } from 'react';
import { getLabs } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

const LabScheduleCalendar = ({ onEdit, onDelete }) => {
  const [labs, setLabs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(currentWeek.getDate() + i);
    return {
      label: `${date.toLocaleString('en-US', { weekday: 'short' })} ${date.getDate()}`,
      date: date,
    };
  });

  const hours = [
    '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM',
    '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM',
  ];

  // Get the month and year for the header based on the first day of the week
  const getMonthYearHeader = () => {
    const firstDay = days[0].date;
    const lastDay = days[6].date;
    const monthStart = firstDay.toLocaleString('en-US', { month: 'long' });
    const monthEnd = lastDay.toLocaleString('en-US', { month: 'long' });
    const yearStart = firstDay.getFullYear();
    const yearEnd = lastDay.getFullYear();

    if (monthStart === monthEnd && yearStart === yearEnd) {
      return `${monthStart} ${yearStart}`;
    } else if (yearStart === yearEnd) {
      return `${monthStart} - ${monthEnd} ${yearStart}`;
    } else {
      return `${monthStart} ${yearStart} - ${monthEnd} ${yearEnd}`;
    }
  };

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await getLabs();
        setLabs(response.data);

        const allBookings = response.data.flatMap((lab) =>
          lab.bookings.map((booking) => {
            const bookingDate = new Date(booking.date);
            bookingDate.setHours(0, 0, 0, 0);

            const [fromHour, fromMinute] = booking.duration.from.split(':').map(Number);
            const [toHour, toMinute] = booking.duration.to.split(':').map(Number);

            const startHour = fromHour - 7 + fromMinute / 60;
            const endHour = toHour - 7 + toMinute / 60;

            return {
              labId: lab._id,
              labName: lab.lab_name,
              bookingId: booking._id,
              date: bookingDate,
              start: startHour,
              end: endHour,
              day: bookingDate.getDay(),
              color: getRandomColor(),
              bookForDept: booking.bookForDept,
              bookForBatch: booking.bookForBatch,
              bookForCourse: booking.bookForCourse,
              reason: booking.reason,
              duration: {
                from: booking.duration.from,
                to: booking.duration.to,
              },
              additionalRequirements: booking.additionalRequirements,
              status: booking.status,
            };
          })
        );
        setBookings(allBookings);
        console.log('Processed Bookings:', allBookings);
      } catch (error) {
        console.error('Error fetching labs:', error);
      }
    };
    fetchLabs();
  }, []);

  const getRandomColor = () => {
    const colors = [
      { name: 'lightgreen', hex: '#469f80' },
      { name: 'lightblue', hex: '#459fc9' },
      { name: 'lightpurple', hex: '#987fd3' },
      { name: 'lightpink', hex: '#b27f87' },
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const hex = randomColor.hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return {
      background: `rgba(${r}, ${g}, ${b}, 0.1)`,
      border: `rgb(${r}, ${g}, ${b})`,
      text: `rgb(${r}, ${g}, ${b})`,
    };
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          <div className="calendar-controls">
            <button
              onClick={handlePrevWeek}
              style={{ backgroundColor: '#f4f4f5', padding: '5px', borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px' }}
            >
              <FontAwesomeIcon icon={faArrowLeft} style={{ height: '15px', width: '15px' }} />
            </button>
            <span style={{ backgroundColor: '#f4f4f5', padding: '5px 15px' }}>Today</span>
            <button
              onClick={handleNextWeek}
              style={{ backgroundColor: '#f4f4f5', padding: '5px', borderTopRightRadius: '5px', borderBottomRightRadius: '5px' }}
            >
              <FontAwesomeIcon icon={faArrowRight} style={{ height: '15px', width: '15px' }} />
            </button>
          </div>
          <h2>{getMonthYearHeader()}</h2> {/* Month and Year Header */}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="view-btn active">Day</button>
          <button className="view-btn">Week</button>
          <button className="view-btn">Month</button>
          <button className="view-btn">Year</button>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
        <div className="time-column" style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
          {hours.map((hour, index) => (
            <div
              key={index}
              className="time-slot"
              style={{ height: '60px', lineHeight: '60px', borderBottom: '1px solid #ddd' }}
            >
              {hour}
            </div>
          ))}
        </div>
        <div className="days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="day-column" style={{ position: 'relative', borderRight: '1px solid #ddd' }}>
              <div className="day-header" style={{ textAlign: 'center', padding: '5px', borderBottom: '1px solid #ddd' }}>
                {day.label}
              </div>
              {hours.map((_, hourIndex) => (
                <div
                  key={hourIndex}
                  className="hour-slot"
                  style={{ height: '60px', borderBottom: '1px solid #ddd', position: 'relative' }}
                >
                  {bookings.map((booking, bookingIndex) => {
                    const bookingDate = new Date(booking.date);
                    bookingDate.setHours(0, 0, 0, 0);
                    const currentDay = new Date(day.date);
                    currentDay.setHours(0, 0, 0, 0);

                    const hourStart = hourIndex;
                    const hourEnd = hourIndex + 1;

                    if (
                      bookingDate.getTime() === currentDay.getTime() &&
                      booking.start < hourEnd &&
                      booking.end > hourStart &&
                      booking.status === 'accepted'
                    ) {
                      const topOffset = (booking.start - hourStart) * 60;
                      const height = (booking.end - booking.start) * 60;

                      return (
                        <div
                          key={bookingIndex}
                          className="booking"
                          style={{
                            backgroundColor: booking.color.background,
                            borderLeft: `4px solid ${booking.color.border}`,
                            color: booking.color.text,
                            position: 'absolute',
                            width: '100%',
                            height: `${height}px`,
                            top: `${topOffset}px`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            padding: '5px',
                            paddingTop: '10px',
                            boxSizing: 'border-box',
                            zIndex: 2,
                          }}
                        >
                          <div>
                            <strong>{booking.labName}</strong>
                            <br />
                            <span>{booking.duration.from} - {booking.duration.to}</span>
                            <br/>
                            <span>Dept: {booking.bookForDept}</span>
                            <br/>
                            <span>Batch: {booking.bookForBatch}</span>
                            <br/>
                            <span>Course: {booking.bookForCourse}</span>
                          </div>
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

export default LabScheduleCalendar;