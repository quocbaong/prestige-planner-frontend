import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, QrCode, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../stores/AuthContext';
import { registrationService } from '../services/registrationService';

const categoryMap = {
  MUSIC: { label: 'ÂM NHẠC', color: 'from-pink-500 to-rose-600', text: 'text-rose-500', bg: 'bg-rose-50' },
  TECH: { label: 'CÔNG NGHỆ', color: 'from-blue-500 to-indigo-600', text: 'text-indigo-500', bg: 'bg-indigo-50' },
  FOOD: { label: 'ẨM THỰC', color: 'from-amber-500 to-orange-600', text: 'text-orange-500', bg: 'bg-orange-50' },
  ART: { label: 'NGHỆ THUẬT', color: 'from-purple-500 to-violet-600', text: 'text-violet-500', bg: 'bg-purple-50' },
  BUSINESS: { label: 'DOANH NGHIỆP', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-500', bg: 'bg-emerald-50' },
  SPORTS: { label: 'THỂ THAO', color: 'from-sky-500 to-blue-600', text: 'text-sky-500', bg: 'bg-sky-50' },
  EDUCATION: { label: 'GIÁO DỤC', color: 'from-cyan-500 to-blue-500', text: 'text-cyan-600', bg: 'bg-cyan-50' },
  ENTERTAINMENT: { label: 'GIẢI TRÍ', color: 'from-fuchsia-500 to-pink-600', text: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
  OTHER: { label: 'KHÁC', color: 'from-slate-500 to-slate-700', text: 'text-slate-655', bg: 'bg-slate-50' }
};

const AttendeeQRPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [activeTicketIdx, setActiveTicketIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await registrationService.getMyRegistrations();
        const data = response.data || [];
        
        // Filter out only CONFIRMED registrations with valid tickets
        const confirmedRegs = data.filter(r => r.status === 'CONFIRMED' && r.tickets && r.tickets.length > 0);
        setRegistrations(confirmedRegs);

        // Check if navigated with a specific registration from state
        const passedId = location.state?.selectedRegId;
        if (passedId) {
          const matched = confirmedRegs.find(r => r.id === passedId);
          if (matched) {
            setSelectedReg(matched);
            return;
          }
        }

        if (confirmedRegs.length > 0) {
          setSelectedReg(confirmedRegs[0]);
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError('Không thể tải thông tin vé của bạn.');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [location.state]);

  if (loading) {
    return (
      <div className="p-8 lg:p-12 flex flex-col items-center justify-center min-h-[500px] gap-4 bg-[#fbfcff]">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Đang khởi tạo mã check-in...</p>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-6 text-center bg-[#fbfcff] min-h-[600px] flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[28px] border border-indigo-100 flex items-center justify-center mb-6 shadow-sm">
          <QrCode className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Chưa có vé để Check-in</h2>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed max-w-[320px] mb-8">
          Bạn cần có các đăng ký sự kiện đã thanh toán thành công để hiển thị mã QR Check-in tại quầy đón tiếp.
        </p>
        <button
          onClick={() => navigate('/events')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-black text-xs shadow-md shadow-indigo-100 transition-all active:scale-95"
        >
          Khám phá sự kiện ngay
        </button>
      </div>
    );
  }

  const activeReg = selectedReg || registrations[0];
  const ticketsList = activeReg.tickets || [];
  const currentTicket = ticketsList[activeTicketIdx] || ticketsList[0];
  
  // Format dates
  const formatEventDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const qrDataValue = currentTicket?.qrCodeToken || currentTicket?.ticketCode || '';

  return (
    <div className={`transition-colors duration-300 ${isHighContrast ? 'bg-white' : 'bg-[#fbfcff]'} min-h-screen pb-20`}>
      <div className="max-w-2xl mx-auto py-8 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Navigation back header */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-black uppercase tracking-wider">Sẵn sàng Check-in</span>
          </div>
        </div>

        {/* Dropdown selector for event */}
        <div className="space-y-2 mb-8">
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">
            Chọn sự kiện check-in
          </label>
          <select
            value={activeReg.id}
            onChange={(e) => {
              const matched = registrations.find(r => r.id === e.target.value);
              if (matched) {
                setSelectedReg(matched);
                setActiveTicketIdx(0);
              }
            }}
            className="w-full bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-900 rounded-2xl py-3 px-4 font-black text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            {registrations.map(r => (
              <option key={r.id} value={r.id}>
                {r.eventTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Outer QR Code container */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative group mb-6">
            {/* Decorative Corner Scanning Corners */}
            <div className="absolute -top-4 -left-4 w-10 h-10 border-t-4 border-l-4 border-indigo-600 rounded-tl-2xl"></div>
            <div className="absolute -top-4 -right-4 w-10 h-10 border-t-4 border-r-4 border-indigo-600 rounded-tr-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-10 h-10 border-b-4 border-l-4 border-indigo-600 rounded-bl-2xl"></div>
            <div className="absolute -bottom-4 -right-4 w-10 h-10 border-b-4 border-r-4 border-indigo-600 rounded-br-2xl"></div>

            {/* QR Card Frame */}
            <div className="w-[320px] h-[320px] bg-white rounded-[36px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-200/80 flex flex-col items-center justify-center p-8 transition-transform duration-300 hover:scale-[1.01] relative overflow-hidden">
              {/* QR Image */}
              <div className="w-48 h-48 relative flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataValue)}`}
                  alt="Check-in QR Code"
                  className="w-full h-full object-contain"
                />
                
                {/* Dynamic scan line overlay */}
                <div className="absolute left-0 right-0 h-0.5 bg-indigo-500/30 animate-pulse pointer-events-none"></div>
              </div>

              {/* Ticket code readout */}
              <p className="mt-4 text-xs font-black text-indigo-700 tracking-wider">
                MÃ VÉ: #{currentTicket?.ticketCode}
              </p>
              <p className="text-[9px] font-black text-slate-400 tracking-[0.15em] uppercase mt-1">
                Quét để Check-in vào cổng
              </p>
            </div>
          </div>

          {/* Ticket switcher (if multiple tickets in this registration) */}
          {ticketsList.length > 1 && (
            <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-sm p-1.5 rounded-xl mb-4">
              <button 
                onClick={() => setActiveTicketIdx(prev => Math.max(0, prev - 1))}
                disabled={activeTicketIdx === 0}
                className="p-1.5 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-slate-800">
                Vé {activeTicketIdx + 1} / {ticketsList.length}
              </span>
              <button 
                onClick={() => setActiveTicketIdx(prev => Math.min(ticketsList.length - 1, prev + 1))}
                disabled={activeTicketIdx === ticketsList.length - 1}
                className="p-1.5 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* High contrast toggle for scanner help */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            className="flex items-center gap-2 border-2 border-slate-300 hover:border-slate-400 bg-white px-5 py-2.5 rounded-xl font-black text-xs text-slate-900 transition-all active:scale-95 shadow-sm"
          >
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{isHighContrast ? "Tắt nền trắng sáng" : "Tăng độ sáng tối đa để quét"}</span>
          </button>
        </div>

        {/* Live Ticket Details */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Đăng ký của tôi</p>
              <h3 className="text-base font-black text-slate-950 leading-snug">{activeReg.eventTitle}</h3>
            </div>
            <span className="bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-lg border border-indigo-100 text-[9px] font-black uppercase tracking-wider">
              {currentTicket?.ticketTypeName || 'Standard'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-455 uppercase tracking-widest mb-0.5">Người tham gia</p>
              <p className="text-xs font-black text-slate-800">{user?.fullName || "Nguyễn Văn Khách"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-455 uppercase tracking-widest mb-0.5">Mã đăng ký</p>
              <p className="text-xs font-black text-slate-800">#{activeReg.id.toString().substring(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-455 uppercase tracking-widest mb-0.5">Thời gian diễn ra</p>
              <p className="text-xs font-bold text-slate-800 leading-snug">{formatEventDate(activeReg.eventStartDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-455 uppercase tracking-widest mb-0.5">Địa điểm</p>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">{activeReg.eventVenue || 'Đang cập nhật'}</p>
            </div>
          </div>
        </div>

        {/* Simple note card */}
        <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-slate-600 leading-relaxed">
            Mã QR này được cập nhật theo tài khoản của bạn. Vui lòng không chia sẻ mã này để tránh mất quyền check-in.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AttendeeQRPage;
