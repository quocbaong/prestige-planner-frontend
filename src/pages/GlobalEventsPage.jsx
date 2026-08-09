import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { 
  ChevronRight, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Ban, 
  Eye, 
  RotateCcw,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  PieChart
} from 'lucide-react';

const StatCard = ({ title, value, valueColor = "text-text-primary", footer }) => (
  <div className="bg-white p-3 rounded-2xl border border-border-color shadow-sm flex flex-col gap-1.5 min-w-[120px] flex-1">
    <span className="text-[9px] uppercase tracking-widest font-black text-text-secondary/60">
      {title}
    </span>
    <div className="space-y-2">
      <h3 className={`text-2xl font-black tracking-tighter ${valueColor}`}>{value}</h3>
      {footer}
    </div>
  </div>
);

const FilterDropdown = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</span>
    <div className="relative group">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-border-color rounded-xl py-3 px-4 text-sm font-bold text-text-primary appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none group-focus:rotate-180 transition-transform">
        <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
      </div>
    </div>
  </div>
);

const GlobalEventsPage = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalEventsTrend: "+12%",
    ongoingEvents: 0,
    pendingEvents: 0,
    reportedEvents: 0
  });

  const [categories, setCategories] = useState([
    { name: "Hội thảo", percent: 0, color: "bg-primary" },
    { name: "Âm nhạc", percent: 0, color: "bg-purple-500" },
    { name: "Thể thao", percent: 0, color: "bg-orange-500" },
    { name: "Khác", percent: 0, color: "bg-gray-300" }
  ]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả hạng mục");
  const [selectedOrganizerRole, setSelectedOrganizerRole] = useState("Tất cả cấp độ");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [currentPage, setCurrentPage] = useState(1);

  // Active filters applied to API call
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    category: "Tất cả hạng mục",
    organizerRole: "Tất cả cấp độ",
    status: "Tất cả trạng thái"
  });

  // Selection states for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/events', {
        params: {
          search: appliedFilters.search,
          category: appliedFilters.category,
          organizerRole: appliedFilters.organizerRole,
          status: appliedFilters.status,
          page: currentPage,
          size: 10
        }
      });

      const { events: fetchedEvents, stats: fetchedStats, categories: fetchedCategories, pagination: fetchedPagination } = response.data;
      setEvents(fetchedEvents || []);
      if (fetchedStats) setStats(fetchedStats);
      
      if (fetchedCategories) {
        const colorMap = {
          "HỘI THẢO": "bg-primary",
          "Hội thảo": "bg-primary",
          "ÂM NHẠC": "bg-purple-500",
          "Âm nhạc": "bg-purple-500",
          "THỂ THAO": "bg-orange-500",
          "Thể thao": "bg-orange-500",
          "KHÁC": "bg-gray-300",
          "Khác": "bg-gray-300"
        };
        setCategories(fetchedCategories.map(cat => ({
          name: cat.name,
          percent: cat.percent,
          color: colorMap[cat.name] || "bg-gray-300"
        })));
      }

      if (fetchedPagination) setPagination(fetchedPagination);
    } catch (error) {
      console.error('Lỗi khi tải danh sách sự kiện', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [appliedFilters, currentPage]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({
      search: searchQuery,
      category: selectedCategory,
      organizerRole: selectedOrganizerRole,
      status: selectedStatus
    });
  };

  const handleApproveEvent = async (dbId, name) => {
    if (processingIds.includes(dbId)) return;
    setProcessingIds(prev => [...prev, dbId]);
    try {
      await axios.post(`/admin/events/${dbId}/approve`);
      await fetchEvents();
    } catch (error) {
      console.error('Lỗi khi phê duyệt sự kiện', error);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== dbId));
    }
  };

  const handleSuspendEvent = async (dbId, name) => {
    if (processingIds.includes(dbId)) return;
    setProcessingIds(prev => [...prev, dbId]);
    try {
      await axios.post(`/admin/events/${dbId}/suspend`);
      await fetchEvents();
    } catch (error) {
      console.error('Lỗi khi đình chỉ sự kiện', error);
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== dbId));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn phê duyệt ${selectedIds.length} sự kiện đã chọn?`)) {
      try {
        await axios.post('/admin/events/bulk-approve', selectedIds);
        setSelectedIds([]);
        fetchEvents();
      } catch (error) {
        console.error('Lỗi khi phê duyệt hàng loạt', error);
      }
    }
  };

  const handleBulkSuspend = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn đình chỉ ${selectedIds.length} sự kiện đã chọn?`)) {
      try {
        await axios.post('/admin/events/bulk-suspend', selectedIds);
        setSelectedIds([]);
        fetchEvents();
      } catch (error) {
        console.error('Lỗi khi đình chỉ hàng loạt', error);
      }
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === events.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(events.map(e => e.dbId));
    }
  };

  const handleToggleSelectOne = (dbId) => {
    if (selectedIds.includes(dbId)) {
      setSelectedIds(selectedIds.filter(id => id !== dbId));
    } else {
      setSelectedIds([...selectedIds, dbId]);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#fbfbfd]">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold text-text-primary tracking-tight mb-2 whitespace-nowrap">
            Quản lý Sự kiện Toàn cầu
          </h1>
          <p className="text-text-secondary font-medium">
            Giám sát và kiểm duyệt tất cả các hoạt động trên nền tảng. <br />
            Đảm bảo chất lượng nội dung và an toàn cho cộng đồng.
          </p>
        </div>
        
        {/* Top Summary Stats */}
        <div className="flex gap-2 w-full max-w-2xl">
          <StatCard 
            title="Tổng sự kiện" 
            value={stats.totalEvents.toLocaleString()} 
            footer={
              <div className="flex items-center gap-1.5 text-green-500 font-bold text-sm">
                <span className="text-lg">↗</span> {stats.totalEventsTrend}
              </div>
            }
          />
          <StatCard 
            title="Đang diễn ra" 
            value={stats.ongoingEvents.toLocaleString()} 
            valueColor="text-primary"
            footer={
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${stats.totalEvents > 0 ? (stats.ongoingEvents * 100) / stats.totalEvents : 0}%` }}
                ></div>
              </div>
            }
          />
          <StatCard 
            title="Chờ duyệt" 
            value={stats.pendingEvents.toLocaleString()} 
            valueColor="text-orange-700"
            footer={
              <span className="inline-flex px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-tight">
                Khẩn cấp
              </span>
            }
          />
          <StatCard 
            title="Bị báo cáo" 
            value={stats.reportedEvents.toLocaleString()} 
            valueColor="text-red-600"
            footer={
              <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                <AlertCircle className="w-3.5 h-3.5 fill-current text-red-600" />
                Cần xử lý
              </div>
            }
          />
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-6 rounded-3xl border border-border-color shadow-sm flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tìm kiếm sự kiện</span>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Nhập tên, mô tả hoặc ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-border-color rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-text-primary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <FilterDropdown 
          label="Lọc theo hạng mục" 
          value={selectedCategory} 
          onChange={setSelectedCategory}
          options={["Tất cả hạng mục", "Hội thảo", "Âm nhạc", "Thể thao", "Khác"]} 
        />
        <FilterDropdown 
          label="Hạng người tổ chức" 
          value={selectedOrganizerRole} 
          onChange={setSelectedOrganizerRole}
          options={["Tất cả cấp độ", "Platinum", "Verified", "Standard"]} 
        />
        <FilterDropdown 
          label="Trạng thái báo cáo" 
          value={selectedStatus} 
          onChange={setSelectedStatus}
          options={["Tất cả trạng thái", "Đang diễn ra", "Chờ phê duyệt", "Bị đình chỉ"]} 
        />
        
        <button 
          onClick={handleApplyFilters}
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95"
        >
          <Filter className="w-4 h-4 fill-current" />
          Áp dụng lọc
        </button>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-[32px] border border-border-color shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-6 border-b border-border-color flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-black text-text-primary">Danh sách sự kiện</h3>
            <span className="text-sm font-medium text-text-secondary pl-4 border-l border-border-color">
              Đã chọn <span className="font-black text-primary">{selectedIds.length}</span> mục
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              disabled={selectedIds.length === 0}
              onClick={handleBulkApprove}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                selectedIds.length > 0 
                  ? 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Phê duyệt hàng loạt
            </button>
            <button 
              disabled={selectedIds.length === 0}
              onClick={handleBulkSuspend}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                selectedIds.length > 0 
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Ban className="w-4 h-4" />
              Đình chỉ hàng loạt
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-text-secondary">Đang tải danh sách sự kiện...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300" />
              <p className="text-lg font-black text-text-primary">Không tìm thấy sự kiện nào</p>
              <p className="text-sm font-medium text-text-secondary">Vui lòng thử lại với bộ lọc khác hoặc từ khóa khác.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-color bg-gray-50/50">
                  <th className="px-6 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded-md accent-primary" 
                      checked={events.length > 0 && selectedIds.length === events.length}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Sự kiện & ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Người tổ chức</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Trạng thái</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Tham gia</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Ngày diễn ra</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {events.map((row) => (
                  <tr key={row.dbId} className="hover:bg-gray-50/80 transition-all cursor-pointer group">
                    <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded-md accent-primary" 
                        checked={selectedIds.includes(row.dbId)}
                        onChange={() => handleToggleSelectOne(row.dbId)}
                      />
                    </td>
                    <td className="px-6 py-6 font-bold">
                      <div className="flex items-center gap-4">
                        <img src={row.image} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                        <div>
                          <p className="text-text-primary text-sm font-black tracking-tight">{row.name}</p>
                          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">{row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <img src={row.organizer.avatar} className="w-8 h-8 rounded-full border border-border-color" />
                        <div>
                          <p className="text-sm font-bold text-text-primary">{row.organizer.name}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            row.organizer.role === 'Platinum' ? 'bg-blue-100 text-blue-600' : 
                            row.organizer.role === 'Verified' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {row.organizer.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                         <span className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-tight flex items-center gap-2 shadow-sm ${row.status.color}`}>
                           <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                             row.status.text === 'Đang diễn ra' ? 'bg-green-500' : 
                             row.status.text === 'Chờ phê duyệt' ? 'bg-orange-500' : 'bg-red-500'
                           }`}></span>
                           {row.status.text}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex flex-col items-center gap-2 min-w-[100px]">
                        <span className="text-sm font-black text-text-primary tracking-tight">{row.joined.current} <span className="text-gray-300 font-medium">/ {row.joined.total}</span></span>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${row.joined.percent}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-black text-text-primary">{row.date}</p>
                        <p className="text-[11px] text-text-secondary font-medium mt-0.5">{row.time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        {row.status.text === 'Chờ phê duyệt' && (
                          <button 
                            disabled={processingIds.includes(row.dbId)}
                            onClick={() => handleApproveEvent(row.dbId, row.name)}
                            className="p-2.5 rounded-xl hover:bg-green-50 text-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Phê duyệt sự kiện"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {row.status.text !== 'Bị đình chỉ' && (
                          <button 
                            disabled={processingIds.includes(row.dbId)}
                            onClick={() => handleSuspendEvent(row.dbId, row.name)}
                            className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Đình chỉ sự kiện"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && events.length > 0 && (
          <div className="px-6 py-6 bg-gray-50/50 flex justify-between items-center">
            <p className="text-sm font-medium text-text-secondary">
              Hiển thị <span className="font-black text-text-primary">
                {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
              </span> trong số <span className="font-black text-text-primary">{pagination.totalItems.toLocaleString()}</span> sự kiện
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(1)} 
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg text-gray-300 hover:text-text-primary disabled:text-gray-200 disabled:hover:text-gray-200 transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg text-gray-300 hover:text-text-primary disabled:text-gray-200 disabled:hover:text-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - pagination.currentPage) <= 2 || p === 1 || p === pagination.totalPages)
                  .map((p, idx, arr) => {
                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                        <button 
                          onClick={() => setCurrentPage(p)}
                          className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                            pagination.currentPage === p 
                              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                              : 'hover:bg-gray-200 text-text-secondary font-bold'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg text-gray-300 hover:text-text-primary disabled:text-gray-200 disabled:hover:text-gray-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg text-gray-300 hover:text-text-primary disabled:text-gray-200 disabled:hover:text-gray-200 transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Area - AI and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        {/* AI Banner */}
        <div className="lg:col-span-2 relative group overflow-hidden bg-primary rounded-[40px] p-10 flex flex-col justify-between text-white shadow-2xl shadow-primary/30 min-h-[300px]">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-white/20 backdrop-blur-xl rounded-2xl ring-1 ring-white/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Gợi ý từ AI</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-4 leading-tight">
              Tự động phát hiện vi phạm
            </h2>
            <p className="text-white/80 text-lg font-medium leading-relaxed max-w-lg mb-10">
              Hệ thống AI đã phát hiện các sự kiện mới có các dấu hiệu vi phạm chuyên môn hoặc có nội dung hình ảnh không phù hợp. Hãy kiểm tra ngay các mục trong danh sách chờ duyệt.
            </p>
          </div>

          <div className="relative z-10">
            <button 
              onClick={() => {
                setSelectedStatus("Chờ phê duyệt");
                setSearchQuery("");
                setAppliedFilters({
                  search: "",
                  category: "Tất cả hạng mục",
                  organizerRole: "Tất cả cấp độ",
                  status: "Chờ phê duyệt"
                });
                setCurrentPage(1);
              }}
              className="bg-white text-primary px-8 py-4 rounded-2xl font-black hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group/btn"
            >
              Kiểm tra ngay
              <ChevronRight className="w-4 h-4 inline-block ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Distribution Card */}
        <div className="bg-white p-10 rounded-[40px] border border-border-color shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-xl font-black text-text-primary tracking-tight">Phân bố hạng mục</h3>
               <PieChart className="w-5 h-5 text-gray-300" />
            </div>
            
            <div className="space-y-8">
              {categories.map((cat) => (
                <div key={cat.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-text-secondary uppercase tracking-[0.15em]">{cat.name}</span>
                    <span className="text-sm font-black text-text-primary">{cat.percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${cat.color} rounded-full transition-all duration-1000 shadow-sm`} 
                      style={{ width: `${cat.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalEventsPage;
