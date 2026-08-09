import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { 
  MessageSquare, 
  Search, 
  Bell, 
  Settings, 
  MoreVertical, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Flag,
  EyeOff,
  History,
  Send,
  User,
  ShieldCheck,
  Info,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';

const FeedbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'all' or 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loaded Stats & Stream Data
  const [sentiment, setSentiment] = useState({ positive: 68, neutral: 22, negative: 10 });
  const [trendsThisMonth, setTrendsThisMonth] = useState([
    { category: 'SPAM', count: 40 },
    { category: 'NỘI DUNG', count: 80 },
    { category: 'GIẢ MẠO', count: 30 },
    { category: 'KỸ THUẬT', count: 120 },
    { category: 'THANH TOÁN', count: 60 },
    { category: 'KHÁC', count: 45 }
  ]);
  const [trendsLastMonth, setTrendsLastMonth] = useState([
    { category: 'SPAM', count: 60 },
    { category: 'NỘI DUNG', count: 50 },
    { category: 'GIẢ MẠO', count: 45 },
    { category: 'KỸ THUẬT', count: 90 },
    { category: 'THANH TOÁN', count: 110 },
    { category: 'KHÁC', count: 30 }
  ]);
  const [activeMonth, setActiveMonth] = useState('thisMonth'); // 'thisMonth' or 'lastMonth'
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);

  // Modal Interaction State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('reply'); // 'reply' or 'warn'
  const [selectedItem, setSelectedItem] = useState(null);
  const [inputText, setInputText] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/feedback');
      if (response.data) {
        if (response.data.sentiment) setSentiment(response.data.sentiment);
        if (response.data.trendsThisMonth) setTrendsThisMonth(response.data.trendsThisMonth);
        if (response.data.trendsLastMonth) setTrendsLastMonth(response.data.trendsLastMonth);
        if (response.data.items) setItems(response.data.items);
        if (response.data.logs) setLogs(response.data.logs);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách kiểm duyệt phản hồi', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (item, actionType, text = '') => {
    try {
      setActionSubmitting(true);
      await axios.post('/admin/feedback/action', {
        feedbackId: item.id,
        actionType: actionType,
        replyText: text
      });
      
      // Reset Modal state
      setShowModal(false);
      setInputText('');
      setSelectedItem(null);
      
      // Refresh Data
      await fetchData();
      
      alert('Đã thực hiện thao tác kiểm duyệt thành công!');
    } catch (error) {
      console.error('Lỗi khi xử lý kiểm duyệt phản hồi', error);
      alert('Không thể thực hiện thao tác kiểm duyệt. Vui lòng thử lại!');
    } finally {
      setActionSubmitting(false);
    }
  };

  const openActionModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setInputText(
      type === 'reply' 
        ? `Chào ${item.name.split(' ').pop()}, chúng tôi đã nhận đóng góp của bạn và đang kiểm tra. Cảm ơn bạn!`
        : `Cảnh báo: Tài khoản của bạn bị cảnh cáo do báo cáo sai sự thật hoặc nội dung không hợp lệ.`
    );
    setShowModal(true);
  };

  // Filter items dynamically by status tab & search input
  const filteredItems = items.filter(item => {
    const matchesStatus = filter === 'all' || item.status === 'PENDING';
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const currentTrends = activeMonth === 'thisMonth' ? trendsThisMonth : trendsLastMonth;
  const maxTrendCount = Math.max(...currentTrends.map(t => t.count), 1);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-full font-sans animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header section with Dynamic Search Input */}
        <div className="flex justify-between items-center">
          <div className="max-w-md">
            <span className="text-xs font-black text-primary uppercase tracking-widest">Hệ thống</span>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1 flex items-center gap-2">
              Kiểm Duyệt Phản Hồi
            </h1>
          </div>
          
          <div className="relative w-80">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm phản hồi..." 
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Top Analysis Section */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Sentiment Analysis Card */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800">Phân tích Cảm xúc</h2>
            </div>
            
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-500">Tích cực</span>
                  <span className="text-lg font-black text-primary">{sentiment.positive}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${sentiment.positive}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-500">Trung lập</span>
                  <span className="text-lg font-black text-slate-400">{sentiment.neutral}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full transition-all duration-1000" style={{ width: `${sentiment.neutral}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-500">Tiêu cực</span>
                  <span className="text-lg font-black text-red-500">{sentiment.negative}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${sentiment.negative}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Trends Chart Card */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                   <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800">Xu hướng Báo cáo Sự cố</h2>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                 <button 
                   onClick={() => setActiveMonth('thisMonth')}
                   className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                     activeMonth === 'thisMonth' 
                       ? 'bg-white shadow-sm text-primary' 
                       : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   Tháng này
                 </button>
                 <button 
                   onClick={() => setActiveMonth('lastMonth')}
                   className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                     activeMonth === 'lastMonth' 
                       ? 'bg-white shadow-sm text-primary' 
                       : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   Tháng trước
                 </button>
              </div>
            </div>

            <div className="h-[200px] flex items-end justify-between px-4 pb-8 relative">
                {/* Horizontal grid lines simulation */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                   <div className="border-t border-slate-900 w-full h-[1px]"></div>
                   <div className="border-t border-slate-900 w-full h-[1px]"></div>
                   <div className="border-t border-slate-900 w-full h-[1px]"></div>
                </div>

                {currentTrends.map((t, idx) => {
                  const barHeight = Math.max(30, (t.count / maxTrendCount) * 140);
                  const isTech = t.category === 'KỸ THUẬT';
                  return (
                    <div key={idx} className="flex flex-col items-center gap-3 w-full group">
                       <div 
                         className={`w-16 rounded-t-2xl transition-all duration-1000 relative ${
                           isTech 
                             ? 'bg-primary shadow-lg shadow-primary/20 hover:bg-primary-hover' 
                             : 'bg-indigo-100 group-hover:bg-indigo-200'
                         }`}
                         style={{ height: `${barHeight}px` }}
                       >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-500 scale-0 group-hover:scale-100 transition-all duration-200">
                            {t.count}
                          </span>
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-wider ${isTech ? 'text-primary' : 'text-slate-400'}`}>
                         {t.category}
                       </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Bottom Stream Section */}
        <div className="grid grid-cols-12 gap-8 pt-4">
          
          {/* Feedback Stream (8/12) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-black text-slate-800">Luồng Phản hồi Mới</h2>
               <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                  <button 
                    onClick={() => setFilter('all')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-white shadow-md text-primary' : 'text-slate-500 hover:text-slate-800'}`}
                  >Tất cả</button>
                  <button 
                    onClick={() => setFilter('pending')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'pending' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-500 hover:text-slate-800'}`}
                  >Cần xử lý</button>
               </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-[40px] p-16 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-400">Đang tải luồng phản hồi...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-[40px] p-16 shadow-sm border border-slate-100 text-center">
                <p className="text-slate-400 font-bold">Không tìm thấy phản hồi nào!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 transition-all hover:border-primary/20 group">
                    <div className="flex items-start justify-between mb-6">
                       <div className="flex gap-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/10 bg-slate-100">
                             <img src={item.avatarUrl} alt={item.name} onError={(e) => { e.target.src="https://avatar.vercel.sh/user.png" }} />
                          </div>
                          <div>
                             <h4 className="text-lg font-black text-slate-800">{item.name}</h4>
                             <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                               {item.username} <span className="opacity-30">•</span> <Clock className="w-3 h-3" /> {item.timeText}
                             </p>
                          </div>
                       </div>
                       
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                         item.categoryColor === 'red' ? 'bg-red-50 text-red-600 border-red-100' :
                         item.categoryColor === 'blue' ? 'bg-blue-50 text-primary border-blue-100' :
                         'bg-slate-50 text-slate-600 border-slate-200'
                       }`}>
                         {item.categoryLabel}
                       </span>
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed mb-8 text-md font-medium">
                       "{item.message}"
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <div className="flex gap-2">
                         {item.category === 'CONTENT_REPORT' && (
                           <>
                             <button 
                               onClick={() => handleAction(item, 'APPROVE')}
                               className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                             >
                                <CheckCircle2 className="w-4 h-4" /> Phê duyệt
                             </button>
                             <button 
                               onClick={() => openActionModal(item, 'warn')}
                               className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-95"
                             >
                                <Flag className="w-4 h-4" /> Cảnh cáo
                             </button>
                             <button 
                               onClick={() => handleAction(item, 'HIDE')}
                               className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                             >
                                <EyeOff className="w-4 h-4" /> Ẩn nội dung
                             </button>
                           </>
                         )}

                         {item.category === 'SUGGESTION' && (
                           <>
                             <button 
                               onClick={() => openActionModal(item, 'reply')}
                               className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                             >
                                <Send className="w-4 h-4" /> Phản hồi
                             </button>
                             <button 
                               onClick={() => handleAction(item, 'APPROVE')}
                               className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                             >
                                <History className="w-4 h-4" /> Lưu trữ
                             </button>
                           </>
                         )}

                         {item.category === 'TECH_ISSUE' && (
                           <>
                             <button 
                               onClick={() => handleAction(item, 'TRANSFER_TECH')}
                               className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95"
                             >
                                <ShieldCheck className="w-4 h-4" /> Chuyển Tech-Team
                             </button>
                             <span className="inline-flex items-center gap-1 px-4 py-2 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-xl border border-amber-100">
                                Đang xử lý
                             </span>
                           </>
                         )}
                       </div>
                       
                       <div className="text-right">
                         {item.category === 'SUGGESTION' && (
                           <p className="text-xs font-bold italic text-slate-400">
                              Cảm xúc: <span className="text-primary font-black">{item.sentiment}</span>
                           </p>
                         )}
                         {item.category === 'TECH_ISSUE' && (
                           <p className="text-xs font-bold text-slate-400">
                              Mức độ: <span className="text-red-500 font-black">{item.severity}</span>
                           </p>
                         )}
                         {item.category === 'CONTENT_REPORT' && (
                           <button className="text-xs font-black text-primary hover:underline flex items-center gap-1 active:scale-95 transition-all">
                              Chi tiết báo cáo <ChevronRight className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel (4/12) */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            
            {/* Communication Log */}
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
               <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                  Nhật ký Giao tiếp
               </h3>

               {loading ? (
                 <div className="py-8 flex flex-col items-center gap-2">
                   <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                   <p className="text-[10px] font-bold text-slate-400">Đang tải nhật ký...</p>
                 </div>
               ) : (
                 <div className="space-y-6 max-h-[480px] overflow-y-auto pr-1">
                   {logs.map((log, idx) => (
                     <div key={idx} className="flex gap-4 group">
                        <div className="flex flex-col items-center">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
                             log.logType === 'alert' ? 'bg-red-50 text-red-500 border-red-100' :
                             log.logType === 'system' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                             'bg-indigo-50 text-primary border-indigo-100'
                           }`}>
                              {log.logType === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
                               log.logType === 'system' ? <Info className="w-5 h-5" /> :
                               <User className="w-5 h-5" />}
                           </div>
                           {idx < logs.length - 1 && <div className="w-[2px] h-full bg-slate-50 my-2"></div>}
                        </div>
                        <div className="bg-slate-50/80 rounded-3xl p-5 hover:bg-slate-50 transition-all flex-1">
                           <p className={`text-xs font-black mb-2 uppercase tracking-wider ${
                             log.logType === 'alert' ? 'text-red-600' :
                             log.logType === 'system' ? 'text-slate-800' : 'text-primary'
                           }`}>
                             {log.sender} → {log.receiver}
                           </p>
                           <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              "{log.message}"
                           </p>
                           <p className="text-[10px] text-slate-400 mt-3 font-bold">{log.timeText}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               )}

               <button className="w-full mt-6 py-4 px-6 border-2 border-slate-100 rounded-3xl text-sm font-black text-slate-500 hover:bg-slate-50 hover:text-primary transition-all flex items-center justify-center gap-2 group active:scale-95">
                  Xem toàn bộ lịch sử <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>

            {/* Help Center CTA */}
            <div className="bg-primary rounded-[40px] p-8 shadow-2xl shadow-primary/20 relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-black text-white leading-tight">Trung tâm Trợ giúp</h3>
                  <p className="text-white/80 text-sm leading-relaxed font-medium">
                     Bạn cần hỗ trợ xử lý các báo cáo phức tạp? Liên hệ trực tiếp với bộ phận Pháp lý.
                  </p>
                  <button className="w-full py-4 bg-white/20 backdrop-blur-md rounded-2xl text-white font-black hover:bg-white text-primary transition-all duration-300 active:scale-95">
                     Kết nối Pháp lý
                  </button>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL DIALOG - CUSTOM OVERLAY FOR INTERACTIVE ACTION */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setShowModal(false); setSelectedItem(null); }}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-800 mb-2">
              {modalType === 'reply' ? 'Gửi phản hồi đóng góp' : 'Gửi cảnh báo vi phạm'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Người nhận: <span className="font-bold text-primary">{selectedItem.name} ({selectedItem.username})</span>
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nội dung tin nhắn</label>
                <textarea 
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-2xl p-4 text-slate-700 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none font-medium leading-relaxed"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => { setShowModal(false); setSelectedItem(null); }}
                  className="flex-1 py-3 border-2 border-slate-100 hover:bg-slate-50 text-slate-500 text-xs font-black rounded-2xl transition-all active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button 
                  disabled={actionSubmitting}
                  onClick={() => handleAction(selectedItem, modalType === 'reply' ? 'REPLY' : 'WARN', inputText)}
                  className="flex-1 py-3 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white text-xs font-black rounded-2xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {actionSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Gửi ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
