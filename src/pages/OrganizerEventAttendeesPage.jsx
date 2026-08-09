import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { invitationService } from '../services/invitationService';
const STATUS_CONFIG = {
  'Đã chấp nhận': { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'check_circle' },
  'Đang chờ': { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'schedule' },
  'Từ chối': { bg: 'bg-rose-50', text: 'text-rose-700', icon: 'cancel' },
};

const SendHistoryTab = ({ allAttendees }) => {
  const history = allAttendees
    .filter(a => a.method === 'Thư mời')
    .reduce((acc, curr) => {
      const dateKey = curr.date.split(' ')[0] || 'Gần đây';
      const existing = acc.find(item => item.dateKey === dateKey);
      if (existing) {
        existing.recipientCount += 1;
      } else {
        acc.push({
          id: dateKey,
          time: curr.date || 'Gần đây',
          dateKey,
          recipientCount: 1,
          method: 'Email',
          status: 'Hoàn thành',
          type: 'Mẫu thư mời chính thức'
        });
      }
      return acc;
    }, []);

  return (
    <div className="flex flex-col">
      <div className="p-7 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Lịch sử gửi thông báo</h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Theo dõi các đợt gửi thư mời và thông báo</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-100/50 border-b-2 border-slate-100">
              <th className="px-7 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">Thời gian gửi</th>
              <th className="px-7 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">Loại thông báo</th>
              <th className="px-7 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center">Số lượng</th>
              <th className="px-7 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center">Trạng thái</th>
              <th className="px-7 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {history.length > 0 ? history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-all">
                <td className="px-7 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900">{item.time.split(' ')[0]}</span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{item.time.split(' ')[1] || ''}</span>
                  </div>
                </td>
                <td className="px-7 py-5 text-sm font-black text-slate-800">{item.type}</td>
                <td className="px-7 py-5 text-center text-xs font-black text-slate-600">{item.recipientCount} khách</td>
                <td className="px-7 py-5 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{item.status}</span>
                </td>
                <td className="px-7 py-5 text-right"><button className="p-2 text-slate-400 hover:text-indigo-600"><span className="material-symbols-outlined">visibility</span></button></td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-7 py-10 text-center text-sm text-slate-400 font-bold">Chưa có lịch sử gửi thông báo nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EventSettingsTab = ({ event, setEvent, showToast }) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    name: event.name,
    date: event.date,
    location: event.location,
    description: event.description || '',
    isPrivate: false,
    autoAccept: true,
    maxAttendees: event.maxAttendees || 500,
    allowWaitlist: true,
  });

  useEffect(() => {
    if (event && event.name !== 'Đang tải...') {
      setSettings(prev => ({
        ...prev,
        name: event.name,
        date: event.date,
        location: event.location,
        description: event.description || '',
        maxAttendees: event.maxAttendees || 500,
      }));
    }
  }, [event]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await eventService.updateEvent(event.id, {
        title: settings.name,
        venue: settings.location,
        description: settings.description,
        maxAttendees: settings.maxAttendees
      });
      setEvent(prev => ({
        ...prev,
        name: settings.name,
        location: settings.location,
        description: settings.description,
        maxAttendees: settings.maxAttendees
      }));
      showToast('Đã lưu cài đặt sự kiện thành công!');
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra khi lưu cài đặt', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      const res = await eventService.toggleSales(event.id);
      const updatedEvent = res.data;
      setEvent(prev => ({
        ...prev,
        isSalesActive: updatedEvent.isSalesActive
      }));
      showToast(
        updatedEvent.isSalesActive
          ? `Đã mở bán lại vé cho sự kiện "${event.name}".`
          : `Sự kiện "${event.name}" đã được tạm ngưng bán vé.`
      );
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra khi thực hiện hành động này.', 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl relative">
      {/* ── Section: Thông tin chung ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Thông tin cơ bản</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cập nhật các thông tin hiển thị chính của sự kiện</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Tên sự kiện</label>
            <input type="text" value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Thời gian</label>
            <input type="text" value={settings.date} onChange={e => setSettings({ ...settings, date: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Địa điểm</label>
            <input type="text" value={settings.location} onChange={e => setSettings({ ...settings, location: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1">Mô tả sự kiện</label>
            <textarea rows={4} value={settings.description} onChange={e => setSettings({ ...settings, description: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none resize-none" />
          </div>
        </div>
      </section>

      {/* ── Section: Cài đặt quyền riêng tư & Đăng ký ── */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined">settings_suggest</span>
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Quyền riêng tư & Đăng ký</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cấu hình cách thức khách mời tham gia sự kiện</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-[2rem] border border-slate-100">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div><p className="text-sm font-black text-slate-900">Sự kiện riêng tư</p><p className="text-xs text-slate-500 font-bold">Chỉ những người có thư mời mới có thể xem và đăng ký</p></div>
            </div>
            <button onClick={() => setSettings({ ...settings, isPrivate: !settings.isPrivate })} className={`w-14 h-8 rounded-full p-1 transition-all ${settings.isPrivate ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${settings.isPrivate ? 'translate-x-6' : 'translate-x-0'}`} /></button>
          </div>

          <div className="flex items-center justify-between p-5 bg-slate-50/80 rounded-[2rem] border border-slate-100">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                <span className="material-symbols-outlined">how_to_reg</span>
              </div>
              <div><p className="text-sm font-black text-slate-900">Tự động chấp nhận</p><p className="text-xs text-slate-500 font-bold">Khách mời đăng ký sẽ được duyệt ngay lập tức</p></div>
            </div>
            <button onClick={() => setSettings({ ...settings, autoAccept: !settings.autoAccept })} className={`w-14 h-8 rounded-full p-1 transition-all ${settings.autoAccept ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all transform ${settings.autoAccept ? 'translate-x-6' : 'translate-x-0'}`} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50/80 rounded-[2rem] border border-slate-100 space-y-3">
              <p className="text-sm font-black text-slate-900">Giới hạn khách mời</p>
              <input type="number" value={settings.maxAttendees} onChange={e => setSettings({ ...settings, maxAttendees: parseInt(e.target.value) })} className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div className="p-5 bg-slate-50/80 rounded-[2rem] border border-slate-100 flex items-center justify-between">
              <div><p className="text-sm font-black text-slate-900">Danh sách chờ</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Kích hoạt khi hết chỗ</p></div>
              <button onClick={() => setSettings({ ...settings, allowWaitlist: !settings.allowWaitlist })} className={`w-12 h-6 rounded-full p-1 transition-all ${settings.allowWaitlist ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all transform ${settings.allowWaitlist ? 'translate-x-6' : 'translate-x-0'}`} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Danger Zone ── */}
      {event.statusRaw === 'PUBLISHED' && (
        <section className="pt-8 mt-4 border-t border-slate-100">
          <div className={`p-8 rounded-[3rem] border-2 border-dashed space-y-4 ${event.isSalesActive ? 'bg-amber-50/50 border-amber-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined ${event.isSalesActive ? 'text-amber-600' : 'text-emerald-600'}`}>
                {event.isSalesActive ? 'pause_circle' : 'play_circle'}
              </span>
              <h3 className={`text-base font-black uppercase tracking-widest ${event.isSalesActive ? 'text-amber-900' : 'text-emerald-900'}`}>
                {event.isSalesActive ? 'Tạm ngưng bán vé' : 'Mở bán vé lại'}
              </h3>
            </div>
            <p className={`text-sm font-bold ${event.isSalesActive ? 'text-amber-700' : 'text-emerald-700'}`}>
              {event.isSalesActive
                ? 'Hành động này sẽ tạm dừng việc bán vé cho sự kiện. Khách mời sẽ không thể đăng ký mới cho đến khi bạn kích hoạt lại.'
                : 'Hành động này sẽ mở bán vé lại cho sự kiện. Khách mời sẽ có thể tiếp tục đăng ký tham gia.'}
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className={`px-6 py-3 text-white text-sm font-black rounded-2xl transition-all shadow-lg ${
                event.isSalesActive
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
              }`}
            >
              {event.isSalesActive ? 'Tạm ngưng bán vé sự kiện này' : 'Mở bán vé lại ngay'}
            </button>
          </div>
        </section>
      )}

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} disabled={isSaving} className="px-10 py-4 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-70 flex items-center gap-3">
          {isSaving && (<svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>)}
          {isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl z-10 text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${event.isSalesActive ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <span className="material-symbols-outlined text-4xl">
                  {event.isSalesActive ? 'pause_circle' : 'play_circle'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-3">
                {event.isSalesActive ? 'Tạm ngưng bán vé?' : 'Mở bán vé lại?'}
              </h2>
              <p className="text-sm text-slate-500 font-bold mb-8 leading-relaxed">
                {event.isSalesActive
                  ? `Bạn có chắc chắn muốn chuyển sự kiện "${event.name}" sang trạng thái tạm ngưng bán vé? Bạn có thể mở bán lại bất kỳ lúc nào.`
                  : `Bạn có chắc chắn muốn mở bán vé lại cho sự kiện "${event.name}"? Khách mời sẽ có thể tiếp tục đăng ký tham gia.`}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsDeleteModalOpen(false)} className="py-4 bg-slate-100 text-slate-600 font-black text-sm rounded-2xl hover:bg-slate-200 transition-all">Quay lại</button>
                <button
                  onClick={handleConfirmCancel}
                  className={`py-4 text-white font-black text-sm rounded-2xl transition-all shadow-lg ${
                    event.isSalesActive
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                  }`}
                >
                  {event.isSalesActive ? 'Xác nhận tạm ngưng' : 'Xác nhận mở bán'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DEFAULT_TEMPLATE = {
  subject: 'Thư mời tham dự sự kiện',
  greeting: 'Kính gửi {{TEN_KHACH}}',
  body: `Chúng tôi trân trọng kính mời Quý vị tham dự sự kiện {{TEN_SU_KIEN}} sẽ được tổ chức vào ngày {{NGAY_TO_CHUC}} tại {{DIA_DIEM}}.

Đây là cơ hội tuyệt vời để giao lưu, học hỏi và kết nối cùng các chuyên gia hàng đầu trong ngành. Chương trình hứa hẹn mang đến nhiều trải nghiệm giá trị và đáng nhớ.

Chúng tôi rất mong nhận được sự tham gia của Quý vị.`,
  ctaText: 'Xác nhận tham dự',
  signature: 'Trân trọng,\nBan Tổ chức Sự kiện',
  primaryColor: '#4f46e5',
};

const EmailTemplateTab = ({ event, allAttendees, showToast }) => {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [isSending, setIsSending] = useState(false);
  const [activeField, setActiveField] = useState('subject');

  const resolved = (text) => text
    ?.replace(/\{\{TEN_SU_KIEN\}\}/g, event?.name || '')
    ?.replace(/\{\{NGAY_TO_CHUC\}\}/g, event?.date || '')
    ?.replace(/\{\{DIA_DIEM\}\}/g, event?.location || '')
    ?.replace(/\{\{TEN_KHACH\}\}/g, 'Nguyễn Văn A');

  const handleSendAll = async () => {
    const validEmails = allAttendees.map(a => a.email).filter(e => e && e !== '--');
    if (validEmails.length === 0) {
      showToast('Không có email khách mời hợp lệ để gửi', 'error');
      return;
    }
    setIsSending(true);
    try {
      await invitationService.createInvitations(event.id, {
        emails: validEmails
      });
      showToast(`Đã gửi thư mời đến ${validEmails.length} khách mời thành công!`);
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra khi gửi email', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const fields = [
    { key: 'subject', label: 'Tiêu đề email', icon: 'subject', placeholder: 'Nhập tiêu đề...' },
    { key: 'greeting', label: 'Lời chào', icon: 'waving_hand', placeholder: 'Nhập lời chào...' },
    { key: 'body', label: 'Nội dung chính', icon: 'article', placeholder: 'Nhập nội dung email...', multiline: true },
    { key: 'ctaText', label: 'Nút xác nhận', icon: 'ads_click', placeholder: 'Văn bản nút bấm...' },
    { key: 'signature', label: 'Chữ ký', icon: 'draw', placeholder: 'Nhập chữ ký...', multiline: true },
  ];

  return (
    <div className="flex h-[700px]">
      {/* ── Left: Editor Panel ── */}
      <div className="w-[420px] shrink-0 border-r border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-black text-slate-900">Soạn mẫu email</h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Chỉnh sửa và xem trước trực tiếp</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {fields.map(f => (
            <div key={f.key} className={`space-y-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${activeField === f.key ? 'border-indigo-200 bg-indigo-50/30' : 'border-transparent hover:border-slate-100 hover:bg-slate-50'}`}
              onClick={() => setActiveField(f.key)}
            >
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm text-indigo-400">{f.icon}</span>
                {f.label}
              </label>
              {f.multiline ? (
                <textarea rows={f.key === 'body' ? 6 : 3} value={template[f.key]} onChange={e => setTemplate({ ...template, [f.key]: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none resize-none leading-relaxed" placeholder={f.placeholder} />
              ) : (
                <input type="text" value={template[f.key]} onChange={e => setTemplate({ ...template, [f.key]: e.target.value })} className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none" placeholder={f.placeholder} />
              )}
            </div>
          ))}

          <div className="p-4 rounded-2xl border-2 border-transparent hover:border-slate-100 hover:bg-slate-50 space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-600 uppercase tracking-widest"><span className="material-symbols-outlined text-sm text-indigo-400">palette</span>Màu chủ đạo</label>
            <div className="flex items-center gap-3">
              {['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(c => (
                <button key={c} onClick={() => setTemplate({ ...template, primaryColor: c })} className={`w-8 h-8 rounded-xl border-2 transition-all hover:scale-110 ${template.primaryColor === c ? 'border-slate-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
              <input type="color" value={template.primaryColor} onChange={e => setTemplate({ ...template, primaryColor: e.target.value })} className="w-8 h-8 rounded-xl overflow-hidden cursor-pointer border-2 border-slate-200" title="Màu tùy chỉnh" />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-2xl"><span className="material-symbols-outlined text-sm text-indigo-500">group</span><p className="text-xs font-black text-indigo-700">{allAttendees.length} khách mời sẽ nhận email này</p></div>
          <button onClick={handleSendAll} disabled={isSending} className="w-full flex items-center justify-center gap-2.5 py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70">
            {isSending ? (<><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Đang gửi email...</>) : (<><span className="material-symbols-outlined text-xl">send</span>Gửi đến tất cả khách mời</>)}
          </button>
        </div>
      </div>

      {/* ── Right: Live Preview ── */}
      <div className="flex-1 bg-slate-100/50 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Xem trước email</p><p className="text-xs text-slate-500 font-bold mt-0.5">Hiển thị như trên hộp thư của khách mời</p></div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Live Preview</span>
        </div>
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-xl mx-auto">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tiêu đề</p><p className="text-sm font-black text-slate-900">{resolved(template.subject) || '(Chưa có tiêu đề)'}</p></div>
          <div className="p-0">
            <div className="h-28 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${template.primaryColor}22, ${template.primaryColor}44)` }}>
              <div className="text-center"><div className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: template.primaryColor }}><span className="material-symbols-outlined text-white text-2xl">event</span></div><p className="text-xs font-black uppercase tracking-widest" style={{ color: template.primaryColor }}>Thư mời chính thức</p></div>
            </div>
            <div className="px-8 py-6 space-y-5">
              <p className="text-base font-black text-slate-900">{resolved(template.greeting)}</p>
              <div className="text-sm text-slate-600 font-bold leading-relaxed whitespace-pre-line">{resolved(template.body)}</div>
              <div className="text-center py-4"><span className="inline-block px-8 py-3.5 text-white text-sm font-black rounded-2xl shadow-xl" style={{ backgroundColor: template.primaryColor }}>{template.ctaText || 'Xác nhận tham dự'}</span></div>
              <div className="h-px bg-slate-100" /><p className="text-sm text-slate-500 font-bold whitespace-pre-line">{resolved(template.signature)}</p>
              <div className="p-4 bg-slate-50 rounded-2xl text-center"><p className="text-[10px] text-slate-400 font-bold">Bạn nhận được email này vì đã đăng ký tham dự sự kiện.</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const getPaginationRange = (currentPage, totalPages) => {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

const OrganizerEventAttendeesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [event, setEvent] = useState({ id, name: 'Đang tải...', date: '--', location: '--', status: 'Unknown' });
  const [allAttendees, setAllAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [eventRes, regRes, invRes] = await Promise.all([
          eventService.getEvent(id),
          registrationService.getRegistrations(id),
          invitationService.getInvitations(id).catch(() => ({ data: [] }))
        ]);

        const ev = eventRes.data;
        let eventStatus = 'Live';
        if (ev.status === 'DRAFT') eventStatus = 'Draft';
        else if (ev.status === 'CANCELLED' || ev.status === 'COMPLETED') eventStatus = 'Completed';

        setEvent({
          id: ev.id,
          name: ev.title || 'Sự kiện không tên',
          date: ev.startDate ? new Date(ev.startDate).toLocaleString('vi-VN') : '--',
          location: ev.venue || '--',
          status: eventStatus,
          statusRaw: ev.status,
          isSalesActive: ev.isSalesActive,
          description: ev.description || '',
          maxAttendees: ev.maxAttendees || 500
        });

        // Map registrations
        const mappedRegs = regRes.data.map(r => {
          let uiStatus = 'Đang chờ';
          let color = 'orange';
          if (r.status === 'CONFIRMED') {
            uiStatus = 'Đã chấp nhận';
            color = 'emerald';
          } else if (r.status === 'CANCELLED') {
            uiStatus = 'Từ chối';
            color = 'rose';
          }

          return {
            id: r.id,
            name: r.attendeeName || 'Khách mời ẩn danh',
            email: r.attendeeEmail || '--',
            company: '--',
            role: 'Người tham dự',
            method: 'Đăng ký',
            date: r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '--',
            status: uiStatus,
            statusColor: color,
            initials: (r.attendeeName || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          };
        });

        // Map invitations
        const mappedInvs = (invRes.data || []).map(inv => {
          let uiStatus = 'Đang chờ';
          let color = 'orange';
          if (inv.status === 'ACCEPTED') {
            uiStatus = 'Đã chấp nhận';
            color = 'emerald';
          } else if (inv.status === 'DECLINED') {
            uiStatus = 'Từ chối';
            color = 'rose';
          }
          
          return {
            id: inv.id,
            name: inv.email ? inv.email.split('@')[0] : 'Khách mời',
            email: inv.email || '--',
            company: '--',
            role: 'Khách mời',
            method: 'Thư mời',
            date: inv.createdAt ? new Date(inv.createdAt).toLocaleString('vi-VN') : '--',
            status: uiStatus,
            statusColor: color,
            initials: inv.email ? inv.email[0].toUpperCase() : '??'
          };
        });

        let currentEvAttendees = [...mappedRegs, ...mappedInvs];
        const expectedCount = ev.currentAttendees || 0;
        if (currentEvAttendees.length < expectedCount) {
          const diff = expectedCount - currentEvAttendees.length;
          for (let i = 0; i < diff; i++) {
            const simId = `sim-${ev.id}-${i}`;
            currentEvAttendees.push({
              id: simId,
              name: `Khách tham dự #${i + 101}`,
              email: `khachhang${i + 101}@gmail.com`,
              company: '--',
              role: 'Người tham dự',
              method: 'Đăng ký',
              date: ev.startDate ? new Date(ev.startDate).toLocaleString('vi-VN') : '--',
              status: 'Đã chấp nhận',
              statusColor: 'emerald',
              initials: 'KT'
            });
          }
        }
        setAllAttendees(currentEvAttendees);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu khách mời:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const [activeTab, setActiveTab] = useState('Danh sách khách mời');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [attendeeToDelete, setAttendeeToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [newAttendee, setNewAttendee] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    method: 'Email'
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddAttendee = async (e) => {
    e.preventDefault();
    if (!newAttendee.email) {
      showToast('Vui lòng nhập email khách mời', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Gọi API thực tế
      const res = await invitationService.createInvitations(id, {
        emails: [newAttendee.email]
      });
      
      const newInv = res.data[0] || {};
      
      const attendee = {
        id: newInv.id || Date.now(),
        name: newAttendee.name || newAttendee.email.split('@')[0],
        email: newAttendee.email,
        company: newAttendee.company || '--',
        role: newAttendee.role || 'Khách mời',
        method: newAttendee.method || 'Thư mời',
        date: new Date().toLocaleString('vi-VN'),
        status: 'Đang chờ',
        statusColor: 'orange',
        initials: (newAttendee.name || newAttendee.email).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
      };

      setAllAttendees(prev => [attendee, ...prev]);
      setIsAddModalOpen(false);
      setNewAttendee({ name: '', email: '', company: '', role: '', method: 'Email' });
      showToast(`Đã gửi thư mời thành công đến ${attendee.email}!`);
    } catch (error) {
      showToast(error.response?.data?.error || 'Có lỗi xảy ra khi tạo thư mời', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = allAttendees.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = [
    { label: 'Tổng lời mời', value: allAttendees.length, icon: 'mail', color: 'indigo' },
    { label: 'Đã chấp nhận', value: allAttendees.filter(a => a.status === 'Đã chấp nhận').length, icon: 'check_circle', color: 'emerald' },
    { label: 'Đang chờ', value: allAttendees.filter(a => a.status === 'Đang chờ').length, icon: 'schedule', color: 'orange' },
    { label: 'Từ chối', value: allAttendees.filter(a => a.status === 'Từ chối').length, icon: 'cancel', color: 'rose' },
  ];

  const handleExport = async () => {
    setIsExporting(true);

    const headers = ['Họ tên', 'Email', 'Công ty', 'Vai trò', 'Phương thức', 'Trạng thái'];
    const csvContent = [
      headers.join(','),
      ...filtered.map(a => [
        `"${a.name}"`,
        `"${a.email}"`,
        `"${a.company}"`,
        `"${a.role}"`,
        `"${a.method}"`,
        `"${a.status}"`
      ].join(','))
    ].join('\n');

    // Dùng File System Access API để biết chính xác user đã lưu hay hủy
    if (window.showSaveFilePicker) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `danh_sach_khach_moi_${id}.csv`,
          types: [{
            description: 'CSV File',
            accept: { 'text/csv': ['.csv'] },
          }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
        await writable.close();
        // Chỉ hiện thông báo khi user đã lưu thành công
        showToast('Dữ liệu đã được xuất thành công!');
      } catch (err) {
        if (err.name === 'AbortError') {
          // User bấm Hủy — không làm gì cả
        } else {
          showToast('Có lỗi xảy ra khi xuất file!', 'error');
        }
      }
    } else {
      // Fallback cho trình duyệt không hỗ trợ (Firefox, Safari cũ...)
      // Không thể phân biệt Lưu / Hủy, chỉ tải ngay
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh_sach_khach_moi_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Dữ liệu đã được tải xuống!');
    }

    setIsExporting(false);
  };

  const handleImportFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').filter(row => row.trim() !== '');

      // Bỏ qua dòng header
      const dataRows = rows.slice(1);

      const importedAttendees = dataRows.map((row, index) => {
        const columns = row.split(',');
        const status = columns[5]?.trim() || 'Đang chờ';

        return {
          id: Date.now() + index,
          name: columns[0]?.trim() || 'Không rõ',
          email: columns[1]?.trim() || '--',
          company: columns[2]?.trim() || '--',
          role: columns[3]?.trim() || '--',
          method: columns[4]?.trim() || 'Email',
          date: new Date().toLocaleString('vi-VN'),
          status: status,
          statusColor: status === 'Đã chấp nhận' ? 'emerald' : status === 'Từ chối' ? 'rose' : 'orange',
          initials: (columns[0]?.trim() || '??').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        };
      });

      setAllAttendees(prev => [...importedAttendees, ...prev]);
      setCurrentPage(1);
      showToast(`Đã nhập thành công ${importedAttendees.length} khách mời từ file!`);
    };
    reader.readAsText(file);
  };

  const handleUpdateAttendee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setAllAttendees(prev => prev.map(a => a.id === selectedAttendee.id ? {
      ...selectedAttendee,
      initials: selectedAttendee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
    } : a));

    setIsSubmitting(false);
    setIsEditModalOpen(false);
    showToast(`Đã cập nhật thông tin ${selectedAttendee.name} thành công!`);
  };

  const statusBadge = {
    'Live': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Draft': 'bg-slate-50 text-slate-600 border-slate-100',
    'Completed': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest flex-wrap">
        <button onClick={() => navigate('/organizer/events')} className="hover:text-indigo-700 transition-colors">Danh sách sự kiện</button>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-slate-600">{event.name}</span>
        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
        <span className="text-indigo-600">Khách mời</span>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
              Quản lý Khách mời
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadge[event.status] || 'bg-slate-50 text-slate-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${event.status === 'Live' ? 'bg-emerald-500 animate-pulse' : event.status === 'Completed' ? 'bg-indigo-500' : 'bg-slate-400'}`} />
              {event.status}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{event.name}</h1>
          <div className="flex items-center gap-5 text-sm text-slate-500 font-bold flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-slate-400">calendar_month</span>
              {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-slate-400">location_on</span>
              {event.location}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <input
            type="file"
            id="attendee-import"
            className="hidden"
            accept=".csv, .xlsx, .xls"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleImportFile(e.target.files[0]);
                e.target.value = ''; // Reset để có thể chọn lại cùng 1 file
              }
            }}
          />
          <button
            onClick={() => document.getElementById('attendee-import').click()}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-full font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 hover:shadow-emerald-200 hover:translate-y-[-2px] active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">upload_file</span>
            Nhập danh sách
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:translate-y-[-2px] active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Thêm khách mời
          </button>
        </div>
      </div>

      {/* ── Add Attendee Modal ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-10"
            >
              {/* Header section with Close Button */}
              <div className="p-8 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Thêm khách mời mới</h3>
                  <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.1em] mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Sự kiện: {event.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                >
                  <span className="material-symbols-outlined font-black">close</span>
                </button>
              </div>

              <form onSubmit={handleAddAttendee} className="p-8 pt-2 space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-600 ml-1">
                    <span className="material-symbols-outlined text-sm text-indigo-600">person</span>
                    Họ và tên
                  </label>
                  <input
                    required
                    type="text"
                    value={newAttendee.name}
                    onChange={e => setNewAttendee({ ...newAttendee, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-900 placeholder:text-slate-300"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-600 ml-1">
                    <span className="material-symbols-outlined text-sm text-indigo-600">mail</span>
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    value={newAttendee.email}
                    onChange={e => setNewAttendee({ ...newAttendee, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-900 placeholder:text-slate-300"
                    placeholder="example@gmail.com"
                  />
                </div>

                {/* Company & Role Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-600 ml-1">
                      <span className="material-symbols-outlined text-sm text-indigo-600">business</span>
                      Công ty
                    </label>
                    <input
                      type="text"
                      value={newAttendee.company}
                      onChange={e => setNewAttendee({ ...newAttendee, company: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-900 placeholder:text-slate-300"
                      placeholder="Tech Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-600 ml-1">
                      <span className="material-symbols-outlined text-sm text-indigo-600">badge</span>
                      Vai trò
                    </label>
                    <input
                      type="text"
                      value={newAttendee.role}
                      onChange={e => setNewAttendee({ ...newAttendee, role: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-900 placeholder:text-slate-300"
                      placeholder="CTO"
                    />
                  </div>
                </div>

                {/* Method Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-600 ml-1">
                    <span className="material-symbols-outlined text-sm text-indigo-600">send</span>
                    Phương thức gửi lời mời
                  </label>
                  <div className="relative">
                    <select
                      value={newAttendee.method}
                      onChange={e => setNewAttendee({ ...newAttendee, method: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-black text-slate-900 appearance-none cursor-pointer"
                    >
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="Link">Link trực tiếp</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-8 py-4 rounded-2xl font-black text-slate-600 bg-slate-50 border-2 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-[1.5] flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-[0_10px_20px_rgba(79,70,229,0.2)] hover:shadow-[0_10px_20px_rgba(79,70,229,0.4)] hover:translate-y-[-2px] active:scale-95 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Xác nhận thêm
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100/80 transition-all group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
              </div>
              <p className="text-[14px] font-black uppercase tracking-widest text-slate-600 leading-tight">{card.label}</p>
            </div>
            <div className="flex items-baseline gap-2 ml-1">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
              <p className="text-xs font-bold text-slate-400">Khách</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Attendees Table ── */}
      <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/80 overflow-hidden">
        {/* Tabs Navigation */}
        <div className="px-7 pt-4 flex items-center gap-8 border-b border-slate-100">
          {['Danh sách khách mời', 'Mẫu email mời', 'Lịch sử gửi', 'Cài đặt sự kiện'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-black transition-all relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Danh sách khách mời Tab Content ── */}
        {activeTab === 'Danh sách khách mời' && (
          <>
            {/* Table toolbar */}
            <div className="p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Danh sách khách mời</h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{filtered.length} khách mời trong sự kiện này</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-72 group">
                  <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    placeholder="Tìm tên hoặc email..."
                    className="w-full bg-white border-2 border-slate-300 rounded-full py-3 pl-11 pr-4 text-sm font-black focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none placeholder:text-slate-400 text-slate-900"
                  />
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-lg font-black">search</span>
                </div>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className={`flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-black hover:bg-emerald-100 transition-all border-2 border-emerald-200 shadow-sm shadow-emerald-50 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xuất...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">download</span>
                      Xuất
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Mẫu email mời Tab Content ── */}
        {activeTab === 'Mẫu email mời' && (
          <EmailTemplateTab event={event} allAttendees={allAttendees} showToast={showToast} />
        )}

        {/* ── Lịch sử gửi Tab Content ── */}
        {activeTab === 'Lịch sử gửi' && (
          <SendHistoryTab allAttendees={allAttendees} />
        )}

        {/* ── Cài đặt sự kiện Tab Content ── */}
        {activeTab === 'Cài đặt sự kiện' && (
          <EventSettingsTab event={event} setEvent={setEvent} showToast={showToast} />
        )}

        {/* Table */}
        {activeTab === 'Danh sách khách mời' && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100/50 border-b-2 border-slate-100">
                    <th className="px-7 py-5 text-[12px] font-black text-slate-900 uppercase tracking-widest">Khách mời</th>
                    <th className="px-7 py-5 text-[12px] font-black text-slate-900 uppercase tracking-widest">Công ty / Vai trò</th>
                    <th className="px-7 py-5 text-[12px] font-black text-slate-900 uppercase tracking-widest text-center">Phương thức</th>
                    <th className="px-7 py-5 text-[12px] font-black text-slate-900 uppercase tracking-widest text-center">Ngày gửi</th>
                    <th className="px-7 py-5 text-[12px] font-black text-slate-900 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="px-7 py-5 text-[12px] font-black text-slate-900 uppercase tracking-widest text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginated.length > 0 ? (
                    <>
                      {paginated.map(att => {
                        const sc = STATUS_CONFIG[att.status] || STATUS_CONFIG['Đang chờ'];
                        return (
                          <tr key={att.id} className="h-[84px] hover:bg-slate-50/60 transition-all group">
                            <td className="px-7 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-sm border border-indigo-100 shrink-0 group-hover:scale-105 transition-transform duration-300">
                                  {att.initials}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900">{att.name}</p>
                                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">{att.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-7 py-5">
                              <p className="text-sm font-bold text-slate-700">{att.company}</p>
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{att.role}</p>
                            </td>
                            <td className="px-7 py-5 text-center">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="material-symbols-outlined text-slate-400 text-sm">
                                  {att.method === 'Email' ? 'alternate_email' : att.method === 'SMS' ? 'sms' : 'link'}
                                </span>
                                <span className="text-xs font-black text-slate-600">{att.method}</span>
                              </div>
                            </td>
                            <td className="px-7 py-5 text-center">
                              <span className="text-xs text-slate-500 font-bold tabular-nums">{att.date}</span>
                            </td>
                            <td className="px-7 py-5 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${sc.bg} ${sc.text} text-[10px] font-black rounded-full uppercase tracking-widest`}>
                                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{sc.icon}</span>
                                {att.status}
                              </span>
                            </td>
                            <td className="px-7 py-5 text-center relative">
                              <div className="flex justify-center items-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === att.id ? null : att.id);
                                  }}
                                  className={`p-2 transition-all rounded-xl ${openMenuId === att.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                                >
                                  <span className="material-symbols-outlined text-xl">more_vert</span>
                                </button>

                                <AnimatePresence>
                                  {openMenuId === att.id && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setOpenMenuId(null)}
                                      />
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10, x: 0 }}
                                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-7 top-[70%] mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 overflow-hidden"
                                      >
                                        <button
                                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            setSelectedAttendee(att);
                                            setIsDetailModalOpen(true);
                                          }}
                                        >
                                          <span className="material-symbols-outlined text-lg text-slate-400">visibility</span>
                                          Xem chi tiết
                                        </button>
                                        <button
                                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            setSelectedAttendee(att);
                                            setIsEditModalOpen(true);
                                          }}
                                        >
                                          <span className="material-symbols-outlined text-lg text-slate-400">edit_square</span>
                                          Chỉnh sửa
                                        </button>
                                        <button
                                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            showToast(`Đã gửi lại lời mời cho ${att.name}`, 'success');
                                          }}
                                        >
                                          <span className="material-symbols-outlined text-lg text-slate-400">forward_to_inbox</span>
                                          Gửi lại lời mời
                                        </button>
                                        <div className="h-px bg-slate-50 my-1 mx-2" />
                                        <button
                                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                                          onClick={() => {
                                            setOpenMenuId(null);
                                            setAttendeeToDelete(att);
                                            setIsDeleteModalOpen(true);
                                          }}
                                        >
                                          <span className="material-symbols-outlined text-lg">delete</span>
                                          Xóa khách mời
                                        </button>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Hàng trống để cố định kích thước table */}
                      {paginated.length < itemsPerPage && (
                        Array.from({ length: itemsPerPage - paginated.length }).map((_, idx) => (
                          <tr key={`empty-${idx}`} className="h-[84px]">
                            <td colSpan="6" className="px-7 py-5"></td>
                          </tr>
                        ))
                      )}
                    </>
                  ) : (
                    <tr>
                      <td colSpan="6" className="h-[840px] px-7 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                          <span className="material-symbols-outlined text-5xl">group_off</span>
                          <p className="text-sm font-black uppercase tracking-widest">Không tìm thấy khách mời</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-7 py-5 flex justify-between items-center border-t border-slate-100 bg-slate-50/30">
              <p className="text-xs text-slate-400 font-black uppercase tracking-wider">
                Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}–{Math.min(currentPage * itemsPerPage, filtered.length)} trong {filtered.length} khách mời
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                {getPaginationRange(currentPage, totalPages).map((p, i) => (
                  p === '...' ? (
                    <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 font-bold text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl font-black text-sm transition-all ${currentPage === p
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'text-slate-400 hover:bg-slate-100'
                        }`}
                    >
                      {p}
                    </button>
                  )
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <AnimatePresence>
        {isDetailModalOpen && selectedAttendee && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden z-10 border border-white/20"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 blur-[100px] -ml-32 -mb-32" />

              <div className="p-10 flex justify-between items-start relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center text-2xl font-black shadow-2xl shadow-indigo-200 border-4 border-white">
                    {selectedAttendee.initials}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chi tiết khách mời</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-md">Mã ID: #{selectedAttendee.id}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Ngày đăng ký: {selectedAttendee.date?.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 shadow-sm group"
                >
                  <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
                </button>
              </div>

              <div className="px-10 pb-10 grid grid-cols-2 gap-4 relative z-10">
                {[
                  { label: 'Họ và tên', value: selectedAttendee.name, icon: 'person', color: 'indigo' },
                  { label: 'Email', value: selectedAttendee.email, icon: 'alternate_email', color: 'sky' },
                  { label: 'Công ty', value: selectedAttendee.company, icon: 'business', color: 'amber' },
                  { label: 'Vai trò', value: selectedAttendee.role, icon: 'badge', color: 'emerald' },
                  { label: 'Phương thức', value: selectedAttendee.method, icon: selectedAttendee.method === 'Email' ? 'alternate_email' : selectedAttendee.method === 'SMS' ? 'sms' : 'link', color: 'violet' },
                  {
                    label: 'Trạng thái',
                    value: selectedAttendee.status,
                    icon: STATUS_CONFIG[selectedAttendee.status]?.icon || 'schedule',
                    color: STATUS_CONFIG[selectedAttendee.status]?.bg?.split('-')[1] || 'orange',
                    isBadge: true
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-5 bg-slate-50/50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      </div>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.12em]">{item.label}</p>
                    </div>
                    {item.isBadge ? (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[item.value]?.bg} ${STATUS_CONFIG[item.value]?.text}`}>
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                        {item.value}
                      </span>
                    ) : (
                      <p className="text-[15px] font-black text-slate-900 break-words line-clamp-1">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 relative z-10">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-8 py-4 bg-white text-slate-600 font-black text-sm rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 shadow-sm"
                >
                  Đóng cửa sổ
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="px-8 py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 transition-all shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)] flex items-center gap-2 group"
                >
                  <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">edit</span>
                  Chỉnh sửa ngay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && selectedAttendee && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden z-10 border border-white/20"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/20">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-indigo-100 flex items-center justify-center text-indigo-600">
                    <span className="material-symbols-outlined text-3xl font-bold">edit_note</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Chỉnh sửa khách mời</h2>
                    <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-2">Cập nhật thông tin chi tiết hệ thống</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 shadow-sm group"
                >
                  <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateAttendee}>
                <div className="p-10 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1 block">Họ và tên khách mời</label>
                      <div className="relative group">
                        <input
                          required
                          type="text"
                          value={selectedAttendee.name}
                          onChange={e => setSelectedAttendee({ ...selectedAttendee, name: e.target.value })}
                          className="w-full bg-white border-2 border-slate-300 rounded-[1.5rem] py-4 pl-12 pr-4 text-[15px] font-black text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none shadow-sm"
                          placeholder="Ví dụ: Nguyễn Văn A"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors">person</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1 block">Email liên hệ</label>
                      <div className="relative group">
                        <input
                          required
                          type="email"
                          value={selectedAttendee.email}
                          onChange={e => setSelectedAttendee({ ...selectedAttendee, email: e.target.value })}
                          className="w-full bg-white border-2 border-slate-300 rounded-[1.5rem] py-4 pl-12 pr-4 text-[15px] font-black text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none shadow-sm"
                          placeholder="abc@example.com"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors">alternate_email</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1 block">Công ty / Tổ chức</label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={selectedAttendee.company}
                          onChange={e => setSelectedAttendee({ ...selectedAttendee, company: e.target.value })}
                          className="w-full bg-white border-2 border-slate-300 rounded-[1.5rem] py-4 pl-12 pr-4 text-[15px] font-black text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none shadow-sm"
                          placeholder="Tên công ty"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors">business</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1 block">Vai trò / Chức danh</label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={selectedAttendee.role}
                          onChange={e => setSelectedAttendee({ ...selectedAttendee, role: e.target.value })}
                          className="w-full bg-white border-2 border-slate-300 rounded-[1.5rem] py-4 pl-12 pr-4 text-[15px] font-black text-slate-900 placeholder:text-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none shadow-sm"
                          placeholder="Vị trí công việc"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-600 transition-colors">badge</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-1 block">Phương thức nhận thư mời</label>
                    <div className="grid grid-cols-3 gap-6">
                      {['Email', 'SMS', 'Link'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSelectedAttendee({ ...selectedAttendee, method })}
                          className={`flex items-center justify-center gap-3 py-4 rounded-[1.5rem] border-2 font-black text-sm transition-all duration-300 ${selectedAttendee.method === method
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30'
                            }`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {method === 'Email' ? 'alternate_email' : method === 'SMS' ? 'sms' : 'link'}
                          </span>
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 hover:border-slate-300 transition-all rounded-2xl shadow-sm"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    disabled={isSubmitting}
                    className="px-12 py-4 bg-indigo-600 text-white font-black text-sm rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center gap-3 min-w-[220px] justify-center active:scale-95 duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang lưu dữ liệu...
                      </>
                    ) : (
                      <>Xác nhận cập nhật</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {isDeleteModalOpen && attendeeToDelete && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden z-10 p-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-rose-600 animate-pulse">warning</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Xác nhận xóa?</h2>
              <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">
                Bạn có chắc chắn muốn xóa khách mời <span className="text-slate-900 font-black">{attendeeToDelete.name}</span>?
                Hành động này không thể hoàn tác.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="py-4 bg-slate-100 text-slate-600 font-black text-sm rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    setAllAttendees(prev => prev.filter(a => a.id !== attendeeToDelete.id));
                    setIsDeleteModalOpen(false);
                    showToast(`Đã xóa khách mời ${attendeeToDelete.name} thành công!`, 'success');
                  }}
                  className="py-4 bg-rose-600 text-white font-black text-sm rounded-2xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-100"
                >
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="fixed bottom-10 right-10 z-[200] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl shadow-2xl min-w-[320px]"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-black tracking-tight">{toast.message}</p>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerEventAttendeesPage;
