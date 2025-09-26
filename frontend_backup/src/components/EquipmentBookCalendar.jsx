import { useEffect, useState } from 'react';
import { getEquipment } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

const EquipmentBookCalendar = ({ onEdit, onDelete }) => {
  const [equipment, setEquipment] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(currentWeek.getDate() + i);
    return {
      label: `${date.toLocaleString('en-US', { weekday: 'short' })} ${date.getDate()}`,
      date: date,
    };
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await getEquipment();
        setEquipment(response.data);

        const allBorrowings = response.data.flatMap(item =>
          item.borrowings.map(borrowing => {
            const borrowDate = new Date(borrowing.borrow_date);
            borrowDate.setHours(0, 0, 0, 0);
            const returnDate = borrowing.return_date ? new Date(borrowing.return_date) : null;
            returnDate?.setHours(0, 0, 0, 0);

            return {
              equipmentId: item._id,
              equipmentName: item.name,
              borrowingId: borrowing._id,
              borrowDate,
              returnDate,
              num_of_items: borrowing.num_of_items,
              status: borrowing.status,
              day: borrowDate.getDay(),
              color: getRandomColor(),
            };
          })
        );
        setBorrowings(allBorrowings);
        console.log('Processed Borrowings:', allBorrowings);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      }
    };
    fetchEquipment();
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

  // Group borrowings by equipment and day to determine the number of rows needed
  const groupedBorrowings = equipment.map(item => {
    const equipmentBorrowings = borrowings.filter(
      borrowing => borrowing.equipmentId === item._id
    );

    // For each day, count the number of active borrowings
    const borrowingsByDay = days.map(day => {
      const currentDay = new Date(day.date);
      currentDay.setHours(0, 0, 0, 0);

      return equipmentBorrowings.filter(borrowing => {
        const borrowDate = new Date(borrowing.borrowDate);
        borrowDate.setHours(0, 0, 0, 0);
        const isActive = !borrowing.returnDate || new Date(borrowing.returnDate) >= currentDay;
        return borrowDate.getTime() === currentDay.getTime() && isActive;
      });
    });

    // Find the maximum number of borrowings on any day for this equipment
    const maxBorrowings = Math.max(...borrowingsByDay.map(dayBorrowings => dayBorrowings.length), 1);

    return {
      equipmentId: item._id,
      equipmentName: item.name,
      borrowings: equipmentBorrowings,
      maxRows: maxBorrowings, // Number of rows needed for this equipment
      borrowingsByDay, // Borrowings grouped by day
    };
  });

  return (
    <div className="calendar">
      <div className="calendar-header">
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
          {/*{groupedBorrowings.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="equipment-slot"
              style={{
                height: `${group.maxRows * 60}px`,
                lineHeight: `${group.maxRows * 60}px`,
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
              }}
            >
              {}
            </div>
          ))}*/}
        </div>
        <div className="days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="day-column" style={{ position: 'relative', borderRight: '1px solid #ddd' }}>
              <div className="day-header" style={{ textAlign: 'center', padding: '5px', borderBottom: '1px solid #ddd' }}>
                {day.label}
              </div>
              {groupedBorrowings.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="equipment-row"
                  style={{
                    height: `${group.maxRows * 60}px`,
                    borderBottom: '1px solid #ddd',
                    position: 'relative',
                  }}
                >
                  {Array.from({ length: group.maxRows }).map((_, rowIndex) => {
                    const borrowing = group.borrowingsByDay[dayIndex][rowIndex];
                    if (!borrowing) return <div key={rowIndex} style={{ height: '60px' }} />;
                    if (borrowing.status === "accepted"){
                      return (
                        <div
                          key={rowIndex}
                          className="borrowing"
                          style={{
                            backgroundColor: borrowing.color.background,
                            borderLeft: `4px solid ${borrowing.color.border}`,
                            color: borrowing.color.text,
                            position: 'absolute',
                            width: '100%',
                            height: '60px',
                            top: `${rowIndex * 60}px`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '5px',
                            boxSizing: 'border-box',
                            zIndex: 2,
                          }}
                        >
                          <div>
                            <strong>{borrowing.equipmentName}</strong>
                            <br />
                            <span>Items: {borrowing.num_of_items}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#555', display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(borrowing, borrowing.equipmentId);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}
                            >
                              <FontAwesomeIcon icon={faPenToSquare} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(borrowing, borrowing.equipmentId);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f' }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    
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

export default EquipmentBookCalendar;