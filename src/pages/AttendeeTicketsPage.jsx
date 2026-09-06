import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Share2,
  Download,
  MapPin,
  Calendar,
  Clock,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  AlertCircle,
  Tag,
  Search,
  ChevronRight,
  ChevronLeft,
  Layers,
  Printer
} from 'lucide-react';
import { registrationService } from '../services/registrationService';

const categoryMap = {
  MUSIC: { label: 'ÂM NHẠC', icon: 'music_note', color: 'from-pink-500 to-rose-600', text: 'text-rose-500', bg: 'bg-rose-50' },
  TECH: { label: 'CÔNG NGHỆ', icon: 'lan', color: 'from-blue-500 to-indigo-600', text: 'text-indigo-500', bg: 'bg-indigo-50' },
  FOOD: { label: 'ẨM THỰC', icon: 'restaurant', color: 'from-amber-500 to-orange-600', text: 'text-orange-500', bg: 'bg-orange-50' },
  ART: { label: 'NGHỆ THUẬT', icon: 'palette', color: 'from-purple-500 to-violet-600', text: 'text-violet-500', bg: 'bg-violet-50' },
  BUSINESS: { label: 'DOANH NGHIỆP', icon: 'rocket_launch', color: 'from-emerald-500 to-teal-600', text: 'text-emerald-500', bg: 'bg-emerald-50' },
  SPORTS: { label: 'THỂ THAO', icon: 'sports_soccer', color: 'from-sky-500 to-blue-600', text: 'text-sky-500', bg: 'bg-sky-50' },
  EDUCATION: { label: 'GIÁO DỤC', icon: 'school', color: 'from-cyan-500 to-blue-500', text: 'text-cyan-600', bg: 'bg-cyan-50' },
  ENTERTAINMENT: { label: 'GIẢI TRÍ', icon: 'celebration', color: 'from-fuchsia-500 to-pink-600', text: 'text-fuchsia-500', bg: 'bg-fuchsia-50' },
  OTHER: { label: 'KHÁC', icon: 'event', color: 'from-slate-500 to-slate-700', text: 'text-slate-600', bg: 'bg-slate-50' }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  if (price === undefined || price === null || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const AttendeeTicketsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [registrations, setRegistrations] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [ticketViewMode, setTicketViewMode] = useState('single');

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await registrationService.getMyRegistrations();
        const data = response.data || [];
        setRegistrations(data);

        const selectedId = location.state?.selectedRegId;
        if (selectedId) {
          const matched = data.find(r => r.id === selectedId);
          if (matched) {
            setSelectedReg(matched);
            return;
          }
        }

        if (data.length > 0) {
          setSelectedReg(data[0]);
        }
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setError('Không thể tải danh sách vé. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [location.state]);

  useEffect(() => {
    setActiveTicketIndex(0);
  }, [selectedReg?.id]);

  if (loading) {
    return (
      <div className="p-8 lg:p-12 flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Đang tải vé của bạn...</p>
      </div>
    );
  }

  const filteredRegistrations = registrations.filter(reg =>
    reg.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (registrations.length === 0) {
    return (
      <div className="p-8 lg:p-12 flex flex-col items-center justify-center min-h-[600px] text-center bg-gradient-to-b from-white to-slate-50/50">
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-indigo-200 animate-bounce">
          <span className="material-symbols-outlined text-5xl">confirmation_number</span>
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Chưa có vé nào được đăng ký</h2>
        <p className="text-slate-500 text-sm max-w-[440px] mb-8 leading-relaxed font-medium">
          Bạn chưa sở hữu chiếc vé nào. Hãy tham gia ngay các sự kiện âm nhạc, công nghệ và nghệ thuật đỉnh cao để nhận vé điện tử của bạn!
        </p>
        <button
          onClick={() => navigate('/attendee/explore')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4.5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>Khám phá sự kiện ngay</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const activeReg = selectedReg || registrations[0];
  const catInfo = categoryMap[activeReg.eventCategory] || categoryMap.OTHER;

  return (
    <div className="pt-4 lg:pt-5 pb-6 px-6 lg:px-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#fbfcff]">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden !important; }
          #printable-ticket-card, #printable-ticket-card * { visibility: visible !important; }
          #printable-ticket-card { position: absolute !important; left: 50% !important; top: 20px !important; transform: translateX(-50%) !important; width: 100% !important; max-width: 580px !important; border: 1px solid #e2e8f0 !important; border-radius: 24px !important; box-shadow: none !important; margin: 0 !important; height: auto !important; overflow: visible !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />

      <div className="relative p-6 lg:p-7 rounded-[32px] bg-white border border-slate-100/80 shadow-[0_15px_40px_rgba(92,70,229,0.03)] overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/70 border border-indigo-100/30 px-3.5 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">
                NEXUS WALLET
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50/70 border border-emerald-100/30 px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {registrations.length} Vé hoạt động
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Vé của tôi
              </h1>
              <p className="text-xs font-semibold text-slate-450 leading-relaxed max-w-none">
                Nơi quản lý vé thông minh của bạn. Hãy chọn một sự kiện bất kỳ để xem nhanh thông tin chi tiết và xuất trình mã QR Check-in.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto shrink-0">
            <button
              onClick={() => window.print()}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-900 px-5.5 py-3 rounded-xl font-black text-xs transition-all active:scale-95 shadow-sm"
            >
              <Printer className="w-4.5 h-4.5 text-slate-650" />
              <span>In hóa đơn</span>
            </button>

            <button
              onClick={() => navigate('/attendee/explore')}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-black text-xs transition-all active:scale-95 shadow-md shadow-indigo-100/60"
            >
              <span>Khám phá thêm</span>
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 flex-1 min-h-0 mt-6 lg:mt-8">
        <div className="xl:col-span-4 flex flex-col h-full min-h-0 space-y-4">
          <div className="space-y-3 flex-shrink-0">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Hóa đơn của bạn</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm sự kiện bằng tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-2 no-scrollbar">
            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 p-6">
                <p className="text-slate-400 text-xs font-bold">Không tìm thấy hóa đơn nào</p>
              </div>
            ) : (
              filteredRegistrations.map((reg) => {
                const isActive = activeReg.id === reg.id;
                const dateStr = reg.confirmedAt || reg.createdAt;
                const regCat = categoryMap[reg.eventCategory] || categoryMap.OTHER;
                return (
                  <div
                    key={reg.id}
                    onClick={() => setSelectedReg(reg)}
                    className={`p-5 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${isActive
                      ? 'bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/10 border-2 border-indigo-600 shadow-md shadow-indigo-100/45 border-l-4 border-l-indigo-600'
                      : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-sm border-l-4 border-l-transparent'
                      }`}
                  >
                    <div className="flex justify-between items-center gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${reg.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                          {reg.status === 'CONFIRMED' ? 'Đã xác thực' : 'Đang xử lý'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${regCat.color}`} />
                          <span className="text-[10px] text-slate-700 font-black tracking-wide uppercase">
                            {regCat.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-700 font-black">
                        {formatDate(dateStr).split(',')[1]}
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-[14px] line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {reg.eventTitle || 'Sự kiện'}
                    </h4>
                    <div className="flex justify-between items-center pt-3.5 mt-3.5 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-750 font-extrabold">
                        <span className="material-symbols-outlined text-[16px] text-slate-600">confirmation_number</span>
                        <span className="text-xs">{reg.tickets?.length || 0} vé</span>
                      </div>
                      <span className="text-slate-900 font-black text-sm tracking-tight">
                        {formatPrice(reg.finalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="xl:col-span-5 flex flex-col h-full min-h-0 space-y-4">
          <div id="printable-ticket-card" className="bg-white rounded-[40px] overflow-hidden shadow-xl shadow-slate-100 border border-slate-200/80 flex flex-col h-full min-h-0 relative">
            <div className="relative w-full h-[180px] overflow-hidden shrink-0 bg-slate-950 flex flex-col justify-end p-8">
              {activeReg.eventBannerUrl ? (
                <img
                  src={activeReg.eventBannerUrl}
                  alt=""
                  onError={(e) => { e.target.style.display = 'none'; }}
                  className="absolute inset-0 w-full h-full object-cover opacity-65"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-indigo-950 opacity-80" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
              <div className="relative z-20 space-y-2">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-widest bg-gradient-to-r ${catInfo.color} shadow-sm inline-block`}>
                  {catInfo.label}
                </span>
                <h3 className="text-xl font-black text-white leading-tight tracking-tight line-clamp-2">
                  {activeReg.eventTitle}
                </h3>
              </div>
            </div>

            {/* 2. Sleek Ticket Notch Separator */}
            <div className="relative flex items-center justify-between shrink-0 bg-white">
              {/* Left Cutout */}
              <div className="w-4 h-8 bg-[#fbfcff] rounded-r-full border-y border-r border-slate-200 -ml-0.5" />
              {/* Dashed Line */}
              <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-3" />
              {/* Right Cutout */}
              <div className="w-4 h-8 bg-[#fbfcff] rounded-l-full border-y border-l border-slate-200 -mr-0.5" />
            </div>

            {/* 3. Ticket Navigation & View Mode Switcher (if multiple tickets) */}
            {activeReg.status === 'CONFIRMED' && activeReg.tickets && activeReg.tickets.length > 1 && (
              <div className="px-6 pt-3 pb-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[65%]">
                  {activeReg.tickets.map((t, idx) => (
                    <button
                      key={t.id || idx}
                      onClick={() => {
                        setActiveTicketIndex(idx);
                        setTicketViewMode('single');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 ${
                        ticketViewMode === 'single' && activeTicketIndex === idx
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                          : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      <span>Vé #{idx + 1}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => setTicketViewMode('single')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                      ticketViewMode === 'single'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Từng vé
                  </button>
                  <button
                    onClick={() => setTicketViewMode('list')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 ${
                      ticketViewMode === 'list'
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Tất cả ({activeReg.tickets.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. QR Codes / Tickets Listing inside */}
            <div className="p-6 pt-4 flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col bg-white">

              {activeReg.status !== 'CONFIRMED' && (
                <div className="p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/30 border border-amber-300 rounded-3xl flex items-start gap-4 shadow-sm shadow-amber-100/40">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-3.5 flex-1">
                    <div className="space-y-1">
                      <h5 className="font-black text-amber-900 text-sm tracking-tight">Giao dịch chưa hoàn tất</h5>
                      <p className="text-amber-800/80 text-xs leading-relaxed font-semibold">
                        Đăng ký của bạn chưa được thanh toán thành công. Hãy hoàn tất thanh toán để nhận vé tham gia.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/events/${activeReg.eventSlug}`, {
                        state: { pendingRegistrationId: activeReg.id }
                      })}
                      className="bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-md shadow-indigo-200/65 inline-flex items-center gap-1.5"
                    >
                      Thanh toán ngay
                    </button>
                  </div>
                </div>
              )}

              {activeReg.status === 'CONFIRMED' && activeReg.tickets && (
                ticketViewMode === 'single' ? (
                  (() => {
                    const currentTicket = activeReg.tickets[activeTicketIndex] || activeReg.tickets[0];
                    return (
                      <div className="flex-1 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-50/80 to-indigo-50/20 rounded-3xl border border-slate-200/70 shadow-sm min-h-0">
                        {/* QR Code container */}
                        <div className="bg-white p-4 rounded-3xl shadow-md shadow-indigo-100/40 border border-slate-100 flex items-center justify-center shrink-0">
                          <QRCodeSVG
                            value={currentTicket.qrCodeToken || currentTicket.ticketCode}
                            title="QR Code Check-in"
                            marginSize={2}
                            className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                          />
                        </div>

                        {/* Ticket Details */}
                        <div className="text-center space-y-1.5 my-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            Mã vé {activeReg.tickets.length > 1 ? `(${activeTicketIndex + 1}/${activeReg.tickets.length})` : ''}
                          </span>
                          <p className="text-2xl font-black text-indigo-700 tracking-tight font-mono">
                            #{currentTicket.ticketCode}
                          </p>

                          <div className="flex items-center justify-center gap-2 pt-0.5">
                            <span className="inline-block px-3 py-1 bg-indigo-100/80 text-indigo-800 text-[11px] font-black rounded-xl uppercase tracking-wider">
                              {currentTicket.ticketTypeName}
                            </span>
                            <div className="bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-[10px] font-black uppercase tracking-wider">Hợp lệ</span>
                            </div>
                          </div>
                        </div>

                        {/* Navigation controls if multiple tickets */}
                        {activeReg.tickets.length > 1 && (
                          <div className="flex items-center justify-between w-full pt-3 border-t border-slate-200/70 shrink-0">
                            <button
                              onClick={() => setActiveTicketIndex(prev => Math.max(0, prev - 1))}
                              disabled={activeTicketIndex === 0}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm transition"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Vé trước</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              {activeReg.tickets.map((_, dotIdx) => (
                                <button
                                  key={dotIdx}
                                  onClick={() => setActiveTicketIndex(dotIdx)}
                                  className={`h-2 rounded-full transition-all ${
                                    activeTicketIndex === dotIdx 
                                      ? 'w-6 bg-indigo-600' 
                                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                                  }`}
                                />
                              ))}
                            </div>

                            <button
                              onClick={() => setActiveTicketIndex(prev => Math.min(activeReg.tickets.length - 1, prev + 1))}
                              disabled={activeTicketIndex === activeReg.tickets.length - 1}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm transition"
                            >
                              <span>Vé sau</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  /* List View: All tickets stacked with shrink-0, min-h, clear borders */
                  <div className="flex flex-col gap-4 overflow-y-auto pr-1">
                    {activeReg.tickets.map((t, idx) => (
                      <div
                        key={t.id || idx}
                        className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl shrink-0 shadow-sm hover:border-indigo-200 transition"
                      >
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-sm shrink-0">
                          <QRCodeSVG
                            value={t.qrCodeToken || t.ticketCode}
                            title="QR Code"
                            marginSize={2}
                            className="w-24 h-24 object-contain"
                          />
                        </div>

                        <div className="text-center sm:text-left space-y-2 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              Vé #{idx + 1}
                            </span>
                            <div className="bg-emerald-100/80 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[9px] font-black uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              Hợp lệ
                            </div>
                          </div>
                          <p className="text-lg font-black text-indigo-700 tracking-tight font-mono">
                            #{t.ticketCode}
                          </p>
                          <span className="inline-block px-2.5 py-1 bg-indigo-100/80 text-indigo-800 text-[10px] font-black rounded-lg uppercase tracking-wider">
                            {t.ticketTypeName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Ticket Footer details */}
            <div className="px-8 pb-6 bg-white flex justify-between items-center text-[11px] font-bold text-slate-400 pt-4 flex-shrink-0 border-t border-slate-100">
              <span>Hệ thống Prestige Planner</span>
              <span>Hỗ trợ check-in 24/7</span>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule Details & Smart Wallets */}

        <div className="xl:col-span-3 flex flex-col h-full min-h-0 overflow-y-auto no-scrollbar gap-6">

          {/* Detailed Schedule info */}
          <div className="bg-white p-6 rounded-[32px] border border-slate-200/80 shadow-sm space-y-6 flex-shrink-0">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Chi tiết lịch trình</h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-11 h-11 bg-indigo-50/70 border border-indigo-100/60 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Thời gian bắt đầu</p>
                  <p className="text-[14.5px] font-black text-slate-900 leading-snug">
                    {formatDate(activeReg.eventStartDate) || 'Đang cập nhật'}
                  </p>
                  <p className="text-xs text-slate-700 font-extrabold">
                    {formatTime(activeReg.eventStartDate)} - {formatTime(activeReg.eventEndDate)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <div className="w-11 h-11 bg-purple-50/70 border border-purple-100/60 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Địa điểm tổ chức</p>
                  <p className="text-[14.5px] font-black text-slate-900 leading-snug">
                    {activeReg.eventVenue || 'Đang cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Smart Wallet Integrations */}
          <div className="space-y-3 pt-2 flex-shrink-0">
            <button className="w-full bg-white border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-900 py-3.5 rounded-2xl flex items-center justify-center gap-3 font-black transition-all active:scale-95 text-xs shadow-sm">
              <Smartphone className="w-5 h-5 text-indigo-600" />
              <span>Thêm vào Google Wallet</span>
            </button>
            <button className="w-full bg-black hover:bg-zinc-900 text-white py-3.5 rounded-2xl flex items-center justify-center gap-3 font-black transition-all active:scale-95 text-xs shadow-md">
              <Wallet className="w-5 h-5 text-white/90" />
              <span>Thêm vào Apple Wallet</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttendeeTicketsPage;
