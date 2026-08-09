import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventService } from '../services/eventService';

const OrganizerTimelinePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await eventService.getEvents();
        setEvents(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu sự kiện cho Timeline:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const activeEvent = events.find(e => e.status === 'PUBLISHED' || e.status === 'LIVE') || events[0] || {
    title: 'Tech Fusion Summit 2026',
    venue: 'GEM Center, Hồ Chí Minh',
    startDate: '2026-05-20T08:00:00',
    currentAttendees: 245,
    maxAttendees: 400
  };

  const currentCount = activeEvent.currentAttendees || 245;
  const maxCount = activeEvent.maxAttendees || 400;
  const checkInPercent = Math.min(100, Math.round((currentCount / maxCount) * 100));

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-700 bg-[#f8fafc] min-h-[calc(100vh-80px)]">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-headline tracking-tight mb-2">{activeEvent.title}</h2>
          <p className="text-slate-500 font-medium text-sm">
            Hành trình trải nghiệm từ chuẩn bị đến bế mạc • {activeEvent.startDate ? new Date(activeEvent.startDate).toLocaleDateString('vi-VN') : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-full border border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Xuất PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-full shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Chỉnh sửa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

        {/* Main Timeline Column */}
        <div className="xl:col-span-2 relative pl-4 lg:pl-0">

          {/* Continuous Vertical Line */}
          <div className="absolute left-8 lg:left-10 top-4 bottom-4 w-0.5 bg-indigo-100 z-0"></div>

          <div className="space-y-8 relative z-10">

            {/* Timeline Item 1 */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-6">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm relative z-10">
                <span className="material-symbols-outlined text-indigo-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
              </div>
              <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 border-l-4 border-l-indigo-400 relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Giai đoạn 1</span>
                  <span className="text-slate-400 font-medium text-sm">07:00 - 08:30</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Công tác Chuẩn bị</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Kiểm tra kỹ thuật âm thanh, ánh sáng và bố trí không gian sảnh đón khách. Toàn bộ nhân sự vào vị trí trực chiến.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Trạng thái</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hoàn thành
                    </div>
                  </div>
                  <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Nhân sự</p>
                    <p className="text-sm font-bold text-slate-700">12 thành viên</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Hạng mục</p>
                    <p className="text-sm font-bold text-slate-700">15 checklist</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Timeline Item 2 - Active */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-6">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-white border-2 border-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100 relative z-10">
                <span className="material-symbols-outlined text-indigo-600 text-2xl font-bold">how_to_reg</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              </div>
              <div className="flex-1 bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 border-l-4 border-l-indigo-600 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Giai đoạn 2</span>
                  <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full">Đang diễn ra</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 relative z-10">Check-in & Đón khách</h3>

                <div className="mb-6 relative z-10">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500">Tỷ lệ khách đã đến</span>
                    <span className="text-sm font-black text-slate-900">{currentCount} / {maxCount}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${checkInPercent}%` }}></div>
                  </div>
                </div>

                <div className="bg-indigo-50/50 rounded-xl p-4 flex gap-3 border border-indigo-100 relative z-10">
                  <span className="material-symbols-outlined text-indigo-600" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <p className="text-sm font-medium text-indigo-900">
                    <span className="font-bold">Lưu ý:</span> Luồng khách VIP đang tập trung cao tại cổng A. Yêu cầu tăng cường lễ tân.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Timeline Item 3 */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-6">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm relative z-10">
                <span className="material-symbols-outlined text-slate-400 text-2xl">campaign</span>
              </div>
              <div className="flex-1 bg-white/60 rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Giai đoạn 3</span>
                  <span className="text-slate-400 font-medium text-sm">09:00 - 09:30</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Khai mạc Sự kiện</h3>

                <div className="flex items-center gap-4">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Speaker" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                    Phát biểu khai mạc bởi Giám đốc điều hành và nghi thức nhấn nút khởi động sự kiện.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Timeline Item 4 */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex gap-6">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm relative z-10">
                <span className="material-symbols-outlined text-slate-400 text-2xl">record_voice_over</span>
              </div>
              <div className="flex-1 bg-white/60 rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Giai đoạn 4</span>
                  <span className="text-slate-400 font-medium text-sm">09:30 - 11:00</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Keynote: Tương lai AI</h3>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <p className="text-slate-600 text-sm font-medium">
                    Diễn giả chính: TS. Nguyễn Thành Nam
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Timeline Item 5 */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex gap-6 opacity-60">
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-transparent border-2 border-dashed border-slate-300 flex items-center justify-center relative z-10">
                <span className="material-symbols-outlined text-slate-400 text-2xl">check_circle</span>
              </div>
              <div className="flex-1 bg-transparent rounded-2xl p-6 border-2 border-dashed border-slate-200">
                <h3 className="text-xl font-bold text-slate-600 mb-2">Bế mạc & Trao giải</h3>
                <p className="text-slate-500 text-sm">Tổng kết, vinh danh và tiệc trà giao lưu (Networking).</p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Right Sidebar Columns */}
        <div className="space-y-6">

          {/* Overview Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-[#5c46e5] rounded-3xl p-8 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="text-lg font-bold mb-8 relative z-10">Tổng quan thời gian</h3>

            <div className="space-y-6 relative z-10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <span className="material-symbols-outlined text-white">schedule</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-0.5">Tổng thời lượng</p>
                  <p className="font-bold">5 giờ 30 phút</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <span className="material-symbols-outlined text-white">history_toggle_off</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-0.5">Giai đoạn hiện tại</p>
                  <p className="font-bold">Check-in ({checkInPercent}%)</p>
                </div>
              </div>
            </div>

            <button className="w-full py-3.5 bg-white text-indigo-600 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm">
              Xem báo cáo trực tiếp
            </button>
          </div>

          {/* Upcoming Tasks Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-indigo-600" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
              <h3 className="font-bold text-slate-900">Nhiệm vụ sắp tới</h3>
            </div>

            <div className="space-y-3">
              {[
                { id: 1, text: "Kiểm tra Micro diễn giả" },
                { id: 2, text: "Bật nhạc nền sảnh chính" },
                { id: 3, text: "Chuẩn bị quà tặng VIP" },
              ].map(task => (
                <label key={task.id} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center bg-white"></div>
                  <span className="text-sm font-medium text-slate-700">{task.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Map Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6">Sơ đồ mặt bằng</h3>
            <div className="relative">
              {/* Map Image Container */}
              <div className="relative rounded-2xl overflow-hidden group bg-slate-100 shadow-inner">
                {/* Google Maps Embed */}
                <iframe
                  title="Event Location"
                  src="https://maps.google.com/maps?q=GEM%20Center%20Ho%20Chi%20Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-48 border-0 grayscale-[30%] contrast-125"
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>

                {/* Overlay to style the map and prevent accidental scrolling */}
                <div className="absolute inset-0 bg-indigo-900/10 pointer-events-none group-hover:bg-transparent transition-colors duration-500"></div>

                {/* Badge */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-slate-100 truncate max-w-[200px]">
                  {activeEvent.venue || 'GEM Center'}
                </div>
              </div>

              {/* Floating Add Button - Positioned exactly on the right edge */}
              <button className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all z-10">
                <span className="material-symbols-outlined font-bold text-xl">add</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrganizerTimelinePage;
