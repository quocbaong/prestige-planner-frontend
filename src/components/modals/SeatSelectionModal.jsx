import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion } from 'framer-motion';
import { 
  X, 
  Check, 
  Armchair, 
  Sparkles, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  AlertCircle,
  Ticket
} from 'lucide-react';

const formatPrice = (price) => {
  if (price === undefined || price === null || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Deterministic pseudo-random based on string seed to keep booked seats consistent across re-renders
const isPseudoBooked = (seatId) => {
  let hash = 0;
  for (let i = 0; i < seatId.length; i++) {
    hash = (hash << 5) - hash + seatId.charCodeAt(i);
    hash |= 0;
  }
  // ~25% seats booked
  return Math.abs(hash) % 4 === 0;
};

const SeatSelectionModal = ({
  isOpen,
  onClose,
  event,
  selectedTicketTypeId,
  currentSelectedSeats = [],
  onConfirmSeats,
  maxSeatsAllowed = 6
}) => {
  const [selectedSeats, setSelectedSeats] = useState(() => currentSelectedSeats || []);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');

  // Extract ticket types or generate sensible defaults
  const ticketTypes = useMemo(() => {
    if (event?.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes;
    }
    return [{ id: 'default', name: 'Vé Tiêu Chuẩn', price: 0 }];
  }, [event]);

  // Generate seat grid layout dynamically based on ticket types and event
  const seatLayout = useMemo(() => {
    // We create rows A through H
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12; // 12 seats divided into 3 blocks: 4 - 4 - 4 (with aisles)

    // Divide rows across available ticket types
    const hasMultipleTiers = ticketTypes.length > 1;
    const vipTicket = ticketTypes.find(t => t.name.toLowerCase().includes('vip')) || ticketTypes[0];
    const standardTicket = ticketTypes.find(t => t.id !== vipTicket?.id) || ticketTypes[1] || vipTicket;

    return rows.map((rowLetter, rowIndex) => {
      // Row A & B are VIP if multiple tiers exist
      const isVipRow = hasMultipleTiers && rowIndex < 2;
      const assignedTier = isVipRow ? vipTicket : standardTicket;

      const seats = [];
      for (let num = 1; num <= seatsPerRow; num++) {
        const seatId = `${rowLetter}${num < 10 ? '0' + num : num}`;
        const isBooked = isPseudoBooked(`${event?.id || 'evt'}-${seatId}`);
        seats.push({
          id: seatId,
          row: rowLetter,
          number: num,
          tier: assignedTier,
          isBooked,
          // Aisle gaps after seat 4 and seat 8
          isAisleAfter: num === 4 || num === 8
        });
      }

      return {
        rowLetter,
        tier: assignedTier,
        seats
      };
    });
  }, [ticketTypes, event?.id]);

  if (!isOpen) return null;

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    setWarningMessage('');
    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);

    if (isAlreadySelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= maxSeatsAllowed) {
        setWarningMessage(`Bạn chỉ có thể chọn tối đa ${maxSeatsAllowed} ghế cho mỗi lượt đặt.`);
        return;
      }

      // Check if mixing ticket types
      if (selectedSeats.length > 0) {
        const firstSeatTier = selectedSeats[0].tier?.id;
        if (seat.tier?.id && firstSeatTier && seat.tier.id !== firstSeatTier) {
          setWarningMessage('Mỗi đơn đặt vé chỉ áp dụng cho 1 hạng vé cùng loại (VIP hoặc Tiêu chuẩn).');
          return;
        }
      }

      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      setWarningMessage('Vui lòng chọn ít nhất 1 ghế.');
      return;
    }

    const primaryTier = selectedSeats[0]?.tier;
    onConfirmSeats(selectedSeats, primaryTier);
    onClose();
  };

  const totalAmount = selectedSeats.reduce((sum, seat) => sum + (seat.tier?.price || 0), 0);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <Motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl bg-white border border-slate-200 text-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header (Light Theme) */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Sơ đồ chọn chỗ ngồi</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Trực quan
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {event?.title} • {event?.venue || 'Sân khấu chính'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend bar (Light Theme) */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-50 border border-amber-300 text-[9px] font-bold text-amber-700 flex items-center justify-center" />
              <span className="text-slate-700 font-medium">VIP ({formatPrice(ticketTypes[0]?.price)})</span>
            </div>
            {ticketTypes.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-indigo-50 border border-indigo-200 text-[9px] font-bold text-indigo-600 flex items-center justify-center" />
                <span className="text-slate-700 font-medium">{ticketTypes[1]?.name} ({formatPrice(ticketTypes[1]?.price)})</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 border border-emerald-500 flex items-center justify-center text-white">
                <Check className="w-2.5 h-2.5" />
              </span>
              <span className="text-emerald-700 font-bold">Đang chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-200/80 border border-slate-300 relative overflow-hidden flex items-center justify-center">
                <div className="w-full h-[1px] bg-slate-400 rotate-45 transform" />
              </span>
              <span className="text-slate-400 font-medium">Đã bán</span>
            </div>
          </div>

          {/* Zoom controls (Light Theme) */}
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-500 px-1 font-bold">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition ml-0.5"
              title="Đặt lại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Map Viewport (Light Theme) */}
        <div className="flex-1 overflow-auto p-6 sm:p-10 flex flex-col items-center select-none bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40">
          <div 
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 flex flex-col items-center w-full max-w-2xl min-w-[500px]"
          >
            {/* Stage Visual representation */}
            <div className="w-full max-w-md mb-12 flex flex-col items-center">
              <div className="w-full h-8 bg-gradient-to-b from-indigo-100/70 to-transparent border-t-2 border-indigo-500 rounded-t-full shadow-[0_-6px_20px_rgba(99,102,241,0.15)] flex items-center justify-center">
                <span className="text-[11px] font-black tracking-widest text-indigo-700 uppercase flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" /> SÂN KHẤU / STAGE
                </span>
              </div>
              <div className="w-3/4 h-2 bg-indigo-200/40 rounded-b-full filter blur-[2px]" />
            </div>

            {/* Seating Grid */}
            <div className="space-y-3 w-full">
              {seatLayout.map((row) => (
                <div key={row.rowLetter} className="flex items-center justify-center gap-2">
                  {/* Left Row Label */}
                  <span className="w-6 text-center text-xs font-black text-slate-400 font-mono">
                    {row.rowLetter}
                  </span>

                  {/* Seats in this row */}
                  <div className="flex items-center gap-1.5">
                    {row.seats.map((seat) => {
                      const isSelected = selectedSeats.some(s => s.id === seat.id);
                      const isVip = seat.tier?.name.toLowerCase().includes('vip');

                      let seatClasses = "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all relative ";

                      if (seat.isBooked) {
                        seatClasses += "bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed";
                      } else if (isSelected) {
                        seatClasses += "bg-emerald-600 border border-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-105 z-10 font-black";
                      } else if (isVip) {
                        seatClasses += "bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 hover:border-amber-400 hover:scale-105 cursor-pointer shadow-sm";
                      } else {
                        seatClasses += "bg-indigo-50/50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 hover:scale-105 cursor-pointer shadow-sm";
                      }

                      return (
                        <React.Fragment key={seat.id}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            onMouseEnter={() => setHoveredSeat(seat)}
                            onMouseLeave={() => setHoveredSeat(null)}
                            disabled={seat.isBooked}
                            className={seatClasses}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <span>{seat.number}</span>
                            )}
                          </button>

                          {/* Aisle separator gap */}
                          {seat.isAisleAfter && (
                            <div className="w-4 sm:w-6" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Right Row Label */}
                  <span className="w-6 text-center text-xs font-black text-slate-400 font-mono">
                    {row.rowLetter}
                  </span>
                </div>
              ))}
            </div>

            {/* Tooltip on Hover */}
            <div className="h-10 mt-6 flex items-center justify-center text-xs font-medium">
              {hoveredSeat ? (
                <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-xl flex items-center gap-2.5">
                  <span className="font-bold text-white">Ghế {hoveredSeat.id}</span>
                  <span className="text-slate-400">•</span>
                  <span className={hoveredSeat.tier?.name.toLowerCase().includes('vip') ? 'text-amber-300 font-bold' : 'text-indigo-300'}>
                    {hoveredSeat.tier?.name}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-bold text-white">{formatPrice(hoveredSeat.tier?.price)}</span>
                  <span className="text-slate-400">•</span>
                  <span className={hoveredSeat.isBooked ? 'text-rose-400' : 'text-emerald-400'}>
                    {hoveredSeat.isBooked ? 'Đã có người đặt' : 'Còn trống'}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 text-[11px]">Di chuột hoặc nhấn vào ghế để xem thông tin</span>
              )}
            </div>
          </div>
        </div>

        {/* Warning notification */}
        {warningMessage && (
          <div className="px-6 py-2.5 bg-amber-50 border-t border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{warningMessage}</span>
          </div>
        )}

        {/* Footer Checkout Summary (Light Theme) */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              <Ticket className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Ghế đã chọn:</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {selectedSeats.length} / {maxSeatsAllowed}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1 max-w-sm">
                {selectedSeats.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">Chưa chọn ghế nào</span>
                ) : (
                  selectedSeats.map(seat => (
                    <span 
                      key={seat.id}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold"
                    >
                      {seat.id}
                      <button 
                        type="button"
                        onClick={() => setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))}
                        className="hover:text-rose-600 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-left sm:text-right">
              <div className="text-[11px] text-slate-400 font-medium">Tổng tạm tính:</div>
              <div className="text-lg font-black text-slate-900">{formatPrice(totalAmount)}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={selectedSeats.length === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#5c46e5] hover:bg-[#4d38da] text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xác nhận chọn ghế
              </button>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SeatSelectionModal;
