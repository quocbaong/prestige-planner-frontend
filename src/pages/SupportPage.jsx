import React, { useState } from 'react';
import { useAuth } from '../stores/AuthContext';
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  PhoneCall, 
  Search, 
  ChevronDown, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Sparkles,
  UserCheck,
  ArrowRight
} from 'lucide-react';

const SupportPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'ATTENDEE'; // Fallback to attendee

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Support ticket form states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Chat assistant state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: `Xin chào! Tôi là trợ lý ảo NexusAI. Bạn cần hỗ trợ gì về vai trò ${role === 'ADMIN' ? 'Quản trị viên' : role === 'ORGANIZER' ? 'Nhà tổ chức' : 'Người tham gia'} của mình?` }
  ]);

  // Calculator state for Organizer
  const [calcTickets, setCalcTickets] = useState('100');
  const [calcPrice, setCalcPrice] = useState('200000');
  const [calcCommission, setCalcCommission] = useState('15');

  // Dynamic FAQs based on Role
  const faqs = {
    ADMIN: [
      {
        q: "Làm thế nào để duyệt hàng loạt sự kiện?",
        a: "Truy cập mục 'Sự kiện' từ thanh menu bên trái, tích chọn các sự kiện ở chế độ 'Chờ phê duyệt' và nhấn nút 'Phê duyệt hàng loạt' ở thanh thao tác phía trên."
      },
      {
        q: "Làm thế nào để xuất báo cáo tài chính định kỳ?",
        a: "Vào mục 'Báo cáo' -> Chọn mốc thời gian (Tháng/Năm) và nhấn 'Xuất báo cáo'. File CSV mã hóa UTF-8 sẽ tự động được tải xuống thiết bị của bạn."
      },
      {
        q: "Cấu hình cổng thanh toán Stripe ở đâu?",
        a: "Nhấp vào nút biểu tượng răng cưa 'Cài đặt' ở góc trên bên phải, kéo xuống phần 'API & Tích hợp' và nhập đầy đủ Publishable Key và Secret Key của tài khoản Stripe doanh nghiệp."
      },
      {
        q: "Sao lưu cơ sở dữ liệu hệ thống như thế nào?",
        a: "Trong phần 'Cài đặt' -> 'Sao lưu & Khôi phục', nhấp vào 'Sao lưu ngay'. Hệ thống sẽ tự động tạo file dump SQL và lưu trữ đám mây an toàn."
      }
    ],
    ORGANIZER: [
      {
        q: "Phí hoa hồng nền tảng được tính như thế nào?",
        a: "Phí hoa hồng nền tảng được tính dựa trên tỷ lệ % (mặc định 15%) trừ trực tiếp trên tổng doanh số bán vé thực tế của từng sự kiện trước khi thanh toán."
      },
      {
        q: "Làm cách nào để yêu cầu rút tiền doanh thu sự kiện?",
        a: "Vào mục 'Tài chính' bên menu trái, chọn sự kiện cần quyết toán và gửi yêu cầu rút tiền. Đội ngũ Admin sẽ kiểm duyệt và chuyển khoản trong vòng 24h-48h làm việc."
      },
      {
        q: "Tôi có thể tự tạo mã giảm giá (voucher) cho khách hàng không?",
        a: "Có, khi tạo hoặc chỉnh sửa sự kiện, bạn có thể thêm cấu hình vé Khuyến mãi hoặc liên hệ Admin để tạo các chiến dịch marketing lớn toàn hệ thống."
      },
      {
        q: "Làm thế nào để kiểm tra danh sách và check-in khách mời?",
        a: "Truy cập mục 'Khách mời' trên Sidebar để xem toàn bộ danh sách khách đăng ký, hoặc sử dụng công cụ quét mã QR trên ứng dụng di động để check-in tức thì tại sự kiện."
      }
    ],
    ATTENDEE: [
      {
        q: "Làm sao để tôi nhận được vé sau khi thanh toán thành công?",
        a: "Sau khi giao dịch thành công, vé kèm mã QR check-in độc quyền sẽ lập tức xuất hiện tại mục 'Vé & Đăng ký' trong tài khoản của bạn, đồng thời một email xác nhận cũng sẽ được gửi tới hộp thư cá nhân."
      },
      {
        q: "Chính sách hoàn tiền vé khi sự kiện bị hủy hoặc thay đổi lịch?",
        a: "Trong trường hợp sự kiện bị hủy hoặc dời lịch bởi Nhà tổ chức, bạn sẽ được hoàn tiền 100%. Tiền sẽ được hoàn trả tự động về thẻ/tài khoản thanh toán ban đầu của bạn trong vòng 3-5 ngày làm việc."
      },
      {
        q: "Làm thế nào để check-in vào cửa sự kiện?",
        a: "Bạn chỉ cần mở mục 'Check-in QR' trên app di động hoặc xuất trình mã QR đính kèm trong email vé cho nhân viên kiểm soát tại quầy đón tiếp sự kiện quét mã."
      },
      {
        q: "Tôi có thể thay đổi thông tin người nhận vé sau khi mua không?",
        a: "Hiện tại, vì lý do an ninh, vé điện tử được liên kết trực tiếp với email đăng ký mua ban đầu. Bạn có thể gửi yêu cầu hỗ trợ chuyển đổi thông tin vé trước sự kiện ít nhất 24h."
      }
    ]
  };

  const currentFaqs = faqs[role] || faqs.ATTENDEE;

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticketSubject || !ticketCategory || !ticketMessage) return;

    setSubmittingTicket(true);
    // Simulate API request to create feedback ticket
    setTimeout(() => {
      setSubmittingTicket(false);
      setTicketSuccess(true);
      setTicketSubject('');
      setTicketCategory('');
      setTicketMessage('');
      setTimeout(() => setTicketSuccess(false), 5000);
    }, 1500);
  };

  const handleBotQuestionClick = (question, answer) => {
    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: question },
      { sender: 'bot', text: answer }
    ]);
  };

  // Calculator helper for Organizer
  const calculatePayout = () => {
    const tickets = parseFloat(calcTickets) || 0;
    const price = parseFloat(calcPrice) || 0;
    const comm = parseFloat(calcCommission) || 0;
    const gross = tickets * price;
    const fee = gross * (comm / 100);
    const net = gross - fee;

    return {
      gross: gross.toLocaleString('vi-VN') + ' đ',
      fee: fee.toLocaleString('vi-VN') + ' đ',
      net: net.toLocaleString('vi-VN') + ' đ'
    };
  };

  const payoutResult = calculatePayout();

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] font-sans overflow-y-auto no-scrollbar">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white py-14 px-10 relative overflow-hidden flex-shrink-0">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="max-w-[1200px] mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Trang Hỗ Trợ Hệ Thống</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none">
            {role === 'ADMIN' ? 'Trung tâm Hỗ trợ Quản trị viên' : 
             role === 'ORGANIZER' ? 'Trung tâm Hỗ trợ Nhà tổ chức' : 
             'Trung tâm Hỗ trợ Người tham gia'}
          </h1>
          <p className="text-indigo-100 max-w-xl font-bold text-sm lg:text-base leading-relaxed">
            {role === 'ADMIN' ? 'Công cụ hướng dẫn vận hành hệ thống, tối ưu máy chủ, sao lưu dữ liệu và xử lý các phản hồi khẩn cấp.' :
             role === 'ORGANIZER' ? 'Giải đáp thắc mắc về tạo sự kiện, thiết lập loại vé, đối soát tài chính và quyết toán doanh thu bán vé.' :
             'Tìm kiếm câu trả lời nhanh chóng về vé điện tử, thanh toán, mã QR check-in và quyền lợi khi tham dự sự kiện.'}
          </p>

          {/* Search Box */}
          <div className="max-w-xl relative mt-4">
            <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Nhập câu hỏi hoặc từ khóa tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-white rounded-2xl text-slate-700 font-bold text-sm shadow-xl focus:ring-4 focus:ring-indigo-500/20 outline-none border-none transition-all placeholder:text-slate-400 placeholder:font-bold"
            />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-[1200px] w-full mx-auto px-10 py-12 grid grid-cols-12 gap-8">
        
        {/* Left Column: FAQ & Interactive Tools (8/12) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* FAQ Section */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100/50">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Câu Hỏi Thường Gặp (FAQs)</span>
            </h2>

            <div className="space-y-4">
              {currentFaqs
                .filter(faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((faq, index) => (
                  <div 
                    key={index}
                    className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 text-left font-black text-slate-700 text-sm transition-all"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-180 text-indigo-600' : ''}`} />
                    </button>
                    {activeFaq === index && (
                      <div className="p-5 bg-white border-t border-slate-50 text-slate-500 text-xs leading-relaxed font-bold animate-in fade-in slide-in-from-top-2 duration-300">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              
              {currentFaqs.filter(faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-slate-400 font-bold text-sm">Không tìm thấy câu hỏi phù hợp!</p>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Tool based on role */}
          {role === 'ORGANIZER' && (
            <div className="bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-8 translate-x-8"></div>
              
              <h2 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-2 text-indigo-200">
                <DollarSign className="w-5 h-5 text-indigo-400" />
                <span>Công Cụ Tính Doanh Thu Thực Nhận</span>
              </h2>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Số vé ước tính</label>
                  <input 
                    type="number" 
                    value={calcTickets} 
                    onChange={(e) => setCalcTickets(e.target.value)} 
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-3.5 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Giá vé (đ)</label>
                  <input 
                    type="number" 
                    value={calcPrice} 
                    onChange={(e) => setCalcPrice(e.target.value)} 
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-3.5 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Tỷ lệ hoa hồng (%)</label>
                  <input 
                    type="number" 
                    value={calcCommission} 
                    onChange={(e) => setCalcCommission(e.target.value)} 
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-3.5 text-white font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/50" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Tổng Doanh Số</p>
                  <p className="text-xl font-black text-white mt-1">{payoutResult.gross}</p>
                </div>
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Phí Nền Tảng</p>
                  <p className="text-xl font-black text-rose-400 mt-1">{payoutResult.fee}</p>
                </div>
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Doanh Thu Nhận Về</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{payoutResult.net}</p>
                </div>
              </div>
            </div>
          )}

          {role === 'ADMIN' && (
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100/50">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <span>Tiêu chuẩn Vận hành Hệ thống</span>
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-sm font-black text-slate-800">Thời gian phản hồi SLA</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-bold">Cam kết phản hồi phản hồi/khiếu nại kỹ thuật của người dùng trong vòng tối đa 2 giờ làm việc kể từ khi nhận được ticket.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-sm font-black text-slate-800">Chu kỳ kiểm tra hiệu năng</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-bold">Hệ thống tiến hành tự động hóa dọn dẹp cache Redis vào lúc 03:00 AM mỗi Chủ nhật để đảm bảo hiệu suất truy cập tốt nhất.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Support Form & AI Chatbot Trigger (4/12) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Submit Support Ticket Form */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100/50 space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-800 mb-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Gửi Yêu Cầu Hỗ Trợ</span>
              </h2>
              <p className="text-xs text-slate-400 font-bold">Gửi khiếu nại, góp ý hoặc báo cáo sự cố trực tiếp tới Admin.</p>
            </div>

            {ticketSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-3 animate-in zoom-in duration-300">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-black text-emerald-800">Gửi yêu cầu thành công!</h4>
                <p className="text-xs text-emerald-600 font-bold leading-relaxed">Mã ticket của bạn là #NEX-{Math.floor(1000 + Math.random() * 9000)}. Chúng tôi sẽ phản hồi sớm nhất qua email của bạn.</p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề yêu cầu</label>
                  <input 
                    type="text" 
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Tóm tắt ngắn gọn vấn đề cần hỗ trợ..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-slate-700 font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/20 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Danh mục sự cố</label>
                  <select 
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-slate-700 font-bold text-xs outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/20 transition-all"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    <option value="TECH_ISSUE">Lỗi kỹ thuật hệ thống</option>
                    <option value="PAYMENT">Vấn đề thanh toán / Giao dịch</option>
                    <option value="SUGGESTION">Góp ý phát triển sản phẩm</option>
                    <option value="CONTENT_REPORT">Báo cáo nội dung xấu</option>
                    <option value="OTHER">Lý do khác</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả chi tiết</label>
                  <textarea 
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Mô tả cụ thể sự cố bạn gặp phải để chúng tôi hỗ trợ nhanh nhất..." 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-slate-700 font-medium text-xs outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500/20 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submittingTicket}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-black text-[11px] uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {submittingTicket ? (
                    <>Đang gửi yêu cầu...</>
                  ) : (
                    <>
                      <span>Gửi yêu cầu ngay</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Channels */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100/50 space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Kênh Liên Hệ Khẩn Cấp</h3>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <PhoneCall className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Hotline 24/7</p>
                  <p className="text-sm font-black text-slate-800">1900 6868 (Phím 3)</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) for NexusAI Chatbot assistant */}
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 animate-pulse"
      >
        <Sparkles className="w-7 h-7" />
      </button>

      {/* NexusAI Chatbot Widget Overlay */}
      {chatOpen && (
        <div className="fixed bottom-28 right-8 w-[380px] h-[500px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-black text-sm">NexusAI Assistant</h3>
                <p className="text-[9px] text-indigo-200 font-bold uppercase tracking-widest">Trợ lý hỗ trợ 24/7</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white hover:text-indigo-200 transition-all font-bold text-sm">✕</button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-4 bg-slate-50/50">
            {chatMessages.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
              >
                <div className={`max-w-[75%] px-4.5 py-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Preset Questions Selector */}
          <div className="p-4 border-t border-slate-100 bg-white flex flex-col gap-2 flex-shrink-0">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider ml-1">Chọn câu hỏi nhanh:</p>
            <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar">
              {role === 'ORGANIZER' && (
                <>
                  <button 
                    onClick={() => handleBotQuestionClick("Làm thế nào rút tiền doanh số?", "Để rút tiền, bạn vào mục 'Tài chính', nhấp vào sự kiện đã kết thúc và chọn 'Yêu cầu rút tiền'. Admin sẽ duyệt chuyển khoản trong 24h làm việc.")}
                    className="text-[11px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 p-2.5 rounded-xl text-left transition-all flex items-center justify-between"
                  >
                    <span>Làm thế nào rút tiền doanh số?</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleBotQuestionClick("Phí hoa hồng nền tảng bao nhiêu?", "Mức hoa hồng nền tảng mặc định là 15% tổng doanh số bán vé, được trừ tự động trước khi quyết toán.")}
                    className="text-[11px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 p-2.5 rounded-xl text-left transition-all flex items-center justify-between"
                  >
                    <span>Phí hoa hồng nền tảng bao nhiêu?</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}
              {role === 'ATTENDEE' && (
                <>
                  <button 
                    onClick={() => handleBotQuestionClick("Tôi không nhận được mã QR?", "Mã QR được đính kèm ở email xác nhận, và luôn hiển thị tại mục 'Vé & Đăng ký' trong tài khoản cá nhân của bạn.")}
                    className="text-[11px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 p-2.5 rounded-xl text-left transition-all flex items-center justify-between"
                  >
                    <span>Tôi không nhận được mã QR?</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleBotQuestionClick("Chính sách đổi trả/hủy vé?", "Nếu sự kiện bị hủy từ phía Nhà tổ chức, bạn được hoàn tiền 100%. Nếu muốn tự hủy vé, vui lòng xem điều khoản riêng từng sự kiện.")}
                    className="text-[11px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 p-2.5 rounded-xl text-left transition-all flex items-center justify-between"
                  >
                    <span>Chính sách đổi trả/hủy vé?</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}
              {role === 'ADMIN' && (
                <>
                  <button 
                    onClick={() => handleBotQuestionClick("Duyệt nhanh sự kiện?", "Vào trang quản lý Sự kiện, lọc danh sách 'Chờ phê duyệt' và bấm chọn Approve để xuất bản sự kiện ra trang chủ.")}
                    className="text-[11px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 p-2.5 rounded-xl text-left transition-all flex items-center justify-between"
                  >
                    <span>Duyệt nhanh sự kiện?</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleBotQuestionClick("Khôi phục DB từ file dump SQL?", "Truy cập Settings -> Sao lưu & Khôi phục. Sử dụng terminal của máy chủ hoặc Docker Exec để chạy câu lệnh psql import file dump.")}
                    className="text-[11px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 p-2.5 rounded-xl text-left transition-all flex items-center justify-between"
                  >
                    <span>Khôi phục DB từ file dump SQL?</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupportPage;
