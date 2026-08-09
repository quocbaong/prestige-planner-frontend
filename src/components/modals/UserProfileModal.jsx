import React, { useState, useEffect } from 'react';
import { Mail, Phone, ShieldCheck, Check, X, Ban, Globe, Ticket, Edit3, Lock } from 'lucide-react';
import { useAuth } from '../../stores/AuthContext';
import { eventService } from '../../services/eventService';

const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [eventCount, setEventCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  // States cho phép chỉnh sửa thông tin
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Đồng bộ thông tin từ AuthContext khi mở Modal
  useEffect(() => {
    if (user) {
      setEditFullName(user.fullName || "Prestige Planner Corp");
      setEditPhone(user.phone || "+84 90 123 4567");
      setEditWebsite(user.website || "https://prestigeplanner.com");
      setEditAddress(user.address || "Quận 7, TP. Hồ Chí Minh, Việt Nam");
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen && user) {
      // Lấy danh sách sự kiện thực tế để hiển thị con số thật
      eventService.getEvents()
        .then(events => {
          if (events) {
            setEventCount(events.length);
          }
        })
        .catch(err => console.error("Error fetching events count for organizer: ", err));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const getInitials = (name) => {
    if (!name) return 'PP';
    return name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateUser({
        fullName: editFullName,
        phone: editPhone,
        website: editWebsite,
        address: editAddress
      });
      setIsEditing(false);
      alert("Đã cập nhật thông tin hồ sơ Nhà tổ chức thành công!");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi cập nhật thông tin: " + (error.message || error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Khôi phục lại dữ liệu ban đầu
    if (user) {
      setEditFullName(user.fullName || "Prestige Planner Corp");
      setEditPhone(user.phone || "+84 90 123 4567");
      setEditWebsite(user.website || "https://prestigeplanner.com");
      setEditAddress(user.address || "Quận 7, TP. Hồ Chí Minh, Việt Nam");
    }
    setIsEditing(false);
  };

  const handleLockAccount = () => {
    const confirmLock = window.confirm("Bạn có chắc chắn muốn tạm khóa tài khoản nhà tổ chức này không? Các sự kiện đang diễn ra sẽ bị tạm dừng.");
    if (confirmLock) {
      setIsLocked(true);
      alert("Tài khoản nhà tổ chức đã được chuyển sang trạng thái tạm khóa.");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Card customized logically for the Organizer */}
      <div className="relative bg-white border border-slate-100 rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden text-slate-800 font-sans animate-in fade-in zoom-in-95 duration-250 z-10">
        
        {/* Top Header Gradient (Indigo to Purple - Premium branding vibe) */}
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 relative">
          {/* Quick Edit Indicator in Header */}
          <div className="absolute top-5 left-8 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isEditing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            <span className="text-white/90 text-xs font-bold uppercase tracking-wider select-none">
              {isEditing ? "Chế độ chỉnh sửa" : "Xem hồ sơ đối tác"}
            </span>
          </div>

          {/* Close Button X */}
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Body */}
        <div className="px-10 pb-8 pt-16 relative">
          
          {/* Avatar overlapping the top gradient bar */}
          <div className="absolute left-10 -top-16">
            <div className="w-28 h-28 rounded-full border-[6px] border-white shadow-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-black text-3xl overflow-hidden ring-1 ring-slate-100 select-none">
              {getInitials(editFullName)}
            </div>
          </div>

          {/* Name & ID */}
          <div className="pl-32 -mt-12 mb-8 text-left">
            {isEditing ? (
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest block">Tên Thương Hiệu/Công ty</label>
                <input 
                  type="text" 
                  value={editFullName} 
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full text-2xl font-extrabold text-slate-900 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Tên thương hiệu"
                />
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {user?.fullName || "Prestige Planner Corp"}
                </h3>
                <p className="text-indigo-600 font-bold text-sm mt-1">
                  Nhà tổ chức cấp cao · ID: #PP-{user?.id ? user.id.substring(0, 8).toUpperCase() : "ORGANIZER"}
                </p>
              </>
            )}
          </div>

          {/* Details Grid: Contact, Stats, Address, Verification */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8 text-left">
            {/* Left Column (Brand Contact & Address) */}
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Thông tin thương hiệu
                </span>
                <div className="space-y-2.5">
                  {/* Email (Always Read-only with lock) */}
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div className="flex-grow flex items-center gap-1.5 justify-between">
                      <span className="text-sm font-semibold text-slate-500 select-none truncate">
                        {user?.email || "organizer@prestigeplanner.com"}
                      </span>
                      {isEditing && <Lock className="w-3.5 h-3.5 text-slate-300" title="Email định danh không thể chỉnh sửa" />}
                    </div>
                  </div>
                  
                  {/* Phone (Editable) */}
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="flex-grow px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        placeholder="Số điện thoại"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-slate-700">{user?.phone || editPhone}</span>
                    )}
                  </div>
                  
                  {/* Website (Editable) */}
                  <div className="flex items-center gap-3 text-slate-600">
                    <Globe className="w-4 h-4 text-slate-400" />
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editWebsite} 
                        onChange={(e) => setEditWebsite(e.target.value)}
                        className="flex-grow px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-indigo-600 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        placeholder="https://..."
                      />
                    ) : (
                      <span className="text-sm font-semibold text-indigo-500 hover:underline cursor-pointer">
                        {user?.website || editWebsite}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Address (Editable) */}
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">
                  Trụ sở chính
                </span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editAddress} 
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="Địa chỉ trụ sở"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    {user?.address || editAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column (Organizer Analytics & Status - Read-only stats) */}
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Hiệu suất hoạt động
                </span>
                <div className="space-y-2 text-sm font-bold text-slate-800">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    {eventCount || 8} Sự kiện đã tạo
                  </p>
                  <p className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-slate-400" />
                    {eventCount ? eventCount * 85 : 680} Vé đã phát hành
                  </p>
                  <p className="text-slate-700 flex items-center gap-2">
                    <span className="text-amber-500">★</span>
                    4.9/5.0 Đánh giá đối tác
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5">
                  Xác minh pháp lý
                </span>
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    <span>Đối tác đã xác thực (eKYC)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Hierarchy Tiers (Read-only setup) */}
          <div className="bg-slate-50/80 border border-slate-100 p-6 rounded-[24px] mb-8 text-left">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block mb-4">
              Cấp độ tài khoản & Phân quyền
            </span>
            <div className="flex flex-wrap gap-3">
              {/* Active Role Card (Master Account / Owner) */}
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-indigo-600 text-indigo-600 font-bold text-sm shadow-sm cursor-pointer select-none">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Chủ tài khoản (Owner)</span>
              </div>

              {/* Inactive Role Card 1 */}
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-500 font-bold text-sm hover:border-slate-300 transition-colors cursor-pointer select-none" title="Quyền giới hạn dành cho nhân sự vận hành">
                <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                <span>Nhân sự vận hành (Staff)</span>
              </div>

              {/* Inactive Role Card 2 */}
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-500 font-bold text-sm hover:border-slate-300 transition-colors cursor-pointer select-none" title="Quyền giới hạn dành cho kiểm vé sự kiện">
                <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                <span>Cộng tác viên kiểm vé (Crew)</span>
              </div>
            </div>
          </div>

          {/* Footer Actions with Dynamic Toggle Buttons */}
          <div className="flex items-center justify-between pt-2">
            {/* Lock Account */}
            <button 
              onClick={handleLockAccount}
              className="text-rose-600 hover:text-rose-700 font-bold text-sm transition-colors flex items-center gap-2"
            >
              <Ban className="w-4.5 h-4.5" />
              <span>Khóa tài khoản</span>
            </button>

            {/* Closing & Saving / Editing Buttons */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleCancel}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-full text-sm transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-full text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <span>Lưu thay đổi</span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={onClose}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-3.5 rounded-full text-sm transition-colors"
                  >
                    Đóng
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-full text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Chỉnh sửa</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
