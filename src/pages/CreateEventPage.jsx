import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Tag, 
  Image as ImageIcon, 
  Users, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Music, 
  Terminal, 
  Pizza, 
  Palette, 
  Briefcase, 
  Trophy, 
  GraduationCap, 
  PartyPopper, 
  HelpCircle,
  X,
  Plus
} from 'lucide-react';
import { eventService } from '../services/eventService';
import { useAuth } from '../stores/AuthContext';

const CATEGORIES = [
  { value: 'MUSIC', label: 'Âm nhạc', icon: Music, color: 'from-pink-500 to-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600' },
  { value: 'TECH', label: 'Công nghệ', icon: Terminal, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-600' },
  { value: 'FOOD', label: 'Ẩm thực', icon: Pizza, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-600' },
  { value: 'ART', label: 'Nghệ thuật', icon: Palette, color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-600' },
  { value: 'BUSINESS', label: 'Doanh nghiệp', icon: Briefcase, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-50 dark:bg-cyan-950/20', text: 'text-cyan-600' },
  { value: 'SPORTS', label: 'Thể thao', icon: Trophy, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-600' },
  { value: 'EDUCATION', label: 'Giáo dục', icon: GraduationCap, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50 dark:bg-violet-950/20', text: 'text-violet-600' },
  { value: 'ENTERTAINMENT', label: 'Giải trí', icon: PartyPopper, color: 'from-red-500 to-pink-500', bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-600' },
  { value: 'OTHER', label: 'Khác', icon: HelpCircle, color: 'from-slate-500 to-slate-700', bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-600' },
];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const redirectPath = isAdmin ? '/admin/events' : '/organizer/events';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form states
  const [form, setForm] = useState({
    title: '',
    description: '',
    shortDesc: '',
    category: 'TECH',
    venue: '',
    address: '',
    city: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxAttendees: '',
    bannerUrl: '',
    thumbnailUrl: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  // Image preview state
  const [bannerPreviewError, setBannerPreviewError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const cleanTag = tagInput.trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleStepNext = () => {
    // Validation for Step 1
    if (step === 1) {
      if (!form.title.trim()) return setError('Vui lòng nhập tên sự kiện');
      if (!form.description.trim()) return setError('Vui lòng nhập mô tả chi tiết');
      setError('');
    }

    // Validation for Step 2
    if (step === 2) {
      if (!form.venue.trim()) return setError('Vui lòng nhập tên địa điểm');
      if (!form.city.trim()) return setError('Vui lòng nhập thành phố');
      if (!form.address.trim()) return setError('Vui lòng nhập địa chỉ chi tiết');
      if (!form.maxAttendees) return setError('Vui lòng nhập số lượng người tham gia tối đa');
      if (parseInt(form.maxAttendees) <= 0) return setError('Số lượng người tham gia tối đa phải lớn hơn 0');
      if (!form.startDate) return setError('Vui lòng nhập thời gian bắt đầu');
      if (!form.endDate) return setError('Vui lòng nhập thời gian kết thúc');

      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (start >= end) {
        return setError('Thời gian bắt đầu phải trước thời gian kết thúc');
      }

      if (form.registrationDeadline) {
        const deadline = new Date(form.registrationDeadline);
        if (deadline >= start) {
          return setError('Hạn chót đăng ký phải trước thời gian bắt đầu');
        }
      }
      setError('');
    }

    setStep(prev => prev + 1);
  };

  const handleStepBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title: form.title,
        description: form.description,
        shortDesc: form.shortDesc || undefined,
        category: form.category,
        venue: form.venue,
        address: form.address,
        city: form.city,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline).toISOString() : undefined,
        maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
        bannerUrl: form.bannerUrl || undefined,
        thumbnailUrl: form.thumbnailUrl || form.bannerUrl || undefined,
        tags: tags.length > 0 ? tags : undefined
      };

      await eventService.createEvent(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate(redirectPath);
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Không thể tạo sự kiện';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryObj = CATEGORIES.find(c => c.value === form.category);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] p-6 lg:p-10 flex flex-col justify-between">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex justify-between items-center pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-headline flex items-center gap-3">
              <span className="p-2.5 bg-indigo-600/10 text-indigo-600 rounded-2xl">
                <Plus className="w-6 h-6 stroke-[3px]" />
              </span>
              Tạo Sự Kiện Mới
            </h1>
            <p className="text-slate-500 text-sm mt-1">Cung cấp các thông tin cần thiết để khởi tạo sự kiện của bạn.</p>
          </div>
          <button 
            onClick={() => navigate(redirectPath)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all shadow-sm flex items-center gap-2"
          >
            Quay lại
          </button>
        </div>

        {/* Progress Bar & Stepper */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Bước {step} trên 3</span>
            <span className="text-xs font-bold text-slate-400">
              {step === 1 && 'Thông tin cơ bản'}
              {step === 2 && 'Thời gian, Địa điểm & Quy mô'}
              {step === 3 && 'Hình ảnh & Quảng bá'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`flex items-center gap-2.5 py-1 px-2 border-b-2 transition-all duration-300 ${
                  step >= num 
                    ? 'border-indigo-600 text-slate-800 font-bold' 
                    : 'border-slate-100 text-slate-400 font-medium'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === num 
                    ? 'bg-indigo-600 text-white' 
                    : step > num 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {num}
                </span>
                <span className="text-[11px] uppercase tracking-wider hidden sm:inline">
                  {num === 1 && 'Cơ bản'}
                  {num === 2 && 'Địa điểm'}
                  {num === 3 && 'Hoàn tất'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Errors */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-50 border border-rose-200/50 text-rose-700 p-4 rounded-2xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div className="text-sm font-semibold">{error}</div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 p-8 rounded-[2rem] text-center space-y-4 shadow-xl"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10 stroke-[2.5px]" />
              </div>
              <h3 className="text-xl font-black font-headline">Tạo sự kiện thành công!</h3>
              <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                Sự kiện của bạn đã được lưu nháp thành công. Đang chuyển hướng về trang danh sách sự kiện...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Wizard */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: BASIC INFORMATION */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-black text-slate-800 font-headline flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Thông tin cơ bản sự kiện
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Đặt tên, mô tả ngắn gọn và phân loại sự kiện.</p>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Tên sự kiện *
                    </label>
                    <input
                      type="text"
                      required
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Hội thảo Phát triển Kỹ năng AI 2026"
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Mô tả ngắn gọn
                    </label>
                    <input
                      type="text"
                      name="shortDesc"
                      value={form.shortDesc}
                      onChange={handleInputChange}
                      placeholder="Một câu mô tả thu hút người xem trong danh sách (tối đa 150 ký tự)"
                      maxLength={150}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Detailed Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Mô tả chi tiết *
                    </label>
                    <textarea
                      required
                      rows={5}
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả cụ thể về nội dung sự kiện, các diễn giả, lợi ích khi tham gia,..."
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 placeholder-slate-400 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Category Grid Selection */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Hạng mục sự kiện *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = form.category === cat.value;
                        return (
                          <div
                            key={cat.value}
                            onClick={() => setForm(p => ({ ...p, category: cat.value }))}
                            className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between h-28 transition-all hover:translate-y-[-2px] ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100 dark:shadow-none' 
                                : 'border-slate-100 bg-white hover:border-slate-200'
                            }`}
                          >
                            <div className={`p-2 rounded-xl w-fit ${isSelected ? 'bg-indigo-600 text-white' : cat.bg + ' ' + cat.text}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-black text-sm text-slate-800">{cat.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Từ khóa (Tags)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Nhập từ khóa và bấm nút Thêm"
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md flex items-center justify-center"
                      >
                        Thêm
                      </button>
                    </div>
                    
                    {/* Tag Pills */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {tags.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-full text-xs font-bold text-slate-700 transition-colors"
                          >
                            #{tag}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveTag(idx)} 
                              className="w-4 h-4 bg-slate-200 hover:bg-rose-100 hover:text-rose-600 rounded-full flex items-center justify-center transition-colors"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: TIME & LOCATION */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-black text-slate-800 font-headline flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      Thời gian, Địa điểm & Quy mô
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Xác định địa điểm, thời gian diễn ra và số lượng người tham gia.</p>
                  </div>

                  {/* Location Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Venue */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Tên địa điểm *
                      </label>
                      <input
                        type="text"
                        required
                        name="venue"
                        value={form.venue}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Trung tâm Hội nghị Quốc gia"
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Thành phố *
                      </label>
                      <input
                        type="text"
                        required
                        name="city"
                        value={form.city}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Hà Nội"
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    {/* Detailed Address */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Địa chỉ chi tiết *
                      </label>
                      <input
                        type="text"
                        required
                        name="address"
                        value={form.address}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Số 57 Phạm Hùng, Mễ Trì, Nam Từ Liêm"
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Max Attendees */}
                  <div className="space-y-2 pt-4 border-t border-slate-50">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      Số lượng người tham gia tối đa *
                    </label>
                    <input
                      type="number"
                      required
                      name="maxAttendees"
                      value={form.maxAttendees}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: 100"
                      min="1"
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Dates Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                    {/* Start Date */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Thời gian bắt đầu *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        name="startDate"
                        value={form.startDate}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Thời gian kết thúc *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        name="endDate"
                        value={form.endDate}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>

                    {/* Registration Deadline */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        Hạn chót đăng ký vé (Không bắt buộc)
                      </label>
                      <input
                        type="datetime-local"
                        name="registrationDeadline"
                        value={form.registrationDeadline}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: BANNER, THUMBNAIL & ATTENDEE LIMITS */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-black text-slate-800 font-headline flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-indigo-600" />
                      Hình ảnh & Quảng bá
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Cung cấp hình ảnh banner và quảng bá sự kiện.</p>
                  </div>

                  {/* Banner URL */}
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      URL Hình ảnh Banner *
                    </label>
                    <input
                      type="url"
                      name="bannerUrl"
                      value={form.bannerUrl}
                      onChange={(e) => {
                        handleInputChange(e);
                        setBannerPreviewError(false);
                      }}
                      placeholder="Dán link ảnh từ Unsplash hoặc lưu trữ trực tuyến..."
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Thumbnail URL */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      URL Hình ảnh Thu nhỏ (Thumbnail - Không bắt buộc)
                    </label>
                    <input
                      type="url"
                      name="thumbnailUrl"
                      value={form.thumbnailUrl}
                      onChange={handleInputChange}
                      placeholder="Nếu bỏ trống, hệ thống sẽ sử dụng ảnh Banner làm ảnh thu nhỏ"
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                    />
                  </div>

                  {/* Live Banner Preview */}
                  <div className="pt-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 block mb-2">
                      Xem trước Banner
                    </span>
                    <div className="w-full aspect-video rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center overflow-hidden shadow-inner relative group">
                      {form.bannerUrl && !bannerPreviewError ? (
                        <img 
                          src={form.bannerUrl} 
                          alt="Banner Preview" 
                          className="w-full h-full object-cover"
                          onError={() => setBannerPreviewError(true)}
                        />
                      ) : (
                        <div className="text-center p-6 text-slate-400 space-y-2">
                          <ImageIcon className="w-10 h-10 mx-auto opacity-50 stroke-[1.5px]" />
                          <p className="text-xs font-bold uppercase tracking-wider">Chưa có ảnh preview</p>
                          <p className="text-[10px] text-slate-400 max-w-xs font-medium leading-relaxed">
                            Dán đường dẫn URL ảnh hợp lệ vào trường phía trên để xem trước tại đây.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation Buttons */}
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <button
                type="button"
                disabled={step === 1 || loading}
                onClick={handleStepBack}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 font-bold text-sm text-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                Trở lại
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleStepNext}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm transition-all shadow-lg shadow-indigo-200 active:scale-95"
                >
                  Tiếp theo
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white font-black text-sm transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Tạo sự kiện
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateEventPage;
