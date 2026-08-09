import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../lib/axios';
import StatCard from '../components/ui/StatCard';
import {
  Ticket,
  CalendarCheck,
  Users2,
  Smile,
  ChevronRight,
  Download,
  Calendar as CalendarIcon,
  CircleDot
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ActivityItem = ({ icon: Icon, color, title, time, onClick }) => (
  <div onClick={onClick} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group">
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-primary transition-colors">
        {title}
      </h4>
      <p className="text-xs text-text-secondary mt-1">{time}</p>
    </div>
  </div>
);

const DeadlineItem = ({ title, event, time, progress, color, date }) => (
  <div className="p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-border-color transition-all">
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="text-sm font-bold text-text-primary">{title}</h4>
        <p className="text-[11px] text-text-secondary">Sự kiện: {event}</p>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-bold text-text-primary">{time}</p>
        <p className="text-[10px] text-text-secondary">{date}</p>
      </div>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-1000`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => parseInt(selectedDate.split('-')[0]));

  // Modals and reactive data states
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    event: '',
    time: 'Hôm nay',
    date: '',
    progress: 50
  });

  const [activities, setActivities] = useState([
    {
      id: 1,
      icon: Ticket,
      color: "bg-blue-50 text-blue-500",
      title: 'Vé sự kiện "Tech Summit 2023" vừa được bán cho Nguyễn Văn A.',
      time: "2 phút trước",
      detail: "Khách hàng Nguyễn Văn A vừa mua thành công 1 Vé VIP sự kiện 'Tech Summit 2023' trị giá 1.500.000đ qua cổng thanh toán VNPay. Mã giao dịch đối soát: #TXN-9021A."
    },
    {
      id: 2,
      icon: CircleDot,
      color: "bg-green-50 text-green-500",
      title: "Thủ tục thanh toán cho Hotel Majestic đã hoàn tất.",
      time: "1 giờ trước",
      detail: "Hệ thống kế toán tự động đối soát và giải ngân đợt 2 cho đối tác địa điểm Hotel Majestic với tổng giá trị hợp đồng thuê mặt bằng là 45.000.000đ."
    },
    {
      id: 3,
      icon: CalendarIcon,
      color: "bg-orange-50 text-orange-500",
      title: "Yêu cầu thay đổi menu từ Lễ cưới Tuấn & Lan cần được duyệt.",
      time: "4 giờ trước",
      detail: "Khách hàng gửi yêu cầu đổi 2 món khai vị trong thực đơn tiệc cưới Standard sang thực đơn Premium Seafood. Cần Ban tổ chức xác nhận chênh lệch chi phí để cập nhật phụ lục hợp đồng."
    },
    {
      id: 4,
      icon: Users2,
      color: "bg-indigo-50 text-indigo-500",
      title: "Hoàng Linh đã tham gia vào đội ngũ quản lý sự kiện.",
      time: "Hôm qua",
      detail: "Thành viên mới Hoàng Linh (Vai trò: Nhân sự hỗ trợ sự kiện - Crew) đã xác nhận thư mời tham gia quản trị dự án thông qua email liên kết và hoàn tất hồ sơ cá nhân trên hệ thống."
    }
  ]);

  const [deadlines, setDeadlines] = useState([
    {
      id: 1,
      title: "Chốt danh sách báo chí",
      event: "Digital Marketing Expo",
      time: "Hôm nay",
      date: "17:00",
      progress: 90,
      color: "bg-red-500"
    },
    {
      id: 2,
      title: "Thanh toán đợt 2 cho đơn vị âm thanh",
      event: "Festival Âm Nhạc Mùa Thu",
      time: "Ngày mai",
      date: "09:00",
      progress: 65,
      color: "bg-blue-500"
    },
    {
      id: 3,
      title: "Gửi thiệp mời VIP",
      event: "Gala Dinner Cuối Năm",
      time: "Còn 3 ngày",
      date: "12/10/2023",
      progress: 30,
      color: "bg-gray-300"
    }
  ]);

  const handleAddDeadline = (e) => {
    e.preventDefault();
    if (!newDeadline.title || !newDeadline.event) {
      alert("Vui lòng điền đầy đủ tên thời hạn và sự kiện!");
      return;
    }
    
    let color = "bg-blue-500";
    if (newDeadline.progress >= 80) color = "bg-red-500";
    else if (newDeadline.progress < 40) color = "bg-gray-300";

    const item = {
      id: deadlines.length + 1,
      title: newDeadline.title,
      event: newDeadline.event,
      time: newDeadline.time,
      date: newDeadline.date || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      progress: parseInt(newDeadline.progress),
      color
    };

    setDeadlines(prev => [item, ...prev]);
    setIsAddDeadlineOpen(false);
    setNewDeadline({
      title: '',
      event: '',
      time: 'Hôm nay',
      date: '',
      progress: 50
    });
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedDate.split('-');
      const response = await axios.get('/admin/dashboard', {
        params: { month: parseInt(month), year: parseInt(year) }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedDate]);

  const handleExport = async () => {
    try {
      const [year, month] = selectedDate.split('-');
      const response = await axios.get('/admin/dashboard/export', {
        params: { month: parseInt(month), year: parseInt(year) },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard_report_Th${month}_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo', error);
    }
  };

  // Chart Data
  const barData = {
    labels: stats?.monthlyRevenue?.map(r => r.month) || ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6'],
    datasets: [
      {
        label: 'Doanh thu',
        data: stats?.monthlyRevenue?.map(r => r.revenue) || [0, 0, 0, 0, 0, 0],
        backgroundColor: '#1e40af',
        borderRadius: 8,
        barThickness: 20,
      },
      {
        label: 'Mục tiêu',
        data: stats?.monthlyRevenue?.map(r => r.revenue > 0 ? r.revenue * 1.2 : 50000000) || [50000000, 50000000, 50000000, 50000000, 50000000, 50000000],
        backgroundColor: '#e2e8f0',
        borderRadius: 8,
        barThickness: 20,
      }
    ],
  };

  const doughnutData = {
    labels: stats?.eventCategories?.map(c => c.name) || ['Hội thảo & Workshop', 'Lễ ra mắt sản phẩm', 'Tiệc công ty'],
    datasets: [
      {
        data: stats?.eventCategories?.map(c => c.percent) || [45, 25, 20],
        backgroundColor: ['#1e40af', '#1d4ed8', '#7dd3fc', '#38bdf8', '#bae6fd'],
        borderWidth: 0,
        hoverOffset: 4,
        cutout: '75%',
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
            Chào buổi sáng, Minh!
          </h2>
          <p className="text-text-secondary font-medium mt-1">
            Dưới đây là tóm tắt hoạt động của các sự kiện trong tháng này.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-border-color font-bold text-sm text-text-primary hover:bg-gray-50 transition-all"
            >
              <CalendarIcon className="w-4 h-4" />
              {selectedDate ? `Tháng ${selectedDate.split('-')[1]}, ${selectedDate.split('-')[0]}` : 'Chọn tháng'}
            </button>

            {showMonthPicker && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-black/5 border border-border-color p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={() => setPickerYear(y => y - 1)} className="p-1.5 text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors rounded-lg">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <span className="font-bold text-text-primary text-sm">Năm {pickerYear}</span>
                  <button onClick={() => setPickerYear(y => y + 1)} className="p-1.5 text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors rounded-lg">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                    const monthStr = String(m).padStart(2, '0');
                    const isSelected = selectedDate === `${pickerYear}-${monthStr}`;
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedDate(`${pickerYear}-${monthStr}`);
                          setShowMonthPicker(false);
                        }}
                        className={`py-2 text-sm font-bold rounded-xl transition-all ${
                          isSelected 
                            ? 'bg-primary text-white shadow-md shadow-primary/20' 
                            : 'bg-gray-50 hover:bg-gray-100 text-text-secondary hover:text-primary'
                        }`}
                      >
                        Th.{m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-primary px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={stats ? `${stats.totalRevenue.toLocaleString('vi-VN')}đ` : '0đ'}
          subtext="so với tháng trước"
          trend="up"
          trendValue="+12.5%"
          icon={Ticket}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
        />
        <StatCard
          title="Sự kiện đang chạy"
          value={stats ? stats.totalEvents.toString() : '0'}
          subtext="mới tuần này"
          trend="up"
          trendValue="+2"
          icon={CalendarCheck}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
        />
        <StatCard
          title="Người tham dự"
          value={stats ? stats.totalAttendees.toLocaleString('vi-VN') : '0'}
          subtext="Tỉ lệ lấp đầy: 84%"
          icon={Users2}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Độ hài lòng"
          value={stats ? `${stats.satisfactionRate}/5` : '0/5'}
          subtext=""
          rating={stats ? stats.satisfactionRate : 0}
          icon={Smile}
          iconBg="bg-orange-50"
          iconColor="text-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-border-color">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Doanh thu theo tháng</h3>
              <p className="text-xs text-text-secondary mt-0.5">Biểu đồ so sánh doanh thu 6 tháng gần nhất</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs font-semibold text-text-secondary">Doanh thu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                <span className="text-xs font-semibold text-text-secondary">Mục tiêu</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { display: false },
                  x: { grid: { display: false }, border: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-border-color flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-1">Phân loại sự kiện</h3>
          <p className="text-xs text-text-secondary mb-8">Phân bổ theo loại hình tổ chức</p>

          <div className="flex-1 relative flex items-center justify-center min-h-[220px]">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-text-primary leading-none">{stats ? stats.totalEvents : 0}</span>
              <span className="text-[10px] text-text-secondary font-bold uppercase mt-1">Sự kiện</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {stats?.eventCategories?.map((cat, index) => {
              const colors = ['bg-[#1e40af]', 'bg-[#1d4ed8]', 'bg-[#7dd3fc]', 'bg-[#38bdf8]', 'bg-[#bae6fd]'];
              return (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className="text-sm font-medium text-text-secondary">{cat.name}</span>
                  </div>
                  <span className="text-sm font-bold text-text-primary">{cat.percent}%</span>
                </div>
              );
            })}
            {(!stats?.eventCategories || stats.eventCategories.length === 0) && (
              <p className="text-sm text-text-secondary text-center italic mt-4">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-[32px] border border-border-color">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-primary">Hoạt động gần đây</h3>
            <button 
              onClick={() => {
                if (location.pathname.startsWith('/admin')) {
                  navigate('/admin/notifications');
                } else if (location.pathname.startsWith('/organizer')) {
                  navigate('/organizer/notifications');
                } else {
                  navigate('/attendee/notifications');
                }
              }}
              className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
            >
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {activities.map((act) => (
              <ActivityItem
                key={act.id}
                icon={act.icon}
                color={act.color}
                title={act.title}
                time={act.time}
                onClick={() => setSelectedActivity(act)}
              />
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white p-8 rounded-[32px] border border-primary/20 bg-gradient-to-br from-white to-primary/5 shadow-inner">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-100 rounded-lg text-red-500">
                <CalendarIcon className="w-4 h-4 fill-current" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Thời hạn sắp tới</h3>
            </div>
            <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
              Cần xử lý ngay
            </span>
          </div>
          <div className="space-y-4">
            {deadlines.map((dl) => (
              <DeadlineItem
                key={dl.id}
                title={dl.title}
                event={dl.event}
                time={dl.time}
                date={dl.date}
                progress={dl.progress}
                color={dl.color}
              />
            ))}
          </div>
          <button 
            onClick={() => setIsAddDeadlineOpen(true)}
            className="w-full mt-6 py-3 border-2 border-dashed border-gray-200 rounded-2xl text-text-secondary text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/50 hover:border-primary/30 hover:text-primary transition-all group"
          >
            <CircleDot className="w-4 h-4 opacity-50 group-hover:opacity-100" />
            Thêm thời hạn mới
          </button>
        </div>
      </div>

      {/* 1. Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col gap-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div className={`p-4 rounded-[20px] ${selectedActivity.color.split(' ')[0]}`}>
                <selectedActivity.icon className="w-6 h-6" />
              </div>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-bold text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  Hoạt động hệ thống
                </span>
                <span className="text-[11px] font-bold text-slate-400">{selectedActivity.time}</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 leading-tight">
                {selectedActivity.title}
              </h3>
              
              <p className="text-slate-500 text-sm leading-relaxed font-medium pt-2">
                {selectedActivity.detail}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button 
                onClick={() => setSelectedActivity(null)}
                className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add New Deadline Modal */}
      {isAddDeadlineOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col gap-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Thêm thời hạn mới</h3>
              <button 
                onClick={() => setIsAddDeadlineOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDeadline} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">Tên thời hạn</label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Chốt danh sách báo chí"
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">Thuộc sự kiện</label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Digital Marketing Expo"
                  value={newDeadline.event}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, event: e.target.value }))}
                  className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">Mốc thời gian</label>
                  <select 
                    value={newDeadline.time}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="Hôm nay">Hôm nay</option>
                    <option value="Ngày mai">Ngày mai</option>
                    <option value="Còn 2 ngày">Còn 2 ngày</option>
                    <option value="Còn 3 ngày">Còn 3 ngày</option>
                    <option value="Còn 5 ngày">Còn 5 ngày</option>
                    <option value="Còn 1 tuần">Còn 1 tuần</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">Giờ / Ngày</label>
                  <input 
                    type="text"
                    placeholder="Ví dụ: 17:00 hoặc 12/10"
                    value={newDeadline.date}
                    onChange={(e) => setNewDeadline(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">Tiến độ chuẩn bị ({newDeadline.progress}%)</label>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    newDeadline.progress >= 80 ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                  }`}>
                    {newDeadline.progress >= 80 ? 'Khẩn cấp' : 'Tiêu chuẩn'}
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={newDeadline.progress}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, progress: e.target.value }))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddDeadlineOpen(false)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
