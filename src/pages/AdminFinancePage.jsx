import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import {
  Wallet,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  DollarSign,
  Building,
  User,
  CreditCard,
  Check,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import StatCard from '../components/ui/StatCard';

const AdminFinancePage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  // Custom Toast trigger
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  // ─── Mock Data for Admin Finance Ledger ───────────────────────────────────

  // Platform Monthly Gross Cash Flow
  const monthlyCashflow = [
    { month: 'Tháng 12', grossVolume: 1800, netCommission: 180 },
    { month: 'Tháng 1', grossVolume: 2400, netCommission: 240 },
    { month: 'Tháng 2', grossVolume: 3100, netCommission: 310 },
    { month: 'Tháng 3', grossVolume: 2900, netCommission: 290 },
    { month: 'Tháng 4', grossVolume: 4200, netCommission: 420 },
    { month: 'Tháng 5', grossVolume: 5100, netCommission: 510 },
  ];

  // Organizer Payout/Withdrawal Requests
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'PAY-801', organizer: 'Công ty Cổ phần Sự kiện FPT', eventName: 'FPT Tech Day 2026', amount: 320000000, bankName: 'Vietcombank', bankAccount: '1023940129', bankOwner: 'CONG TY CP SK FPT', requestDate: '18/05/2026', status: 'Chờ duyệt' },
    { id: 'PAY-802', organizer: 'Học viện Âm nhạc Quốc gia', eventName: 'Live Concert: Giai điệu Mùa hạ', amount: 155000000, bankName: 'BIDV', bankAccount: '2151000293041', bankOwner: 'HOC VIEN AM NHAC QG', requestDate: '17/05/2026', status: 'Chờ duyệt' },
    { id: 'PAY-803', organizer: 'VTI Academy', eventName: 'VTI Job Fair & Tech Show', amount: 84000000, bankName: 'Techcombank', bankAccount: '19034901293012', bankOwner: 'VTI ACADEMY GROUP', requestDate: '16/05/2026', status: 'Chờ duyệt' },
    { id: 'PAY-804', organizer: 'Startup Sài Gòn Club', eventName: 'Giao lưu Khởi nghiệp 2026', amount: 19500000, bankName: 'TPBank', bankAccount: '03940123901', bankOwner: 'NGUYEN ANH QUAN', requestDate: '14/05/2026', status: 'Đã thanh toán' },
    { id: 'PAY-805', organizer: 'Graffiti Club Sài Gòn', eventName: 'Triển lãm Vẽ tranh đường phố', amount: 12000000, bankName: 'MB Bank', bankAccount: '990123901293', bankOwner: 'TRAN HOANG NAM', requestDate: '12/05/2026', status: 'Từ chối', reason: 'Sự kiện bị khách hàng phản ánh lừa đảo, đang điều tra.' }
  ]);

  // Global Platform Financial Transactions Log
  const globalTransactions = [
    { trxId: 'TX-9001', type: 'ticket_sale', amount: 1500000, fee: 150000, event: 'Live Concert: Giai điệu Mùa hạ', time: '18/05/2026 15:20', status: 'Thành công' },
    { trxId: 'TX-9002', type: 'ticket_sale', amount: 450000, fee: 45000, event: 'VTI Job Fair & Tech Show', time: '18/05/2026 14:45', status: 'Thành công' },
    { trxId: 'TX-9003', type: 'payout', amount: -19500000, fee: 0, event: 'Giao lưu Khởi nghiệp 2026', time: '18/05/2026 12:10', status: 'Thành công' },
    { trxId: 'TX-9004', type: 'refund', amount: -500000, fee: -50000, event: 'FPT Tech Day 2026', time: '18/05/2026 11:30', status: 'Thành công' },
    { trxId: 'TX-9005', type: 'ticket_sale', amount: 3200000, fee: 320000, event: 'FPT Tech Day 2026', time: '17/05/2026 19:15', status: 'Thành công' },
    { trxId: 'TX-9006', type: 'ticket_sale', amount: 850000, fee: 85000, event: 'Live Concert: Giai điệu Mùa hạ', time: '17/05/2026 16:40', status: 'Thành công' },
    { trxId: 'TX-9007', type: 'ticket_sale', amount: 2500000, fee: 250000, event: 'VTI Job Fair & Tech Show', time: '17/05/2026 10:12', status: 'Thất bại' }
  ];

  // Action Handlers
  const handleExportCSV = () => {
    showToast('Đang kết xuất tệp tin sao lưu sổ cái tài chính...', 'info');
    setTimeout(() => {
      showToast('Đã tải xuống Sổ cái tài chính hệ thống (CSV) thành công!', 'success');
    }, 1500);
  };

  const handleApprovePayout = (payout) => {
    setSelectedPayout(payout);
  };

  const confirmPayoutApproval = () => {
    setPayoutRequests(prev => prev.map(req => 
      req.id === selectedPayout.id ? { ...req, status: 'Đã thanh toán' } : req
    ));
    showToast(`Đã phê duyệt và chuyển khoản ${selectedPayout.amount.toLocaleString()}đ cho đối tác!`, 'success');
    setSelectedPayout(null);
  };

  const handleRejectPayout = (payout) => {
    setSelectedPayout(payout);
    setShowRejectModal(true);
  };

  const confirmPayoutRejection = () => {
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối yêu cầu rút tiền!', 'error');
      return;
    }
    setPayoutRequests(prev => prev.map(req => 
      req.id === selectedPayout.id ? { ...req, status: 'Từ chối', reason: rejectReason } : req
    ));
    showToast(`Đã từ chối yêu cầu giải ngân của ${selectedPayout.organizer}!`, 'error');
    setSelectedPayout(null);
    setRejectReason('');
    setShowRejectModal(false);
  };

  // Dynamic filtering
  const filteredTransactions = globalTransactions.filter(trx => {
    const matchesSearch = trx.event.toLowerCase().includes(searchTerm.toLowerCase()) || trx.trxId.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'sale') return matchesSearch && trx.type === 'ticket_sale';
    if (activeFilter === 'payout') return matchesSearch && trx.type === 'payout';
    if (activeFilter === 'refund') return matchesSearch && trx.type === 'refund';
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Quản trị Tài chính & Dòng tiền</h1>
          <p className="text-slate-500 max-w-2xl font-medium">Theo dõi tổng doanh thu bán vé toàn sàn, quản lý luồng tiền đối tác, và phê duyệt giải ngân tự động nhanh chóng.</p>
        </div>
        
        {/* CSV Export Button (Beautiful Green/Blue layout) */}
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-emerald-600 text-white px-7 py-3.5 rounded-full font-bold border-none shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 transition-all active:scale-95 duration-200 cursor-pointer whitespace-nowrap"
        >
          <FileSpreadsheet className="w-5 h-5 text-white" />
          Xuất Báo cáo Tài chính (CSV)
        </button>
      </div>

      {/* ── Platform Financial KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng dòng tiền giao dịch"
          value="12.8 Tỷ đ"
          subtext="doanh thu bán vé toàn sàn"
          trend="up"
          trendValue="+24.5%"
          icon={Wallet}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Doanh thu hoa hồng (10%)"
          value="1.28 Tỷ đ"
          subtext="phần lợi nhuận của hệ thống"
          trend="up"
          trendValue="+18.2%"
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Yêu cầu giải ngân chờ"
          value={`${payoutRequests.filter(r => r.status === 'Chờ duyệt').length} yêu cầu`}
          subtext="cần kiểm duyệt và thanh toán"
          trend="up"
          trendValue="+2"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Tỷ lệ hoàn vé"
          value="1.4%"
          subtext="thấp hơn 0.5% so với tháng trước"
          trend="down"
          trendValue="-12%"
          icon={XCircle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
      </div>

      {/* ── Cash Flow Chart & Payout Approvals Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Gross Volume Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Biểu đồ Luồng tiền & Phí hoa hồng thu về</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">So sánh dòng tiền bán vé thô và phí dịch vụ 10% giữ lại nền tảng theo tháng</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600" />
                <span className="text-slate-500">Tổng dòng tiền giao dịch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-500">Phí hoa hồng thu về</span>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCashflow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} unit="M" />
                <Tooltip />
                <Area type="monotone" dataKey="grossVolume" name="Tổng tiền giao dịch" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorGross)" />
                <Area type="monotone" dataKey="netCommission" name="Hoa hồng hệ thống" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payout Approval Quick panel */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-950">Giải ngân chờ duyệt</h3>
              <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-xl font-bold text-xs">
                {payoutRequests.filter(r => r.status === 'Chờ duyệt').length} yêu cầu
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mb-6">Xét duyệt rút tiền cho các nhà tổ chức sự kiện đã hoàn thành chương trình</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-1">
            {payoutRequests.filter(r => r.status === 'Chờ duyệt').length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-slate-700">Tất cả yêu cầu rút tiền đã được xử lý xong!</p>
              </div>
            ) : (
              payoutRequests.filter(r => r.status === 'Chờ duyệt').map(req => (
                <div key={req.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-3 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">{req.organizer}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sự kiện: {req.eventName}</p>
                    </div>
                    <span className="text-indigo-600 font-black text-sm whitespace-nowrap">{req.amount.toLocaleString()}đ</span>
                  </div>
                  
                  <div className="h-px bg-slate-200/50" />
                  
                  <div className="flex items-center justify-between gap-2">
                    <button 
                      onClick={() => handleRejectPayout(req)}
                      className="flex-1 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold py-2 rounded-xl border border-slate-200 transition-all cursor-pointer"
                    >
                      Từ chối
                    </button>
                    <button 
                      onClick={() => handleApprovePayout(req)}
                      className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-primary/20"
                    >
                      Duyệt giải ngân
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Platform Transaction History Log ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Table header and filters */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Nhật ký Giao dịch Hệ thống</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Lịch sử chi tiết toàn bộ các luồng tiền phát sinh trên toàn bộ nền tảng</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Tìm mã GD, tên sự kiện..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-60"
              />
            </div>

            {/* Filter tags */}
            <div className="flex bg-slate-100 p-1 rounded-full">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'sale', label: 'Bán vé' },
                { id: 'payout', label: 'Giải ngân' },
                { id: 'refund', label: 'Hoàn tiền' }
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                    ${activeFilter === filter.id 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Mã Giao dịch</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Loại giao dịch</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Sự kiện phát sinh</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tổng số tiền</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Phí hệ thống (10%)</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    Không tìm thấy giao dịch nào phù hợp với bộ lọc!
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(trx => (
                  <tr key={trx.trxId} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-black text-xs text-slate-900">{trx.trxId}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold
                        ${trx.type === 'ticket_sale' ? 'bg-emerald-50 text-emerald-600' : trx.type === 'payout' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trx.type === 'ticket_sale' ? (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            Thu nhập vé
                          </>
                        ) : trx.type === 'payout' ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            Giải ngân đối tác
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            Hoàn trả vé
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm">{trx.event}</td>
                    <td className={`px-6 py-4 font-black text-sm ${trx.amount > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {trx.amount > 0 ? `+${trx.amount.toLocaleString()}đ` : `${trx.amount.toLocaleString()}đ`}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500 text-xs">
                      {trx.fee !== 0 ? `${trx.fee.toLocaleString()}đ` : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">{trx.time}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                        ${trx.status === 'Thành công' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${trx.status === 'Thành công' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Toasts Alert ── */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="fixed bottom-10 right-10 z-[300] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl min-w-[320px] border border-slate-800"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`}>
              {toast.type === 'success' ? (
                <Check className="w-4 h-4 text-white" />
              ) : toast.type === 'error' ? (
                <XCircle className="w-4 h-4 text-white" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-white" />
              )}
            </div>
            <p className="text-sm font-black tracking-tight">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Approval Bank Transfer Receipt Modal ── */}
      <AnimatePresence>
        {selectedPayout && !showRejectModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPayout(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary animate-pulse" />
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Chi tiết chuyển khoản giải ngân</h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Giao dịch: {selectedPayout.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPayout(null)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all font-black">✕</button>
              </div>

              <div className="p-8 space-y-6">
                
                {/* Bank account details card */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-y-2 -translate-x-2 opacity-5">
                    <Building className="w-32 h-32 text-white" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngân hàng thụ hưởng</p>
                      <h4 className="text-lg font-black text-emerald-400">{selectedPayout.bankName}</h4>
                    </div>
                    <span className="bg-white/10 text-slate-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Napas 24/7
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Số tài khoản</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black tracking-widest text-white">{selectedPayout.bankAccount}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedPayout.bankAccount);
                            showToast('Đã sao chép Số tài khoản thành công!');
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-[10px] px-2.5 py-1 rounded-lg transition-all"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Tên người nhận</p>
                        <p className="text-sm font-bold uppercase text-white">{selectedPayout.bankOwner}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Số tiền chuyển</p>
                        <p className="text-base font-black text-emerald-400">{selectedPayout.amount.toLocaleString()}đ</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms notification */}
                <div className="flex gap-3 items-start p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs font-semibold text-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="leading-relaxed">
                    **Lưu ý:** Vui lòng thực hiện chuyển tiền qua ứng dụng ngân hàng của bạn bằng thông tin thụ hưởng trên. Sau khi đã chuyển khoản thành công, nhấn **"Xác nhận đã chuyển"** để đóng yêu cầu rút tiền này.
                  </p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedPayout(null)}
                  className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all rounded-xl cursor-pointer"
                >
                  Quay lại
                </button>
                <button 
                  onClick={confirmPayoutApproval}
                  className="px-8 py-3.5 bg-primary text-white font-black text-sm rounded-xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 cursor-pointer"
                >
                  Xác nhận đã chuyển tiền
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Rejection Explanation Modal ── */}
      <AnimatePresence>
        {selectedPayout && showRejectModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedPayout(null); setShowRejectModal(false); }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-rose-600 animate-pulse" />
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Từ chối giải ngân đối tác</h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Đơn vị: {selectedPayout.organizer}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedPayout(null); setShowRejectModal(false); }} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-all font-black">✕</button>
              </div>

              <div className="p-8 space-y-6">
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-semibold text-rose-800">
                  Hành động này sẽ hủy yêu cầu giải ngân của đối tác và gửi thông báo trực tiếp đến họ. Số tiền tạm giữ của sự kiện sẽ vẫn nằm trong tài khoản ký quỹ của hệ thống.
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Lý do từ chối (Gửi đến Nhà tổ chức)</label>
                  <textarea 
                    rows={4} 
                    value={rejectReason} 
                    onChange={e => setRejectReason(e.target.value)} 
                    placeholder="Nhập lý do chi tiết (ví dụ: Sự kiện bị người dùng báo cáo vi phạm quy chế hoặc hóa đơn tài chính của sự kiện chưa hoàn tất...)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-600 transition-all outline-none resize-none" 
                  />
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => { setSelectedPayout(null); setShowRejectModal(false); }}
                  className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all rounded-xl cursor-pointer"
                >
                  Quay lại
                </button>
                <button 
                  onClick={confirmPayoutRejection}
                  className="px-8 py-3.5 bg-rose-600 text-white font-black text-sm rounded-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 cursor-pointer"
                >
                  Xác nhận Từ chối
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminFinancePage;
