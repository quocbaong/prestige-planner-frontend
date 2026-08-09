import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Filter, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const TransactionHistoryModal = ({ isOpen, onClose, transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('all'); // 'all', 'Thu nhập', 'Rút tiền', 'Hoàn tiền'
  
  if (!isOpen) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleExportCSV = () => {
    // Tiêu đề các cột
    const headers = ['Mã giao dịch', 'Nội dung', 'Loại', 'Thời gian', 'Số tiền'];
    
    // Chuyển đổi dữ liệu
    const csvRows = filteredTransactions.map(trx => [
      trx.id,
      trx.description,
      trx.type,
      trx.date,
      trx.amount
    ]);

    // Tạo nội dung CSV (có thêm BOM để hiển thị đúng tiếng Việt trong Excel)
    const csvContent = "\uFEFF" + [headers, ...csvRows].map(e => e.join(",")).join("\n");
    
    // Tạo Blob và tải xuống
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const fileName = `Lich_su_giao_dich_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(trx => {
    const matchesSearch = trx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === 'all' || trx.type === activeType;
    return matchesSearch && matchesType;
  });

  const filterTabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Thu nhập', label: 'Thu nhập' },
    { id: 'Rút tiền', label: 'Rút tiền' },
    { id: 'Hoàn tiền', label: 'Hoàn tiền' },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-headline">Lịch sử giao dịch</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Xem và quản lý tất cả các giao dịch tài chính của bạn</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters Area */}
        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveType(tab.id)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeType === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Xuất dữ liệu
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mô tả hoặc mã giao dịch (ví dụ: TRX-101)..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:text-white transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content - Table */}
        <div className="flex-grow overflow-y-auto p-8 pt-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-2">Giao dịch</th>
                <th className="py-4 px-2 text-center">Loại</th>
                <th className="py-4 px-2">Thời gian</th>
                <th className="py-4 px-2 text-right">Số tiền</th>
                <th className="py-4 px-2 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-5 px-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {trx.description}
                        </div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">{trx.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-2 text-center">
                    <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">{trx.type}</span>
                  </td>
                  <td className="py-5 px-2">
                    <div className="text-[13px] font-medium text-slate-600 dark:text-slate-400">{trx.date}</div>
                  </td>
                  <td className="py-5 px-2 text-right">
                    <div className={`font-bold text-sm ${trx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {trx.amount > 0 ? '+' : ''}{formatCurrency(trx.amount)}
                    </div>
                  </td>
                  <td className="py-5 px-2 text-center">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-[11px] font-bold rounded-full">
                      Thành công
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-10 h-10 text-slate-200 dark:text-slate-700" />
                      <p className="text-slate-400 font-medium text-sm">Không tìm thấy giao dịch nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Tổng cộng: {filteredTransactions.length} giao dịch
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TransactionHistoryModal;
