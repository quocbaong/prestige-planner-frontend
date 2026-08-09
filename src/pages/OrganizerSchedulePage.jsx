import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventService } from '../services/eventService';

const OrganizerSchedulePage = () => {
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date()); // Ngày hiện tại thực tế
  const [selectedDay, setSelectedDay] = useState(null); // for modal
  const [realEvents, setRealEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventService.getEvents();
        setRealEvents(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách sự kiện:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const generateDays = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = new Date(firstDay);
    const dayOfWeek = startDay.getDay();
    const diff = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    startDay.setDate(startDay.getDate() - diff);

    const days = [];
    const tempDate = new Date(startDay);
    const actualToday = new Date();

    for (let i = 0; i < 35; i++) {
      const isToday = tempDate.getDate() === actualToday.getDate() && 
                      tempDate.getMonth() === actualToday.getMonth() && 
                      tempDate.getFullYear() === actualToday.getFullYear();
      const isPrevMonth = tempDate.getMonth() < month && tempDate.getFullYear() <= year;
      const isNextMonth = tempDate.getMonth() > month || tempDate.getFullYear() > year;

      const dayObj = {
        date: tempDate.getDate().toString(),
        isPrevMonth,
        isNextMonth,
        isToday,
        fullDate: new Date(tempDate),
        events: []
      };

      const dayEvents = realEvents.filter(ev => {
        if (!ev.startDate) return false;
        const evDate = new Date(ev.startDate);
        return evDate.getDate() === tempDate.getDate() &&
               evDate.getMonth() === tempDate.getMonth() &&
               evDate.getFullYear() === tempDate.getFullYear();
      });

      if (dayEvents.length > 0) {
        dayObj.hasDot = true;
        dayObj.events = dayEvents.map((ev, idx) => {
          const styles = [
            'bg-primary text-white shadow-md shadow-indigo-200',
            'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100',
            'bg-indigo-50 text-indigo-700 border border-indigo-100',
            'bg-emerald-50 text-emerald-700 border border-emerald-100'
          ];
          const style = styles[idx % styles.length];
          const timeStr = ev.startDate ? new Date(ev.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
          return {
            id: ev.id,
            title: ev.title || 'Sự kiện',
            location: ev.venue || ev.city || 'Online',
            time: timeStr ? `${timeStr} - ${ev.endDate ? new Date(ev.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '17:00'}` : '09:00 - 17:00',
            style,
            icon: 'location_on',
            subtitle: ev.shortDesc || ev.category || 'Sự kiện nổi bật',
            avatars: idx % 2 === 0
          };
        });
      }

      days.push(dayObj);
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return days;
  };

  const days = generateDays(currentDate.getMonth(), currentDate.getFullYear());

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const dayNames = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

  const getButtonLabel = () => {
    const today = new Date();

    if (viewMode === 'month') {
      if (currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
        return "Tháng này";
      }
      return `Tháng ${currentDate.getMonth() + 1}`;
    }

    if (viewMode === 'week') {
      const startOfCurrentWeek = new Date(currentDate);
      const day = startOfCurrentWeek.getDay();
      const diff = (day === 0 ? 6 : day - 1);
      startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - diff);

      const startOfTodayWeek = new Date(today);
      const tDay = startOfTodayWeek.getDay();
      const tDiff = (tDay === 0 ? 6 : tDay - 1);
      startOfTodayWeek.setDate(startOfTodayWeek.getDate() - tDiff);

      if (startOfCurrentWeek.getTime() === startOfTodayWeek.getTime()) {
        return "Tuần này";
      }

      const weekNum = Math.ceil(currentDate.getDate() / 7);
      return `Tuần ${weekNum}`;
    }

    if (viewMode === 'day') {
      if (currentDate.getDate() === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
        return "Hôm nay";
      }
      return `Ngày ${currentDate.getDate()}`;
    }

    return "Hôm nay";
  };

  const currentMonthEventsCount = realEvents.filter(ev => {
    if (!ev.startDate) return false;
    const evDate = new Date(ev.startDate);
    return evDate.getMonth() === currentDate.getMonth() && evDate.getFullYear() === currentDate.getFullYear();
  }).length;

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 font-headline mb-1 tracking-tight">
            {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
            <span className="w-2 h-2 rounded-full bg-primary shadow-sm"></span>
            Bạn có {currentMonthEventsCount} sự kiện trong tháng này
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <button className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${viewMode === 'month' ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`} onClick={() => setViewMode('month')}>Tháng</button>
          <button className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${viewMode === 'week' ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`} onClick={() => setViewMode('week')}>Tuần</button>
          <button className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${viewMode === 'day' ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`} onClick={() => setViewMode('day')}>Ngày</button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="w-11 h-11 flex items-center justify-center bg-white rounded-full border border-slate-200/60 hover:bg-slate-50 hover:shadow-md transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-slate-600">chevron_left</span>
          </button>
          <button
            onClick={handleToday}
            className="px-6 py-2.5 bg-white rounded-full border border-slate-200/60 hover:bg-slate-50 hover:shadow-md font-bold text-slate-700 transition-all shadow-sm"
          >
            {getButtonLabel()}
          </button>
          <button
            onClick={handleNext}
            className="w-11 h-11 flex items-center justify-center bg-white rounded-full border border-slate-200/60 hover:bg-slate-50 hover:shadow-md transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-slate-600">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-10">

        {/* Days Header */}
        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
            {['THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7', 'CHỦ NHẬT'].map((day, i) => (
              <div key={i} className={`py-3 text-center text-[10px] font-black uppercase tracking-widest ${i === 6 ? 'text-primary' : 'text-slate-400'}`}>
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Days Grid - Month View */}
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 auto-rows-[85px] xl:auto-rows-[100px] divide-x divide-y divide-slate-100/60">
            {days.map((dayObj, i) => (
              <motion.div
                key={i}
                whileHover={dayObj.events && dayObj.events.length > 0 ? { scale: 1.02, zIndex: 10 } : {}}
                onClick={() => dayObj.events && dayObj.events.length > 0 && setSelectedDay(dayObj)}
                className={`p-2 xl:p-3 relative transition-all duration-200 group
                    ${(dayObj.isPrevMonth || dayObj.isNextMonth) ? 'bg-slate-50/30' : 'bg-white'}
                    ${dayObj.events && dayObj.events.length > 0
                    ? 'cursor-pointer hover:bg-indigo-50/60'
                    : ''}
                  `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {dayObj.isToday ? (
                      <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200">
                        {dayObj.date}
                      </span>
                    ) : (
                      <span className={`font-bold text-sm ml-1 ${(dayObj.isPrevMonth || dayObj.isNextMonth) ? 'text-slate-300' : 'text-slate-700'}`}>
                        {dayObj.date}
                      </span>
                    )}
                  </div>
                  {dayObj.hasDot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-1"></span>
                  )}
                </div>

                {/* Event Dot Indicators */}
                {dayObj.events && dayObj.events.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 px-1">
                    {dayObj.events.slice(0, 3).map((event, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full inline-block ${event.style.includes('bg-primary') ? 'bg-primary' :
                            event.style.includes('fuchsia') ? 'bg-fuchsia-400' :
                              event.style.includes('indigo') ? 'bg-indigo-400' :
                                'bg-slate-400'
                          }`}
                      />
                    ))}
                    {dayObj.events.length > 3 && (
                      <span className="text-[9px] font-black text-slate-400">+{dayObj.events.length - 3}</span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Days Grid - Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 min-h-[300px] xl:min-h-[400px] divide-x divide-slate-100/60 bg-white">
            {(() => {
              const startOfWeek = new Date(currentDate);
              const day = startOfWeek.getDay();
              const diff = (day === 0 ? 6 : day - 1);
              startOfWeek.setDate(startOfWeek.getDate() - diff);

              return Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(startOfWeek);
                d.setDate(d.getDate() + i);
                const existingDay = days.find(dayObj =>
                  dayObj.fullDate.getDate() === d.getDate() &&
                  dayObj.fullDate.getMonth() === d.getMonth()
                );
                return existingDay || { date: d.getDate().toString(), fullDate: d, events: [] };
              }).map((dayObj, i) => (
                <div key={i} className="p-4 relative group transition-colors hover:bg-slate-50/50">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      {dayObj.isToday ? (
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-200">
                            {dayObj.date}
                          </span>
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Hôm nay</span>
                        </div>
                      ) : (
                        <span className="font-black text-xl text-slate-700 ml-1">
                          {dayObj.date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Events */}
                  <div className="space-y-3 mt-2">
                    {dayObj.events && dayObj.events.map((event, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className={`px-4 py-3 rounded-2xl text-sm cursor-pointer transition-all ${event.style}`}
                      >
                        <div className="font-bold mb-1">{event.title}</div>
                        {event.time && <div className="text-xs opacity-80 font-medium">{event.time}</div>}
                        {event.location && (
                          <div className="flex items-center gap-1 mt-2 opacity-90">
                            <span className="material-symbols-outlined text-[14px]">{event.icon || 'location_on'}</span>
                            <span className="text-xs font-medium truncate">{event.location}</span>
                          </div>
                        )}
                        {event.subtitle && <div className="text-xs opacity-70 font-medium mt-1">{event.subtitle}</div>}
                        {event.avatars && (
                          <div className="flex items-center gap-1 mt-3">
                            <div className="flex -space-x-2">
                              <img src="https://i.pravatar.cc/100?u=1" className="w-6 h-6 rounded-full border-2 border-white" alt="avatar" />
                              <img src="https://i.pravatar.cc/100?u=2" className="w-6 h-6 rounded-full border-2 border-white" alt="avatar" />
                            </div>
                            <span className="text-xs font-bold text-primary ml-1 bg-indigo-50 px-2 py-0.5 rounded-md">+2</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="flex divide-x divide-slate-100/60 min-h-[600px] bg-white">
            {/* Time sidebar */}
            <div className="w-24 shrink-0 bg-slate-50/30 flex flex-col py-6">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                <div key={time} className="h-20 text-right pr-4 text-[10px] font-black text-slate-400">{time}</div>
              ))}
            </div>
            {/* Day content */}
            <div className="flex-1 p-6 relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-3xl shadow-md shadow-indigo-200">
                  {currentDate.getDate()}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 font-headline tracking-tight">{dayNames[currentDate.getDay()]}</h3>
                  <p className="text-slate-500 font-medium text-sm">{monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}</p>
                </div>
              </div>

              {/* Dynamic Timeline Grid */}
              <div className="absolute top-[120px] left-6 right-6 bottom-6 flex flex-col">
                {(() => {
                  const dayEvents = realEvents.filter(ev => {
                    if (!ev.startDate) return false;
                    const evDate = new Date(ev.startDate);
                    return evDate.getDate() === currentDate.getDate() &&
                           evDate.getMonth() === currentDate.getMonth() &&
                           evDate.getFullYear() === currentDate.getFullYear();
                  });

                  return ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(timeSlot => {
                    const slotHour = parseInt(timeSlot.split(':')[0]);
                    const matchingEvents = dayEvents.filter(ev => {
                      const evHour = new Date(ev.startDate).getHours();
                      return evHour === slotHour || (slotHour === 9 && (evHour < 8 || evHour > 17));
                    });

                    return (
                      <div key={timeSlot} className="h-20 border-t border-slate-100 w-full relative">
                        {matchingEvents.map((ev, idx) => {
                          const startTimeStr = new Date(ev.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                          const endTimeStr = ev.endDate ? new Date(ev.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : `${slotHour + 2}:30`;
                          return (
                            <motion.div
                              key={ev.id || idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="absolute top-3 left-0 right-10 p-5 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-slate-800 z-10 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-black text-lg mb-1 font-headline group-hover:text-primary transition-colors">{ev.title}</div>
                                  <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                    {startTimeStr} - {endTimeStr} • {ev.venue || ev.city || 'Online'}
                                  </div>
                                </div>
                                <div className="flex -space-x-2">
                                  <img src="https://i.pravatar.cc/100?u=1" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                                  <img src="https://i.pravatar.cc/100?u=2" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-indigo-50 flex items-center justify-center font-bold text-xs text-primary">+2</div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(() => {
          const upcomingEvent = realEvents.find(e => new Date(e.startDate) >= new Date()) || realEvents[0];
          const completedCount = realEvents.filter(e => e.status === 'COMPLETED').length;
          const pendingCount = realEvents.filter(e => e.status === 'PUBLISHED' || e.status === 'DRAFT').length;

          return (
            <>
              {/* Highlight Card */}
              <div className="lg:col-span-2 bg-[#f8fafc] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row relative shadow-sm border border-slate-100 group">
                <div className="p-8 md:p-10 flex-1 z-10 bg-white md:bg-transparent">
                  <span className="inline-block bg-[#5c46e5] text-white text-[10px] font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest shadow-sm">Điểm nhấn sắp tới</span>
                  <h3 className="text-3xl font-black text-slate-900 mb-4 font-headline tracking-tight leading-tight">{upcomingEvent ? upcomingEvent.title : 'Đại nhạc hội Indigo Summer 2026'}</h3>
                  <p className="text-slate-600 font-medium mb-8 max-w-md leading-relaxed">{upcomingEvent ? upcomingEvent.shortDesc || upcomingEvent.description : 'Sự kiện âm nhạc lớn nhất năm với sự góp mặt của hơn 20 nghệ sĩ nổi tiếng toàn quốc.'}</p>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-100 font-bold text-slate-700 text-sm">
                      <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                      {upcomingEvent && upcomingEvent.startDate ? new Date(upcomingEvent.startDate).toLocaleDateString('vi-VN') : '15 - 17 Tháng 4'}
                    </div>
                    <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-100 font-bold text-slate-700 text-sm">
                      <span className="material-symbols-outlined text-primary text-[18px]">group</span>
                      {upcomingEvent ? `${upcomingEvent.maxAttendees || 500} Khách` : '2,500 Khách'}
                    </div>
                  </div>
                </div>
                {/* Image Background for right side */}
                <div className="md:w-2/5 md:absolute right-0 top-0 bottom-0 overflow-hidden relative min-h-[250px]">
                  {/* Gradient fade to blend image with left side */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10 hidden md:block"></div>
                  <img src={upcomingEvent && upcomingEvent.bannerUrl ? upcomingEvent.bannerUrl : "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800"} alt="Concert" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-[#5c46e5] rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group cursor-pointer flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-500"></div>

                <div>
                  <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mb-2">Thống kê nhanh</p>
                  <h3 className="text-2xl font-black mb-8 font-headline">Dự án hoạt động</h3>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-4xl font-black mb-1">{realEvents.length}</p>
                      <p className="text-xs font-medium opacity-80">Tổng sự kiện</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold mb-1 pt-3">{completedCount}</p>
                      <p className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Đã hoàn thành</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/20 pt-6">
                  <div>
                    <p className="text-3xl font-black mb-1">{pendingCount}</p>
                    <p className="text-[10px] font-medium opacity-80 uppercase tracking-wider">Đang chờ</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-white group-hover:text-primary transition-all duration-300 shadow-inner">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Day Events Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDay(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
            >
              {/* Modern Header - Extra Compact */}
              <div className="relative h-20 overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-primary" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                <div className="absolute inset-0 px-6 flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-black text-xl shadow-inner">
                      {selectedDay.date}
                    </div>
                    <div>
                      <h4 className="text-base font-black font-headline tracking-tight leading-none mb-1">{dayNames[selectedDay.fullDate.getDay()]}</h4>
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-70">
                        {monthNames[selectedDay.fullDate.getMonth()]} {selectedDay.fullDate.getFullYear()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-300 group shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform">close</span>
                  </button>
                </div>
              </div>

              {/* Events Section - Enhanced Contrast */}
              <div className="bg-slate-50/50 p-8 flex-1">
                <div className="flex items-center justify-between mb-6 px-1">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Danh sách sự kiện</span>
                  <div className="px-3 py-1 rounded-full bg-white text-[10px] font-black text-primary border border-indigo-100 shadow-sm">
                    {selectedDay.events.length} LỊCH TRÌNH
                  </div>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedDay.events.map((event, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative group"
                    >
                      {/* Side Accent Bar */}
                      <div className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full z-10 ${event.style.includes('bg-primary') ? 'bg-primary' :
                          event.style.includes('fuchsia') ? 'bg-fuchsia-500' :
                            event.style.includes('indigo') ? 'bg-indigo-500' :
                              'bg-slate-400'
                        }`} />

                      <div className="bg-white rounded-2xl py-3.5 px-5 pl-7 border border-slate-200/60 shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/10 transition-all duration-300">
                        <div className="flex justify-between items-start mb-1.5">
                          <h5 className="font-black text-slate-800 text-sm leading-snug group-hover:text-primary transition-colors pr-2">{event.title}</h5>
                          {event.time && (
                            <span className="text-[9px] font-black bg-slate-50 px-1.5 py-0.5 rounded-lg border border-slate-100 text-slate-500 shadow-sm shrink-0 mt-0.5">
                              {event.time.split(' - ')[0]}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                          {event.location && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                              <span className="text-xs font-bold">{event.location}</span>
                            </div>
                          )}
                          {event.time && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                              <span className="text-xs font-bold">{event.time}</span>
                            </div>
                          )}
                        </div>

                        {event.avatars && (
                          <div className="mt-4 pt-4 border-t border-slate-100/60 flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {[1, 2, 3].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?u=${i + idx}`} className="w-7 h-7 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                              ))}
                              <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-indigo-50 flex items-center justify-center text-[9px] font-black text-primary">+2</div>
                            </div>
                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Team Leader</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerSchedulePage;
