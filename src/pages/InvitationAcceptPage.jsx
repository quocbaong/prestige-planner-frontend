import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { invitationService } from '../services/invitationService';

const InvitationAcceptPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [invitation, setInvitation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const confirmInvite = async () => {
      try {
        const res = await invitationService.acceptInvitation(token);
        setInvitation(res.data);
        setStatus('success');
      } catch (err) {
        setErrorMessage(err.response?.data?.error || 'Mã xác nhận không hợp lệ hoặc thư mời đã hết hạn.');
        setStatus('error');
      }
    };
    confirmInvite();
  }, [token]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center relative z-10"
      >
        {status === 'loading' && (
          <div className="py-12 space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-3xl text-indigo-400 animate-pulse">mail</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Đang xác nhận lời mời...</h2>
              <p className="text-sm font-bold text-slate-300">Vui lòng chờ trong giây lát, hệ thống đang ghi nhận xác nhận tham dự của bạn.</p>
            </div>
          </div>
        )}

        {status === 'success' && invitation && (
          <div className="py-8 space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 animate-bounce">
              <span className="material-symbols-outlined text-5xl">task_alt</span>
            </div>
            <div className="space-y-3">
              <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-widest">
                Xác nhận thành công
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">Hẹn gặp bạn tại sự kiện!</h2>
              <p className="text-sm font-bold text-slate-300 leading-relaxed max-w-md mx-auto">
                Lời mời tham dự sự kiện <span className="text-white font-black">"{invitation.eventTitle}"</span> của bạn đã được ghi nhận thành công trên hệ thống.
              </p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left space-y-3 backdrop-blur-md">
              <div className="flex justify-between items-center text-xs font-bold border-b border-white/10 pb-3">
                <span className="text-slate-400 uppercase tracking-widest">Khách mời</span>
                <span className="text-white font-black">{invitation.email}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold border-b border-white/10 pb-3">
                <span className="text-slate-400 uppercase tracking-widest">Trạng thái hệ thống</span>
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  ĐÃ CHẤP NHẬN
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-widest">Thời gian xác nhận</span>
                <span className="text-slate-300">{new Date().toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/events')}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">explore</span>
              Khám phá thêm sự kiện khác
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <span className="material-symbols-outlined text-5xl">error</span>
            </div>
            <div className="space-y-3">
              <span className="inline-block px-4 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black uppercase tracking-widest">
                Xác nhận thất bại
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">Không thể xác nhận lời mời</h2>
              <p className="text-sm font-bold text-slate-300 leading-relaxed max-w-md mx-auto">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black text-sm rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">home</span>
              Quay lại trang chủ
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InvitationAcceptPage;
