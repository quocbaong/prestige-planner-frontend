import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, AreaChart, Area, PieChart, Pie, Sector
} from 'recharts';
import { dashboardService } from '../services/dashboardService';

// ─── API Config (thay URL khi có backend) ─────────────────────────────────────
// const API_BASE = 'http://localhost:8080/api/organizer';

// ─── Helper: tạo query params từ period / customRange ─────────────────────────
const buildDateParams = (period, customRange) => {
  if (period === 'custom' && customRange.start && customRange.end) {
    return `from=${customRange.start}&to=${customRange.end}`;
  }
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - Number(period));
  const fmt = d => d.toISOString().split('T')[0];
  return `from=${fmt(from)}&to=${fmt(to)}&period=${period}`;
};

const formatRevenue = (value) => {
  if (value === null || value === undefined) return '0 ₫';
  const val = Number(value);
  if (val >= 1_000_000_000) {
    return (val / 1_000_000_000).toFixed(1).replace('.0', '') + 'B ₫';
  }
  if (val >= 1_000_000) {
    return (val / 1_000_000).toFixed(1).replace('.0', '') + 'M ₫';
  }
  if (val >= 1000) {
    return (val / 1000).toFixed(1).replace('.0', '') + 'K ₫';
  }
  return val.toLocaleString() + ' ₫';
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);


// ─── Sub-components ───────────────────────────────────────────────────────────
const colorMap = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', ring: 'ring-violet-100' },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   ring: 'ring-blue-100'   },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-500',  ring: 'ring-amber-100'  },
};

const KpiCard = ({ card, index }) => {
  const c = colorMap[card.color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(99,102,241,0.12)' }}
      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm cursor-default"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center shrink-0`}>
            <span className={`material-symbols-outlined text-[20px] ${c.icon}`}>{card.icon}</span>
          </div>
          <p className="text-xs font-bold text-slate-500 leading-tight uppercase tracking-wide">{card.label}</p>
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${card.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-50'}`}>
          {card.trend}
        </span>
      </div>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{card.displayValue}</p>
    </motion.div>
  );
};

const HeatCell = ({ value }) => {
  const intensity = value / 100;
  const bg = intensity > 0.85 ? 'bg-indigo-700' : intensity > 0.7 ? 'bg-indigo-500' : intensity > 0.5 ? 'bg-indigo-300' : intensity > 0.3 ? 'bg-indigo-200' : 'bg-indigo-100';
  return (
    <div className={`w-8 h-8 rounded-lg ${bg} transition-all hover:scale-110 cursor-pointer`} title={`${value}%`} />
  );
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-black text-slate-700">{label}</p>
        <p className="text-indigo-600 font-bold">{payload[0].value.toLocaleString()} lượt</p>
      </div>
    );
  }
  return null;
};

const CheckinBar = ({ pct }) => {
  const color = pct >= 85 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-black text-slate-600 w-8 text-right">{pct}%</span>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const OrganizerReportAnalyticsPage = () => {
  const [period, setPeriod] = useState(30);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();

  // ─── Chart states ─────────────────────────────────────────────────────────
  const [isLoadingKpi,       setIsLoadingKpi]       = useState(false);
  const [isLoadingDensity,   setIsLoadingDensity]   = useState(false);
  const [isLoadingAudience,  setIsLoadingAudience]  = useState(false);
  const [isLoadingFunnel,    setIsLoadingFunnel]    = useState(false);
  const [isLoadingEvents,    setIsLoadingEvents]    = useState(false);

  // ─── Dynamic chart data (sẽ được cập nhật từ API) ─────────────────────────
  const [apiKpiData,        setApiKpiData]        = useState([]);
  const [apiLineDataThu,    setApiLineDataThu]    = useState(null);
  const [apiLineDataGio,    setApiLineDataGio]    = useState(null);
  const [apiAudienceSegs,   setApiAudienceSegs]   = useState(null);
  const [apiFunnelSteps,    setApiFunnelSteps]    = useState(null);
  const [apiEvents,         setApiEvents]         = useState(null);
  const [cartConversionRate, setCartConversionRate] = useState(5.4);
  const [cartAbandonmentRate, setCartAbandonmentRate] = useState(34.2);
  const [averageOrderValue, setAverageOrderValue] = useState(450000);

  // ─── Fetch KPI summary ────────────────────────────────────────────────────
  useEffect(() => {
    const params = buildDateParams(period, customRange);
    setIsLoadingKpi(true);
    dashboardService.getKpiSummary(params)
      .then(r => {
        if (r.data) {
          const data = r.data;
          const formattedKpi = [
            {
              label: 'Tổng sự kiện',
              displayValue: data.totalEvents || 0,
              icon: 'event',
              color: 'indigo',
              trend: 'Sự kiện',
              up: true
            },
            {
              label: 'Tổng doanh thu',
              displayValue: formatRevenue(data.totalRevenue),
              icon: 'payments',
              color: 'violet',
              trend: 'Đã nhận',
              up: true
            },
            {
              label: 'Tổng lượt đăng ký',
              displayValue: (data.totalAttendees || 0).toLocaleString(),
              icon: 'group',
              color: 'blue',
              trend: 'Người dùng',
              up: true
            },
            {
              label: 'Sắp diễn ra',
              displayValue: data.upcomingEvents || 0,
              icon: 'schedule',
              color: 'amber',
              trend: 'Sắp tới',
              up: true
            }
          ];
          setApiKpiData(formattedKpi);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingKpi(false));
  }, [period, customRange]);

  // ─── Fetch density chart (Mật độ tham dự) ────────────────────────────────
  useEffect(() => {
    const params = buildDateParams(period, customRange);
    setIsLoadingDensity(true);

    dashboardService.getCheckinDensity(params)
      .then(r => {
        if (r.data) {
          setApiLineDataThu(r.data.thu);
          setApiLineDataGio(r.data.gio);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingDensity(false));
  }, [period, customRange]);

  // ─── Fetch audience segments (Phân khúc đối tượng) ────────────────────────
  useEffect(() => {
    const params = buildDateParams(period, customRange);
    setIsLoadingAudience(true);

    dashboardService.getAudienceSegments(params)
      .then(r => {
        if (r.data) setApiAudienceSegs(r.data);
      })
      .catch(console.error)
      .finally(() => setIsLoadingAudience(false));
  }, [period, customRange]);

  // ─── Fetch conversion funnel (Phễu chuyển đổi) ───────────────────────────
  useEffect(() => {
    const params = buildDateParams(period, customRange);
    setIsLoadingFunnel(true);

    dashboardService.getConversionFunnel(params)
      .then(r => {
        if (r.data) {
          setApiFunnelSteps(r.data.stages);
          if (r.data.cartConversionRate !== undefined) setCartConversionRate(r.data.cartConversionRate);
          if (r.data.cartAbandonmentRate !== undefined) setCartAbandonmentRate(r.data.cartAbandonmentRate);
          if (r.data.averageOrderValue !== undefined) setAverageOrderValue(r.data.averageOrderValue);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingFunnel(false));
  }, [period, customRange]);

  // ─── Fetch events table (Bảng sự kiện) ───────────────────────────────────
  useEffect(() => {
    const params = buildDateParams(period, customRange);
    setIsLoadingEvents(true);

    dashboardService.getEvents(params)
      .then(r => {
        if (r.data) setApiEvents(r.data);
      })
      .catch(console.error)
      .finally(() => setIsLoadingEvents(false));
  }, [period, customRange]);

  const [viewMode, setViewMode] = useState('thu');
  const [hoveredWeek, setHoveredWeek] = useState(null);

  // Dữ liệu hiển thị trực tiếp từ API (không fallback mock)
  const activeLineDataThu = apiLineDataThu || [];
  const activeLineDataGio = apiLineDataGio || [];
  const activeAudienceSegs = apiAudienceSegs || [];
  const activeFunnelSteps = apiFunnelSteps || [];
  const activeEvents = apiEvents || [];

  const weekColors = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b'];
  const weekLabels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];


  const lineData = viewMode === 'thu' ? activeLineDataThu : activeLineDataGio;

  // AI Phân tích chuyên sâu cho Mật độ tham dự
  const attendanceAiAnalysis = React.useMemo(() => {
    if (!lineData || lineData.length === 0) return null;

    const entriesWithTotal = lineData.map(item => {
      const total = (item.w1 || 0) + (item.w2 || 0) + (item.w3 || 0) + (item.w4 || 0);
      const avg = Math.round(total / 4);
      return { ...item, total, avg };
    });

    const sorted = [...entriesWithTotal].sort((a, b) => b.total - a.total);
    const peak = sorted[0];
    const lowest = sorted[sorted.length - 1];

    const w1 = peak.w1 || 0;
    const w4 = peak.w4 || 0;
    const trendStr = w4 > w1 ? `tăng mạnh (+${w4 - w1}%) vào các tuần cuối` : w4 < w1 ? `giảm nhẹ (-${w1 - w4}%) vào cuối đợt` : `duy trì ổn định qua các tuần`;

    if (viewMode === 'thu') {
      return {
        summary: `Thứ cao điểm nhất là ${peak.label} với lưu lượng trung bình đạt ${peak.avg}% (xu hướng ${trendStr}). Ngược lại, ${lowest.label} có lượng check-in thấp nhất (${lowest.avg}%).`,
        insights: [
          {
            title: 'Tối ưu hóa nhân sự soát vé',
            desc: `Tăng cường 30-50% nhân sự và mở 100% cổng check-in vào ngày ${peak.label} để tránh ùn ứ. Giảm bớt quầy trực vào ngày ${lowest.label} để tiết kiệm chi phí vận hành.`
          },
          {
            title: 'Chiến lược điều phối lưu lượng',
            desc: `Áp dụng chương trình "Early Bird Check-in" (tặng voucher nước uống/quà tặng đính kèm) cho khách đến vào ngày ${lowest.label} nhằm giãn mật độ khỏi ngày cao điểm.`
          },
          {
            title: 'Dự phòng rủi ro kỹ thuật',
            desc: `Vào các khung giờ cao điểm của ngày ${peak.label}, cần bố trí nhân viên IT trực hệ thống máy quét mã QR và đường truyền Internet băng thông cao.`
          }
        ]
      };
    } else {
      return {
        summary: `Khung giờ vàng check-in tập trung mạnh nhất vào lúc ${peak.label} (trung bình ${peak.avg}%, ${trendStr}). Sau khung giờ này, lưu lượng bắt đầu phân tán.`,
        insights: [
          {
            title: 'Mở quầy thủ tục sớm (Pre-checkin)',
            desc: `Khuyến khích khách hàng đến nhận vòng tay/thẻ đeo trước ${peak.label} từ 1-2 tiếng bằng cách gửi email/SMS thông báo kèm sơ đồ di chuyển.`
          },
          {
            title: 'Phân luồng giao thông & Bãi xe',
            desc: `Làm việc với bộ phận an ninh bãi xe để mở rộng luồng vào trước thời điểm ${peak.label}, tránh tình trạng tắc nghẽn từ cổng gửi xe ảnh hưởng đến giờ vào cửa.`
          },
          {
            title: 'Bố trí quầy Hỗ trợ nhanh (Helpdesk)',
            desc: `Đặt quầy giải quyết sự cố (lỗi vé, mất vé, sai thông tin) tách biệt hoàn toàn khỏi luồng check-in chính để luồng di chuyển lúc ${peak.label} không bị gián đoạn.`
          }
        ]
      };
    }
  }, [lineData, viewMode]);

  // AI Phân tích chuyên sâu cho Phân khúc đối tượng
  const audienceAiAnalysis = React.useMemo(() => {
    if (!activeAudienceSegs || activeAudienceSegs.length === 0) return null;

    const sorted = [...activeAudienceSegs].sort((a, b) => b.pct - a.pct);
    const top1 = sorted[0];
    const top2 = sorted[1] || sorted[0];

    let strategy = [];
    if (top1.label.includes('18 – 25')) {
      strategy = [
        {
          title: 'Đẩy mạnh Kênh truyền thông Gen Z',
          desc: 'Tập trung 70% ngân sách quảng cáo vào TikTok, Instagram Reels và các chiến dịch Viral Video. Sử dụng các KOLs/Influencers trẻ có sức ảnh hưởng lớn.'
        },
        {
          title: 'Thiết kế trải nghiệm tương tác (Gamification)',
          desc: 'Tạo các khu vực Photobooth 360 độ, góc check-in AR/VR và các minigame trên điện thoại để kích thích nhóm khách hàng trẻ chia sẻ lên mạng xã hội.'
        },
        {
          title: 'Chính sách giá & Combo linh hoạt',
          desc: 'Phát hành các gói vé Nhóm (Group Pass từ 4 người) hoặc vé kèm quà tặng độc quyền (Merchandise) để tối ưu hóa quyết định mua của học sinh, sinh viên.'
        }
      ];
    } else if (top1.label.includes('26 – 35')) {
      strategy = [
        {
          title: 'Nội dung chuyên sâu & Đa kênh chuyên nghiệp',
          desc: 'Tối ưu hóa chiến dịch Facebook Ads, LinkedIn và Email Marketing với thông điệp nhấn mạnh vào giá trị kết nối mạng lưới (Networking) và trải nghiệm cao cấp.'
        },
        {
          title: 'Gói dịch vụ Doanh nghiệp & Nhóm công ty',
          desc: 'Thiết kế các gói vé B2B mua chung cho doanh nghiệp kèm hóa đơn VAT, ưu đãi khu vực ngồi riêng hoặc thẻ VIP Lounge có phục vụ F&B chất lượng cao.'
        },
        {
          title: 'Tối ưu quy trình thanh toán nhanh',
          desc: 'Nhóm khách hàng văn phòng ưu tiên sự tiện lợi. Đảm bảo cổng thanh toán hỗ trợ đa dạng (Apple Pay, Google Pay, thẻ tín dụng, QR chuyển khoản 24/7).'
        }
      ];
    } else {
      strategy = [
        {
          title: 'Trải nghiệm Cao cấp & Tiện ích Tối đa',
          desc: 'Nhóm khách hàng trung niên/khác thường có yêu cầu cao về dịch vụ. Bố trí khu vực đỗ xe VIP gần cổng, lối đi riêng không xếp hàng và khu vực ngồi chờ sang trọng.'
        },
        {
          title: 'Kênh tiếp cận Truyền thống & Uy tín',
          desc: 'Sử dụng các báo điện tử uy tín, đối tác tài trợ hoặc tin nhắn SMS định danh (Brandname) để gửi thông tin sự kiện một cách trang trọng, lịch sự.'
        },
        {
          title: 'Hỗ trợ Chăm sóc khách hàng Trực tiếp',
          desc: 'Cung cấp số Hotline hỗ trợ đặt vé trực tiếp qua điện thoại dành riêng cho những khách hàng không quen thao tác trực tuyến trên nền tảng web.'
        }
      ];
    }

    return {
      summary: `Phân khúc chiếm ưu thế tuyệt đối là "${top1.label}" (${top1.pct}%), tiếp theo là "${top2.label}" (${top2.pct}%). Sự phân bổ này cho thấy tính chất sự kiện rất phù hợp với tệp khách hàng này.`,
      insights: strategy
    };
  }, [activeAudienceSegs]);


  // Custom Tooltip: chỉ hiện tuần đang được focus (hoặc tất cả nếu không hover)
  const renderLineTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const filtered = hoveredWeek !== null
      ? payload.filter((_, i) => i === hoveredWeek)
      : payload;
    return (
      <div style={{
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
        padding: '10px 14px',
        minWidth: 120,
      }}>
        <p style={{ fontWeight: 900, color: '#1e293b', fontSize: 12, marginBottom: 6 }}>{label}</p>
        {filtered.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.stroke || entry.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{entry.name}:</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: entry.stroke || entry.color, marginLeft: 'auto' }}>{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-screen">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/organizer/reports')}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-lg transition-all shadow-sm"
            title="Quay lại"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 font-headline tracking-tight mb-1">
              Phân tích Chuyên sâu
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Dữ liệu tổng hợp từ 12 sự kiện gần nhất trong quý này.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period filter — dropdown gọn */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 h-10 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
              <span>
                {period === 'custom' && customRange.start && customRange.end
                  ? `${customRange.start.split('-').reverse().slice(0,2).join('/')} – ${customRange.end.split('-').reverse().slice(0,2).join('/')}`
                  : `${period} ngày qua`}
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
            </button>

            <AnimatePresence>
              {showDatePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-12 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 min-w-[220px] overflow-hidden"
                >
                  {/* Quick picks */}
                  <div className="p-2">
                    {[7, 30, 90].map(d => (
                      <button
                        key={d}
                        onClick={() => { setPeriod(d); setShowDatePicker(false); setCustomRange({ start: '', end: '' }); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${period === d ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {period === d ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        {d} ngày qua
                      </button>
                    ))}
                  </div>

                  {/* Divider + Custom range */}
                  <div className="border-t border-slate-100 p-3 space-y-2.5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tùy chỉnh</p>
                    <div className="space-y-1.5">
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={customRange.start}
                        onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                      />
                      <input
                        type="date"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={customRange.end}
                        onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={() => { setPeriod('custom'); setShowDatePicker(false); }}
                      className="w-full py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all"
                    >
                      Áp dụng
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Export PDF */}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất báo cáo (PDF)
          </button>
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {isLoadingKpi
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
          : apiKpiData.map((card, i) => <KpiCard key={i} card={card} index={i} />)
        }
      </div>

      {/* ── Heatmap + Audience Segment ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-4">
        {/* ── Mật độ tham dự ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-black text-slate-800 text-sm">Mật độ tham dự theo thời gian</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Thống kê lưu lượng check-in tại các cổng theo từng tuần</p>
            </div>
            {/* Toggle Thứ / Giờ */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 shrink-0">
              {['thu', 'gio'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-xs font-black rounded-md transition-all ${
                    viewMode === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {mode === 'thu' ? 'Thứ' : 'Giờ'}
                </button>
              ))}
            </div>
          </div>

          {/* Week legend pills — interactive highlight trigger */}
          <div className="flex flex-wrap gap-2 mb-4">
            {weekLabels.map((lbl, i) => (
              <button
                key={i}
                onMouseEnter={() => setHoveredWeek(i)}
                onMouseLeave={() => setHoveredWeek(null)}
                className={`flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full border transition-all duration-150 cursor-pointer ${
                  hoveredWeek === i
                    ? 'shadow-md scale-105'
                    : hoveredWeek !== null
                    ? 'opacity-40'
                    : ''
                }`}
                style={{
                  backgroundColor: weekColors[i] + (hoveredWeek === i ? '25' : '12'),
                  color: weekColors[i],
                  borderColor: hoveredWeek === i ? weekColors[i] : 'transparent',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block transition-all"
                  style={{ backgroundColor: weekColors[i] }}
                />
                {lbl}
              </button>
            ))}
            {hoveredWeek !== null && (
              <span className="text-[10px] text-slate-400 font-medium self-center ml-1 italic">
                Di chuột ra để xem tất cả
              </span>
            )}
          </div>

          {/* Multi-line Chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {weekColors.map((color, i) => (
                    <linearGradient key={i} id={`lineGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  unit="%"
                />
                <Tooltip
                  content={renderLineTooltip}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                {['w1','w2','w3','w4'].map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={weekLabels[i]}
                    stroke={weekColors[i]}
                    strokeWidth={hoveredWeek === i ? 3.5 : hoveredWeek !== null ? 1.5 : 2.5}
                    strokeOpacity={hoveredWeek !== null && hoveredWeek !== i ? 0.12 : 1}
                    dot={false}
                    activeDot={{
                      r: hoveredWeek === i || hoveredWeek === null ? 5 : 0,
                      strokeWidth: 0,
                      fill: weekColors[i],
                    }}
                    style={{ transition: 'stroke-opacity 0.2s, stroke-width 0.2s' }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Insight */}
          {attendanceAiAnalysis && (
            <div className="mt-4 bg-indigo-50/60 rounded-2xl p-4 px-5 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">auto_awesome</span>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Gợi ý AI</span>
              </div>
              <p className="text-xs text-indigo-950 font-bold mb-2.5">
                {attendanceAiAnalysis.summary}
              </p>
              <ul className="space-y-1.5 text-[11px] text-indigo-900/80 font-medium list-disc list-inside">
                {attendanceAiAnalysis.insights.map((item, idx) => (
                  <li key={idx}>
                    <strong className="text-indigo-950">{item.title}:</strong> {item.desc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Audience Segment — Donut Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col"
        >
          <h2 className="font-black text-slate-800 text-sm mb-4">Phân khúc đối tượng</h2>

          {/* Donut + Legend layout */}
          {(() => {
            const [hoveredSeg, setHoveredSeg] = React.useState(null);

            // Chưa có data từ API → hiển thị placeholder
            if (!activeAudienceSegs || activeAudienceSegs.length === 0) {
              return (
                <div className="flex flex-1 items-center justify-center text-slate-400 text-xs font-semibold py-10">
                  {isLoadingAudience ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu phân khúc'}
                </div>
              );
            }

            const activeSeg = hoveredSeg !== null ? activeAudienceSegs[hoveredSeg] : [...activeAudienceSegs].sort((a, b) => b.pct - a.pct)[0];

            return (
              <div className="flex items-center gap-4 flex-1">
                {/* Donut Chart */}
                <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={activeAudienceSegs.map(s => ({ name: s.label, value: s.pct }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={82}
                        paddingAngle={3}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                        label={false}
                        labelLine={false}
                        activeIndex={hoveredSeg ?? -1}
                        activeShape={(props) => {
                          const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                          return (
                            <g>
                              <path
                                d={`M ${cx},${cy}`}
                                fill="none"
                              />
                              <Sector
                                cx={cx} cy={cy}
                                innerRadius={innerRadius - 2}
                                outerRadius={outerRadius + 9}
                                startAngle={startAngle}
                                endAngle={endAngle}
                                fill={fill}
                              />
                            </g>
                          );
                        }}
                        onMouseEnter={(_, index) => setHoveredSeg(index)}
                        onMouseLeave={() => setHoveredSeg(null)}
                      >
                        {activeAudienceSegs.map((seg, i) => (
                          <Cell
                            key={i}
                            fill={seg.color}
                            opacity={hoveredSeg !== null && hoveredSeg !== i ? 0.35 : 1}
                            style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label — thay đổi theo segment đang hover */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span
                      className="text-xl font-black transition-all duration-200"
                      style={{ color: activeSeg.color }}
                    >
                      {activeSeg.pct}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 text-center leading-tight mt-0.5 max-w-[56px]">
                      {hoveredSeg !== null ? activeSeg.label.replace('Độ tuổi ', '') : 'nhóm\nchủ đạo'}
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2.5">
                  {activeAudienceSegs.map((seg, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-150 cursor-default ${
                        hoveredSeg === i ? 'bg-slate-50 scale-[1.02]' : hoveredSeg !== null ? 'opacity-40' : ''
                      }`}
                      onMouseEnter={() => setHoveredSeg(i)}
                      onMouseLeave={() => setHoveredSeg(null)}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0 transition-all duration-150"
                        style={{
                          backgroundColor: seg.color,
                          transform: hoveredSeg === i ? 'scale(1.3)' : 'scale(1)',
                        }}
                      />
                      <span className={`text-[11px] flex-1 truncate transition-all ${hoveredSeg === i ? 'font-black text-slate-800' : 'font-semibold text-slate-600'}`}>
                        {seg.label}
                      </span>
                      <span className="text-[12px] font-black" style={{ color: seg.color }}>{seg.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* AI insight */}
          {audienceAiAnalysis && (
            <div className="mt-5 bg-[#F6F4FE] rounded-[24px] p-5 px-6 border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#7C3AED] text-[18px]">auto_awesome</span>
                <span className="text-xs font-black text-[#7C3AED] uppercase tracking-widest">Gợi ý AI</span>
              </div>
              <p className="text-xs text-violet-950 font-bold mb-2.5">
                {audienceAiAnalysis.summary}
              </p>
              <ul className="space-y-1.5 text-[11px] text-violet-900/80 font-medium list-disc list-inside">
                {audienceAiAnalysis.insights.map((item, idx) => (
                  <li key={idx}>
                    <strong className="text-violet-950">{item.title}:</strong> {item.desc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

      </div>

      {/* ── Conversion Funnel ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4 overflow-hidden"
      >
        <div className="mb-10">
          <h2 className="font-black text-slate-800 text-sm">Phễu chuyển đổi bán vé</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Phân tích hành trình khách hàng qua từng giai đoạn</p>
        </div>

        {/* Pipeline Layout */}
        <div className="relative flex flex-col lg:flex-row justify-between items-center w-full mb-10 gap-8 lg:gap-0">
          {/* Đường nối background (chạy xuyên qua tất cả) */}
          <div className="absolute top-[40px] left-[12%] right-[12%] h-1.5 bg-slate-100 -translate-y-1/2 rounded-full hidden lg:block" />

          {activeFunnelSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="relative z-10 flex flex-col items-center flex-1 w-full"
            >
              {/* Node */}
              <div 
                className={`relative flex flex-col items-center justify-center w-[140px] h-[80px] rounded-2xl bg-gradient-to-br ${step.color} shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all cursor-default border-[3px] border-white ring-1 ring-slate-100`}
              >
                <span className="text-2xl font-black text-white">{step.value}</span>
                <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest mt-0.5">{step.sub}</span>
              </div>
              
              {/* Label */}
              <div className="mt-4 text-center">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{step.label}</p>
              </div>

              {/* Transition Icon (nằm giữa các node) */}
              {i < activeFunnelSteps.length - 1 && (
                 <div className="absolute top-[40px] left-[100%] -translate-y-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center cursor-default">
                    <div className="bg-white border-2 border-slate-100 text-slate-400 w-8 h-8 rounded-full shadow-sm flex items-center justify-center hover:text-indigo-500 hover:border-indigo-200 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </div>
                 </div>
              )}

              {/* Mobile connector */}
              {i < activeFunnelSteps.length - 1 && (
                <div className="lg:hidden h-8 w-px bg-slate-200 mt-4 relative flex items-center justify-center">
                   <div className="bg-white border border-slate-200 text-slate-400 w-5 h-5 rounded-full absolute flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] rotate-90">chevron_right</span>
                   </div>
                </div>
              )}

            </motion.div>
          ))}
        </div>

        {/* Funnel sub-metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
          {[
            { label: 'Tỷ lệ chuyển đổi giỏ', value: `${cartConversionRate}%`, icon: 'show_chart', color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-100' },
            { label: 'Bỏ giỏ (Cart Abandonment)', value: `${cartAbandonmentRate}%`, icon: 'remove_shopping_cart', color: 'text-rose-500', bg: 'bg-rose-50', ring: 'ring-rose-100' },
            { label: 'Giá trị đơn trung bình', value: formatRevenue(averageOrderValue), icon: 'payments', color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
          ].map((m, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl ${m.bg} ring-1 ${m.ring} transition-all hover:shadow-md cursor-default`}>
              <div className={`w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[24px] ${m.color}`}>{m.icon}</span>
              </div>
              <div>
                <p className={`text-xl font-black ${m.color} tracking-tight`}>{m.value}</p>
                <p className="text-[10px] font-black text-slate-500 mt-0.5 uppercase tracking-wide">{m.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Event Comparison Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h2 className="font-black text-slate-800 text-sm">So sánh hiệu suất sự kiện</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Dữ liệu chi tiết cho 5 sự kiện gần nhất</p>
          </div>
          <button className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1">
            Xem tất cả <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-slate-100 bg-slate-50/50">
                {['Tên sự kiện', 'Loại hình', 'Lượt vé', 'Tỷ lệ Check-in', 'Doanh thu', 'Trạng thái'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeEvents.map((ev, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="hover:bg-indigo-50/40 transition-colors group"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{ev.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">{ev.type}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-black text-slate-700">{ev.tickets}</td>
                  <td className="px-5 py-3.5"><CheckinBar pct={ev.checkin} /></td>
                  <td className="px-5 py-3.5 text-sm font-black text-slate-700">{ev.revenue}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${ev.status === 'done' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {ev.status === 'done' ? 'Hoàn tất' : 'Đang diễn'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default OrganizerReportAnalyticsPage;
