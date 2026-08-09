import React, { useState, useEffect, useRef } from 'react';
import axios from '../lib/axios';
import { 
  Send, 
  Save, 
  Calendar, 
  History, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  AlertCircle,
  Smartphone,
  Info,
  Clock,
  MoreVertical,
  ChevronRight,
  Sparkles,
  Bell,
  Volume2
} from 'lucide-react';

const BroadcastPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Bảo trì hệ thống');
  const [target, setTarget] = useState('Tất cả người dùng');
  const [body, setBody] = useState('');
  const [schedule, setSchedule] = useState('now');

  // Slideshow States
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const defaultSlides = [
    {
      title: "Hệ thống bảo trì",
      type: "Bảo trì hệ thống",
      body: "Hệ thống EventArchitect sẽ tiến hành bảo trì nâng cấp định kỳ vào lúc 02:00 AM ngày 20/10/2023. Một số dịch vụ có thể bị gián đoạn tạm thời trong khoảng 30 phút."
    },
    {
      title: "Ưu đãi cực khủng tháng 12",
      type: "Khuyến mãi",
      body: "Giảm giá lên đến 50% cho tất cả các vé sự kiện công nghệ. Đăng ký ngay hôm nay để nhận ưu đãi hấp dẫn từ nhà tổ chức."
    },
    {
      title: "Sự kiện âm nhạc EDM hoành tráng",
      type: "Tin tức mới",
      body: "Chào mừng các bạn đến với sự kiện đại nhạc hội EDM lớn nhất mùa hè này. Nhanh tay săn vé ngay!"
    }
  ];

  const getSlides = () => {
    if (history && history.length > 0) {
      return history.map(h => ({
        title: h.title,
        type: h.type === 'Bảo trì' ? 'Bảo trì hệ thống' : 
              h.type === 'Khuyến mãi' ? 'Khuyến mãi' : 'Tin tức mới',
        body: h.body || 'Nội dung thông báo hệ thống...'
      }));
    }
    return defaultSlides;
  };

  
  // Custom Date Time Picker State
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [selectedDateObj, setSelectedDateObj] = useState(new Date(Date.now() + 3600000)); // default to 1 hour later
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  
  const dateTimePickerRef = useRef(null);

  // Loaded Data State
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalReach: "128.4k",
    avgOpenRate: "62.8%",
    negativeFeedback: "0.02%",
    totalReachPercent: 85,
    avgOpenRatePercent: 62,
    negativeFeedbackPercent: 5
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/broadcast');
      setHistory(response.data.history || []);
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử phát tin', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Close picker when clicking outside
    const handleClickOutside = (event) => {
      if (dateTimePickerRef.current && !dateTimePickerRef.current.contains(event.target)) {
        setShowDateTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-slideshow effect
  useEffect(() => {
    const slides = getSlides();
    if (slides.length <= 1) return;
    
    // Only slide if user is NOT actively typing
    if (title.trim() !== '' || body.trim() !== '') {
      return;
    }
    
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [history, title, body]);

  // Compute active slide
  const getActiveSlide = () => {
    if (title.trim() !== '' || body.trim() !== '') {
      return {
        title: title || 'Hệ thống bảo trì',
        type: type,
        body: body || 'Hệ thống EventArchitect sẽ tiến hành bảo trì nâng cấp định kỳ...'
      };
    }
    const slides = getSlides();
    return slides[currentSlideIndex % slides.length] || defaultSlides[0];
  };

  const activeSlide = getActiveSlide();


  // Format string for API (YYYY-MM-DDTHH:mm)
  const apiFormattedTime = `${selectedDateObj.getFullYear()}-${String(selectedDateObj.getMonth() + 1).padStart(2, '0')}-${String(selectedDateObj.getDate()).padStart(2, '0')}T${selectedHour}:${selectedMinute}`;
  
  // Format string for UI display
  const uiFormattedTime = `${selectedHour}:${selectedMinute} - ${String(selectedDateObj.getDate()).padStart(2, '0')}/${String(selectedDateObj.getMonth() + 1).padStart(2, '0')}/${selectedDateObj.getFullYear()}`;

  const handleSendBroadcast = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bản tin!');
      return;
    }
    if (!body.trim()) {
      alert('Vui lòng nhập nội dung bản tin!');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post('/admin/broadcast', {
        title,
        type,
        target,
        body,
        scheduleOption: schedule,
        scheduleTime: schedule === 'now' ? '' : apiFormattedTime
      });

      alert(schedule === 'now' ? 'Bản tin đã được phát đi thành công!' : 'Đã lên lịch phát bản tin thành công!');
      
      // Reset Form
      setTitle('');
      setBody('');
      setSchedule('now');
      
      // Refresh History
      fetchData();
    } catch (error) {
      console.error('Lỗi khi phát bản tin', error);
      alert('Có lỗi xảy ra khi phát bản tin. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to generate days grid for custom calendar
  const generateCalendarDays = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Day of the week for first day (0 = Sunday, 1 = Monday, etc.)
    // Shift so Monday is index 0
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;
    
    const days = [];
    
    // Prev Month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Current Month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Next Month padding
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(pickerMonth, pickerYear);
  const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

  return (
    <div className="p-8 bg-[#f8fafc] min-h-full font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Title Section */}
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            Phát Tin Toàn Cầu
          </h1>
          <p className="text-slate-500 font-medium">
            Gửi thông báo tức thời hoặc lên lịch gửi tin đến các nhóm đối tượng người dùng cụ thể trên toàn hệ thống.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* Main Content: Left Column (8/12) */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* Create New Broadcast Form */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                Tạo bản tin mới
              </h2>

              <div className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Tiêu đề bản tin</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề để thông báo..." 
                    className="w-full bg-slate-100 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-slate-400 font-bold"
                  />
                </div>

                {/* Selectors Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Loại tin</label>
                    <div className="relative">
                      <select 
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-slate-100 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer font-bold pr-10"
                      >
                        <option>Bảo trì hệ thống</option>
                        <option>Tin tức mới</option>
                        <option>Khuyến mãi</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Đối tượng nhận</label>
                    <div className="relative">
                      <select 
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        className="w-full bg-slate-100 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer font-bold pr-10"
                      >
                        <option>Tất cả người dùng</option>
                        <option>Chỉ nhà tổ chức</option>
                        <option>Chỉ người tham gia</option>
                      </select>
                      <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Nội dung thông báo</label>
                  <textarea 
                    rows={6}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Soạn thảo nội dung chi tiết tại đây..." 
                    className="w-full bg-slate-100 border-none rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none placeholder:text-slate-400 font-medium leading-relaxed"
                  ></textarea>
                </div>

                {/* Scheduling */}
                <div className="bg-slate-50 rounded-[24px] p-6 space-y-4">
                  <h3 className="text-sm font-bold text-primary">Tùy chọn lập lịch</h3>
                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="schedule" 
                        className="hidden" 
                        checked={schedule === 'now'} 
                        onChange={() => {
                          setSchedule('now');
                          setShowDateTimePicker(false);
                        }}
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${schedule === 'now' ? 'border-primary' : 'border-slate-300'}`}>
                        {schedule === 'now' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                      </div>
                      <span className={`text-sm font-bold transition-colors ${schedule === 'now' ? 'text-primary' : 'text-slate-500'}`}>Gửi ngay lập tức</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="schedule" 
                        className="hidden" 
                        checked={schedule === 'later'} 
                        onChange={() => setSchedule('later')}
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${schedule === 'later' ? 'border-primary' : 'border-slate-300'}`}>
                        {schedule === 'later' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                      </div>
                      <span className={`text-sm font-bold transition-colors ${schedule === 'later' ? 'text-primary' : 'text-slate-500'}`}>Lên lịch gửi sau</span>
                    </label>
                  </div>

                  {/* PREMIUM CUSTOM DATE/TIME PICKER */}
                  <div className="relative" ref={dateTimePickerRef}>
                     <div 
                       onClick={() => schedule === 'later' && setShowDateTimePicker(!showDateTimePicker)}
                       className={`w-full flex items-center justify-between border rounded-2xl p-4 text-sm font-bold transition-all outline-none ${
                         schedule === 'now' 
                           ? 'bg-slate-100/50 border-slate-200 text-slate-400 cursor-not-allowed'
                           : 'bg-white border-slate-200 text-slate-700 cursor-pointer hover:border-primary/50'
                       }`}
                     >
                       <span className="flex items-center gap-2">
                         <Calendar className={`w-4 h-4 ${schedule === 'now' ? 'text-slate-300' : 'text-primary'}`} />
                         {schedule === 'now' ? 'Tức thời (Không cần lập lịch)' : uiFormattedTime}
                       </span>
                       <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                     </div>

                     {/* Dropdown Calendar & Time Popup */}
                     {showDateTimePicker && schedule === 'later' && (
                       <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-3xl shadow-xl shadow-black/10 border border-slate-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                         {/* Calendar Month Header */}
                         <div className="flex justify-between items-center mb-4">
                           <button 
                             onClick={() => {
                               if (pickerMonth === 0) {
                                 setPickerMonth(11);
                                 setPickerYear(y => y - 1);
                               } else {
                                 setPickerMonth(m => m - 1);
                               }
                             }}
                             className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-colors rounded-xl"
                           >
                             <ChevronRight className="w-4 h-4 rotate-180" />
                           </button>
                           <span className="font-extrabold text-slate-800 text-sm">
                             {monthNames[pickerMonth]}, {pickerYear}
                           </span>
                           <button 
                             onClick={() => {
                               if (pickerMonth === 11) {
                                 setPickerMonth(0);
                                 setPickerYear(y => y + 1);
                               } else {
                                 setPickerMonth(m => m + 1);
                               }
                             }}
                             className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-colors rounded-xl"
                           >
                             <ChevronRight className="w-4 h-4" />
                           </button>
                         </div>

                         {/* Days of Week Header */}
                         <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                           <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                         </div>

                         {/* Days Grid */}
                         <div className="grid grid-cols-7 gap-1 text-center mb-5">
                           {calendarDays.map((dayObj, idx) => {
                             const isSelected = selectedDateObj.getDate() === dayObj.date.getDate() &&
                                                selectedDateObj.getMonth() === dayObj.date.getMonth() &&
                                                selectedDateObj.getFullYear() === dayObj.date.getFullYear();
                             return (
                               <button
                                 key={idx}
                                 onClick={() => setSelectedDateObj(dayObj.date)}
                                 className={`py-2 text-xs font-bold rounded-xl transition-all ${
                                   !dayObj.isCurrentMonth ? 'text-slate-300 hover:bg-slate-50/50' :
                                   isSelected ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105' :
                                   'text-slate-700 hover:bg-slate-50'
                                 }`}
                               >
                                 {dayObj.day}
                               </button>
                             );
                           })}
                         </div>

                         {/* Custom Time Selector */}
                         <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-4 mb-4">
                           <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                             <Clock className="w-3.5 h-3.5 text-primary" /> Giờ gửi:
                           </span>
                           <div className="flex items-center gap-2">
                             <select 
                               value={selectedHour}
                               onChange={(e) => setSelectedHour(e.target.value)}
                               className="bg-slate-100 rounded-xl p-2 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-200/80 transition-colors"
                             >
                               {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                                 <option key={h} value={h}>{h}</option>
                               ))}
                             </select>
                             <span className="font-extrabold text-slate-400">:</span>
                             <select 
                               value={selectedMinute}
                               onChange={(e) => setSelectedMinute(e.target.value)}
                               className="bg-slate-100 rounded-xl p-2 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-200/80 transition-colors"
                             >
                               {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                                 <option key={m} value={m}>{m}</option>
                               ))}
                             </select>
                           </div>
                         </div>

                         {/* Confirm Footer */}
                         <button 
                           onClick={() => setShowDateTimePicker(false)}
                           className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-2xl shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
                         >
                           Áp dụng thiết lập
                         </button>
                       </div>
                     )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setTitle('Nâng cấp định kỳ');
                      setBody('Chào mọi người, hệ thống sẽ bảo trì nâng cấp trong vòng 15 phút tới.');
                    }}
                    className="px-8 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Mẫu thử nhanh
                  </button>
                  <button 
                    disabled={submitting}
                    onClick={handleSendBroadcast}
                    className="px-8 py-3 bg-primary hover:bg-primary-hover disabled:bg-gray-300 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-95"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-4 h-4 fill-current" />
                    )}
                    {schedule === 'now' ? 'Phát tin ngay' : 'Lập lịch gửi'}
                  </button>
                </div>
              </div>
            </div>

            {/* Broadcast History */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  Lịch sử phát tin
                </h2>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-slate-400">Đang tải lịch sử...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-3xl p-6 border border-transparent hover:border-primary/10 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${
                            item.type === 'Bảo trì' ? 'bg-primary/10 text-primary' :
                            item.type === 'Khuyến mãi' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {item.type}
                          </span>
                          <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{item.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Gửi lúc: {item.sentAt}
                          </p>
                        </div>
                        <div className="text-right">
                           <p className="text-2xl font-black text-primary">{item.viewRate}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tỷ lệ xem</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/50">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Reach</p>
                          <p className="font-bold text-slate-700">{item.reach.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Clicks</p>
                          <p className="font-bold text-slate-700">{item.clicks.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Bounce</p>
                          <p className="font-bold text-slate-700">{item.bounce}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Side Panel: Right Column (4/12) */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            
            {/* Live Preview Mockup */}
            <div className="bg-[#1e1b4b] rounded-[40px] p-8 shadow-2xl relative overflow-hidden h-[600px] flex flex-col items-center">
               <div className="flex items-center gap-1 mb-8 w-full justify-end">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
               </div>

               <div className="w-full flex items-center gap-2 text-white/90 mb-12">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">Bản xem trước trực tiếp</span>
               </div>

                {/* Mobile Notification Card */}
                <div 
                   key={activeSlide.title + activeSlide.type} 
                   className="w-full bg-white rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 transform hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-6 duration-500"
                >
                   <div className={`p-6 py-8 flex flex-col items-center text-center text-white relative transition-colors duration-500 ${
                     activeSlide.type === 'Bảo trì hệ thống' ? 'bg-primary' :
                     activeSlide.type === 'Khuyến mãi' ? 'bg-emerald-600' : 'bg-orange-500'
                   }`}>
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                         {activeSlide.type === 'Bảo trì hệ thống' ? (
                           <AlertCircle className="w-6 h-6 text-white" />
                         ) : activeSlide.type === 'Khuyến mãi' ? (
                           <Sparkles className="w-6 h-6 text-white" />
                         ) : (
                           <Bell className="w-6 h-6 text-white" />
                         )}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">
                        {activeSlide.type === 'Bảo trì hệ thống' ? 'Thông báo hệ thống' :
                         activeSlide.type === 'Khuyến mãi' ? 'Ưu đãi đặc biệt' : 'Tin tức cập nhật'}
                      </p>
                      <h4 className="text-xl font-bold line-clamp-1">{activeSlide.title}</h4>
                   </div>
                   <div className="p-6 space-y-4">
                      <div>
                         <h5 className="font-bold text-slate-800 mb-2">Chào quản trị viên,</h5>
                         <p className="text-sm text-slate-500 leading-relaxed min-h-[100px] max-h-[140px] overflow-y-auto">
                            {activeSlide.body}
                         </p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                         <button className="text-[11px] font-bold text-slate-400 flex items-center gap-1 hover:text-slate-600 transition-colors">
                            Xem chi tiết <ChevronRight className="w-3 h-3" />
                         </button>
                         <button className={`text-white text-[11px] font-black px-6 py-2 rounded-xl transition-colors duration-500 ${
                           activeSlide.type === 'Bảo trì hệ thống' ? 'bg-primary' :
                           activeSlide.type === 'Khuyến mãi' ? 'bg-emerald-600' : 'bg-orange-500'
                         }`}>
                            ĐÃ HIỂU
                         </button>
                      </div>
                   </div>
                </div>

                {/* Slideshow pagination dots */}
                {!(title.trim() !== '' || body.trim() !== '') && (
                   <div className="flex gap-1.5 mt-4 z-10">
                      {getSlides().map((_, idx) => (
                         <div 
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              idx === (currentSlideIndex % getSlides().length) ? 'w-6 bg-indigo-400' : 'w-1.5 bg-indigo-950/60'
                            }`}
                         ></div>
                      ))}
                   </div>
                )}

               <div className="absolute bottom-6 w-full text-center">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Giao diện di động mô phỏng</p>
               </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-8">
               <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Tổng quan hiệu quả tuần
               </h2>

               <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-slate-500 font-medium">Tổng lượt tiếp cận</span>
                    <span className="text-xl font-black text-primary">{stats.totalReach}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${stats.totalReachPercent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-slate-500 font-medium">Tỷ lệ mở trung bình</span>
                    <span className="text-xl font-black text-primary">{stats.avgOpenRate}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000 opacity-60" style={{ width: `${stats.avgOpenRatePercent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-slate-500 font-medium">Phản hồi tiêu cực</span>
                    <span className="text-xl font-black text-primary">{stats.negativeFeedback}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${stats.negativeFeedbackPercent}%` }}></div>
                  </div>
                </div>
               </div>

               {/* Tip Box */}
               <div className="bg-blue-50/50 border border-blue-100 rounded-[24px] p-6 flex gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                     <Info className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                     "Mẹo: Gửi thông báo vào khoảng 9-10h sáng thứ Ba thường có tỷ lệ xem cao hơn 25%."
                  </p>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default BroadcastPage;
