import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Heart, Armchair } from 'lucide-react';
import { useAuth } from '../stores/useAuth';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import LandingNavbar from '../components/common/LandingNavbar';
import LandingFooter from '../components/common/LandingFooter';
import { bookingAvailability } from '../lib/booking';
import { QRCodeSVG } from 'qrcode.react';
import SeatSelectionModal from '../components/modals/SeatSelectionModal';

const categoryMap = {
  MUSIC: { label: 'ÂM NHẠC', icon: 'music_note' },
  TECH: { label: 'CÔNG NGHỆ', icon: 'lan' },
  FOOD: { label: 'ẨM THỰC', icon: 'restaurant' },
  ART: { label: 'NGHỆ THUẬT', icon: 'palette' },
  BUSINESS: { label: 'DOANH NGHIỆP', icon: 'rocket_launch' },
  SPORTS: { label: 'THỂ THAO', icon: 'sports_soccer' },
  EDUCATION: { label: 'GIÁO DỤC', icon: 'school' },
  ENTERTAINMENT: { label: 'GIẢI TRÍ', icon: 'celebration' },
  OTHER: { label: 'KHÁC', icon: 'event' }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
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

const getTicketAvailabilityReason = (ticket, event, now = Date.now()) => {
  if (event?.isSalesActive === false) return 'Tạm ngừng bán';
  if (ticket?.isActive === false) return 'Đã ngừng bán';
  if (ticket?.saleStartDate && now < Date.parse(ticket.saleStartDate)) {
    return `Mở bán từ ${formatDate(ticket.saleStartDate)}`;
  }
  if (ticket?.saleEndDate && now >= Date.parse(ticket.saleEndDate)) return 'Đã hết hạn';

  const remaining = (ticket?.totalQuantity || 0) - (ticket?.soldQuantity || 0);
  if (remaining <= 0 || ticket?.maxPerOrder === 0) return 'Hết vé';
  return '';
};

const getPendingRegistrationStorageKey = (userId, eventSlug) => (
  userId && eventSlug
    ? `prestige-planner:pending-registration:${userId}:${encodeURIComponent(eventSlug)}`
    : null
);

const hasCompleteRegistration = (registration, expectedTicketCount) => {
  const tickets = Array.isArray(registration?.tickets) ? registration.tickets : [];
  const expected = Number(expectedTicketCount);
  return registration?.status === 'CONFIRMED'
    && Number.isInteger(expected)
    && expected > 0
    && tickets.length === expected
    && tickets.every(ticket => (
      ['ACTIVE', 'USED'].includes(ticket.status)
      && typeof ticket.qrCodeToken === 'string'
      && ticket.qrCodeToken.trim().length > 0
      && typeof ticket.qrImageUrl === 'string'
      && ticket.qrImageUrl.trim().length > 0
    ));
};

const EventDetailPage = () => {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAttendeeSpace = location.pathname.startsWith('/attendee');
  const statePendingRegistrationId = location.state?.pendingRegistrationId;
  const pendingRegistrationStorageKey = getPendingRegistrationStorageKey(user?.id, slug);
  const [storedPendingRegistrationId, setStoredPendingRegistrationId] = useState(null);
  const pendingRegistrationId = statePendingRegistrationId || storedPendingRegistrationId;

  const [event, setEvent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!event) return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favs.some(f => f.id === event.id));
  }, [event]);

  const toggleFavorite = () => {
    if (!event) return;
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavs;
    if (isFavorite) {
      newFavs = favs.filter(f => f.id !== event.id);
      setIsFavorite(false);
    } else {
      newFavs = [...favs, {
        id: event.id,
        title: event.title,
        slug: event.slug,
        shortDesc: event.shortDesc || event.description,
        description: event.description,
        startDate: event.startDate,
        venue: event.venue,
        city: event.city,
        category: event.category,
        bannerUrl: event.bannerUrl,
        thumbnailUrl: event.thumbnailUrl
      }];
      setIsFavorite(true);
    }
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    window.dispatchEvent(new Event('storage'));
  };

  // Registration selection state
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState(() => location.state?.booking?.quantity || 1);
  const [notes] = useState('');
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleConfirmSeats = (seats, primaryTier) => {
    setSelectedSeats(seats);
    if (seats && seats.length > 0) {
      setTicketQuantity(seats.length);
      if (primaryTier?.id) {
        setSelectedTicketTypeId(primaryTier.id);
      }
      setIdempotencyKey(crypto.randomUUID());
    }
  };

  // Registration Flow Status: 'selection' | 'registering' | 'payment_pending' | 'confirming' | 'success'
  const [flowState, setFlowState] = useState('selection');
  const [activeRegistration, setActiveRegistration] = useState(null);
  const [regError, setRegError] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!pendingRegistrationStorageKey) return;

    const registrationId = statePendingRegistrationId
      || localStorage.getItem(pendingRegistrationStorageKey);

    if (registrationId) {
      setStoredPendingRegistrationId(registrationId);
      if (statePendingRegistrationId) {
        localStorage.setItem(pendingRegistrationStorageKey, String(statePendingRegistrationId));
      }
    } else {
      setStoredPendingRegistrationId(null);
    }
  }, [pendingRegistrationStorageKey, statePendingRegistrationId]);

  const clearPendingRegistration = () => {
    if (pendingRegistrationStorageKey) {
      localStorage.removeItem(pendingRegistrationStorageKey);
    }
    setStoredPendingRegistrationId(null);
    if (location.state?.pendingRegistrationId) {
      const nextState = { ...location.state };
      delete nextState.pendingRegistrationId;
      navigate(location.pathname, { replace: true, state: nextState });
    }
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const eventRes = await eventService.getPublicEventDetail(slug);
        const eventData = eventRes.data;
        setEvent(eventData);

        if (eventData.ticketTypes && eventData.ticketTypes.length > 0) {
          const restored = location.state?.booking?.ticketTypeId;
          const restoredTicket = eventData.ticketTypes.find(ticket => ticket.id === restored);
          const firstAvailableTicket = eventData.ticketTypes.find(
            ticket => !getTicketAvailabilityReason(ticket, eventData)
          );
          const initialTicket = restoredTicket && !getTicketAvailabilityReason(restoredTicket, eventData)
            ? restoredTicket
            : firstAvailableTicket || restoredTicket || eventData.ticketTypes[0];
          setSelectedTicketTypeId(initialTicket.id);
        }

        // Fetch schedules
        const scheduleRes = await eventService.getPublicEventSchedules(eventData.id);
        setSchedules(scheduleRes.data || []);

        if (user?.id) {
          const registrationsRes = await registrationService.getMyRegistrations();
          const eventRegistrations = (registrationsRes.data || []).filter(
            registration => String(registration.eventId) === String(eventData.id)
              && registration.status === 'PENDING'
          );
          const pendingRegistration = eventRegistrations.find(
            registration => String(registration.id) === String(pendingRegistrationId)
          ) || eventRegistrations[0];

          if (pendingRegistration) {
            setActiveRegistration(pendingRegistration);
            if (pendingRegistrationStorageKey) {
              localStorage.setItem(pendingRegistrationStorageKey, String(pendingRegistration.id));
            }
            setFlowState('payment_pending');
          } else if (pendingRegistrationId && pendingRegistrationStorageKey) {
            // The order may have been confirmed or cancelled in another tab.
            localStorage.removeItem(pendingRegistrationStorageKey);
            setStoredPendingRegistrationId(null);
          }
        }
      } catch (err) {
        console.error('Error loading event detail:', err);
        setError('Không tìm thấy thông tin sự kiện này.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();

    // Polling interval to fetch ticket availability in real-time
    const interval = setInterval(async () => {
      try {
        const eventRes = await eventService.getPublicEventDetail(slug);
        setEvent(eventRes.data);
      } catch (err) {
        console.error('Failed to silently refresh event tickets:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [
    slug,
    location.state?.booking?.ticketTypeId,
    pendingRegistrationId,
    pendingRegistrationStorageKey,
    user?.id
  ]);

  useEffect(() => {
    if (!user?.id || !pendingRegistrationId || !event?.id || flowState !== 'payment_pending') {
      return undefined;
    }

    let disposed = false;
    const clearPendingLink = () => {
      if (pendingRegistrationStorageKey) {
        localStorage.removeItem(pendingRegistrationStorageKey);
      }
      setStoredPendingRegistrationId(null);
      if (location.state?.pendingRegistrationId) {
        const nextState = { ...location.state };
        delete nextState.pendingRegistrationId;
        navigate(location.pathname, { replace: true, state: nextState });
      }
    };
    const refreshEvent = async () => {
      try {
        const eventRes = await eventService.getPublicEventDetail(slug);
        if (!disposed) setEvent(eventRes.data);
      } catch (err) {
        if (!disposed) console.error('Failed to refresh event data:', err);
      }
    };
    const refreshPendingRegistration = async () => {
      try {
        const registrationsRes = await registrationService.getMyRegistrations();
        if (disposed) return;

        const registration = (registrationsRes.data || []).find(
          item => String(item.id) === String(pendingRegistrationId)
            && String(item.eventId) === String(event.id)
        );
        if (!registration) return;

        const expectedTicketCount = activeRegistration?.tickets?.length || ticketQuantity;
        if (hasCompleteRegistration(registration, expectedTicketCount)) {
          setActiveRegistration(registration);
          clearPendingLink();
          setFlowState('success');
          refreshEvent();
          return;
        }

        if (registration.status === 'PENDING') {
          setActiveRegistration(registration);
          return;
        }

        if (registration.status === 'CANCELLED' || registration.status === 'REFUNDED') {
          clearPendingLink();
          setActiveRegistration(null);
          setRegError('Đăng ký đã được hủy hoặc hoàn tiền.');
          setFlowState('selection');
          return;
        }

        // Keep polling a confirmed-but-incomplete response until all ticket
        // artifacts are visible, but never show the success state early.
        setActiveRegistration(registration);
        setRegError('Vé hoặc mã QR chưa sẵn sàng. Đang tiếp tục đồng bộ...');
      } catch (err) {
        if (!disposed) console.error('Failed to refresh pending registration:', err);
      }
    };

    const interval = setInterval(refreshPendingRegistration, 5000);
    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, [
    activeRegistration?.tickets?.length,
    event?.id,
    flowState,
    location.pathname,
    location.state,
    navigate,
    pendingRegistrationId,
    pendingRegistrationStorageKey,
    slug,
    ticketQuantity,
    user?.id
  ]);

  const refreshEventData = async () => {
    try {
      const eventRes = await eventService.getPublicEventDetail(slug);
      setEvent(eventRes.data);
    } catch (err) {
      console.error('Failed to refresh event data:', err);
    }
  };

  const getMinPrice = () => {
    if (!event || !event.ticketTypes || event.ticketTypes.length === 0) return 'Miễn phí';
    const prices = event.ticketTypes.map(tt => tt.price);
    const minPrice = Math.min(...prices);
    return formatPrice(minPrice);
  };

  const getTotalAmount = () => {
    if (!event || !event.ticketTypes || !selectedTicketTypeId) return 0;
    const selectedTicket = event.ticketTypes.find(tt => tt.id === selectedTicketTypeId);
    if (!selectedTicket) return 0;
    return selectedTicket.price * ticketQuantity;
  };

  const availability = bookingAvailability(event, selectedTicketTypeId, ticketQuantity);
  const goToLogin = () => navigate('/login', { state: {
    from: location.pathname,
    booking: { ticketTypeId: selectedTicketTypeId, quantity: ticketQuantity },
  } });

  const handleRegister = async () => {
    if (!user) {
      goToLogin();
      return;
    }

    const currentAvailability = bookingAvailability(event, selectedTicketTypeId, ticketQuantity);
    if (!currentAvailability.canRegister) {
      setRegError(currentAvailability.reason);
      return;
    }

    if (!selectedTicketTypeId || ticketQuantity <= 0) {
      setRegError('Vui lòng chọn loại vé và số lượng.');
      return;
    }

    try {
      setFlowState('registering');
      setRegError('');
      const seatInfo = selectedSeats.length > 0 ? `Ghế: ${selectedSeats.map(s => s.id).join(', ')}` : '';
      const combinedNotes = [notes, seatInfo].filter(Boolean).join(' | ');
      const payload = {
        tickets: [
          {
            ticketTypeId: selectedTicketTypeId,
            quantity: ticketQuantity
          }
        ],
        notes: combinedNotes || undefined
      };
      const response = await registrationService.register(event.id, payload, idempotencyKey);
      const regDetail = response.data;
      setActiveRegistration(regDetail);

      if (hasCompleteRegistration(regDetail, ticketQuantity)) {
        clearPendingRegistration();
        setFlowState('success');
        setIdempotencyKey(crypto.randomUUID());
        refreshEventData();
      } else {
        if (pendingRegistrationStorageKey) {
          localStorage.setItem(pendingRegistrationStorageKey, String(regDetail.id));
        }
        setStoredPendingRegistrationId(String(regDetail.id));
        if (Number(regDetail.finalAmount) === 0) {
          setRegError('Đăng ký miễn phí đang được xử lý. Vui lòng hoàn tất để nhận vé.');
        }
        setFlowState('payment_pending');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setRegError(err.response?.data?.error || err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký vé.');
      setFlowState('selection');
    }
  };

  const handleConfirmPayment = async () => {
    if (!activeRegistration) return;
    try {
      setFlowState('confirming');
      const response = await registrationService.confirmRegistration(event.id, activeRegistration.id);
      const expectedTicketCount = activeRegistration.tickets?.length || ticketQuantity;
      setActiveRegistration(response.data);
      if (hasCompleteRegistration(response.data, expectedTicketCount)) {
        clearPendingRegistration();
        setFlowState('success');
        refreshEventData();
      } else {
        if (pendingRegistrationStorageKey) {
          localStorage.setItem(pendingRegistrationStorageKey, String(response.data.id));
        }
        setStoredPendingRegistrationId(String(response.data.id));
        setRegError('Đăng ký chưa hoàn tất: vé hoặc mã QR chưa sẵn sàng. Vui lòng thử lại.');
        setFlowState('payment_pending');
      }
    } catch (err) {
      console.error('Payment confirmation failed:', err);
      setRegError(err.response?.data?.error || err.response?.data?.message || 'Không thể xác nhận thanh toán.');
      setFlowState('payment_pending');
    }
  };

  const handleCancelRegistration = async () => {
    if (!activeRegistration) {
      setFlowState('selection');
      return;
    }

    try {
      setIsCancelling(true);
      setRegError('');
      await registrationService.cancelRegistration(event.id, activeRegistration.id);
      clearPendingRegistration();
      setFlowState('selection');
      setActiveRegistration(null);
      setIdempotencyKey(crypto.randomUUID());
      refreshEventData();
    } catch (err) {
      console.error('Registration cancellation failed:', err);
      setRegError(err.response?.data?.error || err.response?.data?.message || 'Không thể hủy đăng ký. Vui lòng thử lại.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className={isAttendeeSpace ? "flex items-center justify-center py-32 w-full" : "min-h-screen bg-[#fafafc] font-sans flex flex-col"}>
        {!isAttendeeSpace && <LandingNavbar />}
        <div className={isAttendeeSpace ? "" : "flex-1 flex items-center justify-center pt-32"}>
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        {!isAttendeeSpace && <LandingFooter />}
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={isAttendeeSpace ? "p-8 flex flex-col items-center justify-center gap-4" : "min-h-screen bg-[#fafafc] font-sans flex flex-col"}>
        {!isAttendeeSpace && <LandingNavbar />}
        <div className={isAttendeeSpace ? "flex flex-col items-center gap-4" : "flex-1 flex flex-col items-center justify-center pt-32 gap-4"}>
          <span className="material-symbols-outlined text-6xl text-slate-300">error</span>
          <p className="text-slate-600 font-bold text-lg">{error || 'Không tìm thấy sự kiện'}</p>
          <button onClick={() => navigate(isAttendeeSpace ? '/attendee/explore' : '/events')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold">
            Quay lại sự kiện
          </button>
        </div>
        {!isAttendeeSpace && <LandingFooter />}
      </div>
    );
  }

  const catInfo = categoryMap[event.category] || categoryMap.OTHER;

  return (
    <div className={isAttendeeSpace ? "p-8 max-w-[1600px] mx-auto bg-[#fafafc] rounded-[40px] shadow-sm border border-indigo-50/50 my-6" : "min-h-screen bg-[#fafafc] font-sans selection:bg-[#5c46e5]/20 flex flex-col"}>
      {!isAttendeeSpace && <LandingNavbar />}

      <main className={isAttendeeSpace ? "" : "pt-24 lg:pt-[100px] flex-1"}>
        {/* Back Button */}
        <div className={isAttendeeSpace ? "mb-6" : "max-w-[1400px] mx-auto px-6 mb-6"}>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-sm transition-colors group"
          >
            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
            Quay lại
          </button>
        </div>

        {/* Hero Section */}
        <div className={isAttendeeSpace ? "mb-12" : "max-w-[1400px] mx-auto px-6 mb-12"}>
          <div className="relative rounded-[40px] overflow-hidden h-[400px] lg:h-[500px] shadow-2xl">
            <img
              src={eventService.getEventImageUrl(event) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1600"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-8 lg:p-16">
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl"
              >
                <span className="bg-[#5c46e5] text-white text-[11px] lg:text-[13px] font-bold px-4 py-1.5 rounded-full w-fit mb-6 tracking-widest uppercase inline-block">
                  {catInfo.label}
                </span>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  {event.title}
                </h1>
              </Motion.div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="max-w-[1400px] mx-auto px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-start gap-5">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#5c46e5] text-3xl">calendar_today</span>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Thời gian</p>
                <h3 className="font-bold text-slate-900 text-lg">{formatDate(event.startDate)}</h3>
                <p className="text-slate-500 text-sm">
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-start gap-5">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#5c46e5] text-3xl">location_on</span>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Địa điểm</p>
                <h3 className="font-bold text-slate-900 text-lg">{event.venue}</h3>
                <p className="text-slate-500 text-sm">{event.address}, {event.city}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-start gap-5">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-orange-500 text-3xl">confirmation_number</span>
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">Giá vé</p>
                <h3 className="font-bold text-slate-900 text-lg">Từ {getMinPrice()}</h3>
                <p className="text-slate-500 text-sm">Xem chi tiết ở phần đăng ký</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="max-w-[1400px] mx-auto px-6 mb-20">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Content */}
            <div className="flex-1 space-y-16">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-6 font-headline">Giới thiệu sự kiện</h2>
                <div className="space-y-4 text-slate-600 leading-relaxed text-[17px] whitespace-pre-line">
                  {event.description || "Chưa có giới thiệu chi tiết cho sự kiện này."}
                </div>
              </section>

              {/* Schedule */}
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-8 font-headline">Lịch trình chương trình</h2>
                {schedules.length > 0 ? (
                  <div className="space-y-4">
                    {schedules.map((item, idx) => (
                      <div key={item.id} className="flex gap-6 group">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-lg bg-indigo-600`}>
                            <span className="material-symbols-outlined text-[20px]">{item.icon || 'star'}</span>
                          </div>
                          {idx !== schedules.length - 1 && <div className="w-[2px] flex-1 bg-slate-100 my-2"></div>}
                        </div>
                        <div className="flex-1 pb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                          <span className="text-slate-400 text-sm font-black mb-1 block uppercase tracking-wider">
                            {formatTime(item.startTime)} - {formatTime(item.endTime)} {item.location ? `• ${item.location}` : ''}
                          </span>
                          <h4 className="font-black text-slate-900 text-lg mb-2">{item.title}</h4>
                          {item.description && <p className="text-slate-500 text-[15px] mb-3">{item.description}</p>}
                          {item.speaker && (
                            <div className="flex items-center gap-2 text-indigo-600 text-sm font-bold">
                              <span className="material-symbols-outlined text-lg">person</span>
                              Diễn giả: {item.speaker}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 border border-dashed rounded-[32px] text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">calendar_today</span>
                    <p className="text-sm">Chưa có lịch trình chính thức.</p>
                  </div>
                )}
              </section>
            </div>

            {/* Right Sidebar */}
            <aside className="lg:w-[420px] w-full relative">
              <div
                className="lg:sticky lg:top-[120px] space-y-8 z-40"
                style={{ alignSelf: 'flex-start', height: 'fit-content' }}
              >
                {/* Interactive Registration Card */}
                <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                  <AnimatePresence mode="wait">
                    {flowState === 'selection' && (
                      <Motion.div
                        key="selection"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <h3 className="text-xl font-black text-slate-900 mb-6">Đăng ký vé</h3>

                        <div className="space-y-4 mb-6">
                          {event.ticketTypes && event.ticketTypes.length > 0 ? (
                            (() => {
                              const selectedTicket = event.ticketTypes.find(tt => tt.id === selectedTicketTypeId);
                              const selectedAvailable = selectedTicket ? (selectedTicket.totalQuantity - (selectedTicket.soldQuantity || 0)) : 0;
                              const selectedTicketReason = getTicketAvailabilityReason(selectedTicket, event);

                              return (
                                <>
                                  {/* Select Ticket Type */}
                                  <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Chọn loại vé</label>
                                    <div className="relative">
                                      <select
                                        value={selectedTicketTypeId}
                                        onChange={(e) => {
                                          setSelectedTicketTypeId(e.target.value);
                                          setTicketQuantity(1);
                                          setIdempotencyKey(crypto.randomUUID());
                                        }}
                                        disabled={event.isSalesActive === false}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 px-5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                                      >
                                        {event.ticketTypes.map(tt => {
                                          const ticketReason = getTicketAvailabilityReason(tt, event);
                                          return (
                                            <option key={tt.id} value={tt.id} disabled={Boolean(ticketReason)}>
                                              {tt.name} — {formatPrice(tt.price)}{ticketReason ? ` (${ticketReason})` : ''}
                                            </option>
                                          );
                                        })}
                                      </select>
                                      <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        keyboard_arrow_down
                                      </span>
                                    </div>
                                  </div>

                                  {/* Ticket Quantity & Details */}
                                  {selectedTicket && (
                                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                      <span className={`text-xs font-semibold ${selectedTicketReason ? 'text-amber-700' : 'text-slate-500'}`}>
                                        {selectedTicketReason || (selectedAvailable <= 10 ? `Chỉ còn ${selectedAvailable} vé` : `Còn trống: ${selectedAvailable} vé`)}
                                      </span>

                                      <div className="flex items-center gap-3">
                                        <button
                                          onClick={() => { setTicketQuantity(prev => Math.max(1, prev - 1)); setIdempotencyKey(crypto.randomUUID()); }}
                                          disabled={event.isSalesActive === false}
                                          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          -
                                        </button>
                                        <span className="font-black text-slate-800 text-sm w-4 text-center">{ticketQuantity}</span>
                                        <button
                                          onClick={() => { setTicketQuantity(prev => Math.min(availability.limit, prev + 1)); setIdempotencyKey(crypto.randomUUID()); }}
                                          disabled={event.isSalesActive === false || ticketQuantity >= availability.limit}
                                          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Seat Selection Button */}
                                  <button
                                    type="button"
                                    onClick={() => setIsSeatModalOpen(true)}
                                    disabled={event.isSalesActive === false}
                                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-between transition group active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                        <Armchair className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                      </div>
                                      <span>
                                        {selectedSeats.length > 0 
                                          ? `Đã chọn ${selectedSeats.length} chỗ ngồi` 
                                          : 'Xem sơ đồ & Chọn chỗ ngồi'}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-indigo-600 underline flex items-center gap-1">
                                      {selectedSeats.length > 0 ? 'Đổi ghế' : 'Mở sơ đồ'}
                                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </span>
                                  </button>

                                  {/* Selected seats badges */}
                                  {selectedSeats.length > 0 && (
                                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                          Ghế đã giữ ({selectedSeats.length}):
                                        </span>
                                        <button 
                                          type="button"
                                          onClick={() => setSelectedSeats([])}
                                          className="text-[10px] text-slate-400 hover:text-rose-500 font-bold transition"
                                        >
                                          Xóa chọn
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {selectedSeats.map(s => (
                                          <span 
                                            key={s.id} 
                                            className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold shadow-sm"
                                          >
                                            {s.id}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()
                          ) : (
                            <p className="text-slate-400 text-sm">Hết vé hoặc không có loại vé nào khả dụng.</p>
                          )}
                        </div>

                        {availability.reason && <p className="text-amber-700 text-sm mb-4" role="status">{availability.reason}</p>}

                        {regError && <div className="text-red-500 text-xs font-bold mb-4">{regError}</div>}

                        <div className="flex items-center justify-between mb-6 pt-4 border-t border-slate-100">
                          <span className="text-slate-500 font-bold">Tổng cộng:</span>
                          <span className="text-2xl font-black text-slate-900">{formatPrice(getTotalAmount())}</span>
                        </div>

                        <div className="flex gap-3">
                          {event.isSalesActive === false ? (
                            <button
                              disabled
                              className="flex-1 bg-amber-50 text-amber-700 border border-amber-200 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                              <span className="material-symbols-outlined text-lg">pause_circle</span>
                              Tạm ngưng bán vé
                            </button>
                          ) : user ? (
                            <button
                              onClick={handleRegister}
                              disabled={!availability.canRegister}
                              className="flex-1 bg-[#5c46e5] text-white py-4 rounded-2xl font-black text-sm hover:bg-[#4d38da] transition shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Đăng ký ngay
                            </button>
                          ) : (
                            <button
                              onClick={goToLogin}
                              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition"
                            >
                              Đăng nhập để đăng ký
                            </button>
                          )}

                          <button
                            onClick={toggleFavorite}
                            className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                              isFavorite
                                ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm shadow-rose-100/50'
                                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                            }`}
                            title={isFavorite ? "Bỏ yêu thích" : "Yêu thích sự kiện"}
                          >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </Motion.div>
                    )}

                    {flowState === 'registering' && (
                      <Motion.div
                        key="registering"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 flex flex-col items-center justify-center text-center gap-4"
                      >
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div>
                          <h4 className="font-bold text-slate-800">Đang khởi tạo đơn hàng</h4>
                          <p className="text-slate-400 text-xs mt-1">Vui lòng chờ trong giây lát...</p>
                        </div>
                      </Motion.div>
                    )}

                    {flowState === 'payment_pending' && activeRegistration && (
                      <Motion.div
                        key="payment"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="text-center pb-4 border-b border-slate-100">
                          <span className="inline-flex p-3 bg-amber-50 rounded-2xl text-amber-500 mb-3">
                            <span className="material-symbols-outlined text-3xl">payment</span>
                          </span>
                          <h3 className="text-xl font-black text-slate-900">Thanh toán</h3>
                          <p className="text-slate-400 text-xs mt-1">Giao dịch mua vé thử nghiệm (Mock payment)</p>
                        </div>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm font-bold text-slate-600">
                          <div className="flex justify-between">
                            <span>Sự kiện:</span>
                            <span className="text-slate-900 text-right font-black max-w-[200px] truncate">{activeRegistration.eventTitle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Mã đăng ký:</span>
                            <span className="text-indigo-600 font-black">#{activeRegistration.id.toString().substring(0, 8).toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between pt-3 border-t border-slate-200/50">
                            <span>Thành tiền:</span>
                            <span className="text-slate-900 font-extrabold text-base">{formatPrice(activeRegistration.finalAmount)}</span>
                          </div>
                        </div>

                        {regError && <div className="text-red-500 text-xs font-bold">{regError}</div>}

                        <div className="flex flex-col gap-3">
                          <button
                            onClick={handleConfirmPayment}
                            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                          >
                            Xác nhận thanh toán (Mock Success)
                          </button>
                          <button
                            onClick={handleCancelRegistration}
                            disabled={isCancelling}
                            className="w-full bg-slate-100 text-slate-600 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition"
                          >
                            {isCancelling ? 'Đang hủy đăng ký...' : 'Quay lại'}
                          </button>
                        </div>
                      </Motion.div>
                    )}

                    {flowState === 'confirming' && (
                      <Motion.div
                        key="confirming"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-12 flex flex-col items-center justify-center text-center gap-4"
                      >
                        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        <div>
                          <h4 className="font-bold text-slate-800">Đang xác thực giao dịch</h4>
                          <p className="text-slate-400 text-xs mt-1">Hệ thống đang lập hóa đơn và vé điện tử...</p>
                        </div>
                      </Motion.div>
                    )}

                    {flowState === 'success' && activeRegistration && (
                      <Motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                      >
                        <div className="flex flex-col items-center">
                          <span className="inline-flex p-3 bg-emerald-50 text-emerald-500 rounded-full mb-4 animate-bounce">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                          </span>
                          <h3 className="text-2xl font-black text-slate-900">Đăng ký thành công!</h3>
                          <p className="text-slate-400 text-xs mt-1">Vé điện tử của bạn đã được xuất.</p>
                        </div>

                        {activeRegistration.tickets && activeRegistration.tickets.map((t, idx) => (
                          <div key={t.id || idx} className="border-t border-dashed border-slate-200 pt-6 mt-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center">
                              <QRCodeSVG
                                value={t.qrCodeToken || t.ticketCode}
                                title="Vé QR"
                                marginSize={4}
                                className="w-40 h-40 bg-white p-2 rounded-2xl shadow-sm mb-4"
                              />
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mã vé</p>
                              <p className="text-indigo-600 font-extrabold text-lg mt-0.5">#{t.ticketCode}</p>
                              <span className="mt-3 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-lg uppercase">
                                {t.ticketTypeName}
                              </span>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => navigate('/attendee/tickets')}
                          className="w-full bg-[#5c46e5] text-white py-4 rounded-2xl font-black text-base hover:bg-[#4d38da] transition mt-6"
                        >
                          Đi đến Vé của tôi
                        </button>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location Card */}
                <div className="bg-white rounded-[40px] overflow-hidden shadow-md border border-slate-100">
                  <div className="h-48 bg-slate-200 relative">
                    <img
                      src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=400"
                      alt="Map"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address} ${event.city}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white/90 backdrop-blur px-6 py-2 rounded-full text-slate-900 font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-white transition"
                      >
                        <span className="material-symbols-outlined text-[18px]">map</span>
                        Mở trong Google Maps
                      </a>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-black text-slate-900 mb-2">{event.venue}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{event.address}, {event.city}</p>
                  </div>
                </div>

                {/* Sponsor Card */}
                <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-orange-500">verified</span>
                  </div>
                  <p className="text-[13px] text-orange-900 font-medium leading-relaxed">
                    Sự kiện chính thức được bảo trợ bởi <span className="font-black">Hiệp hội Công nghệ số Việt Nam (VINASA)</span>
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {!isAttendeeSpace && <LandingFooter />}

      {/* Seat Selection Modal */}
      <SeatSelectionModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        event={event}
        selectedTicketTypeId={selectedTicketTypeId}
        currentSelectedSeats={selectedSeats}
        onConfirmSeats={handleConfirmSeats}
        maxSeatsAllowed={availability.limit || 6}
      />
    </div>
  );
};

export default EventDetailPage;
