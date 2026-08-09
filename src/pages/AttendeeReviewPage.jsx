import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, Lightbulb, ChevronDown, Smile, Sparkles, ArrowRight } from 'lucide-react';
import axios from '../lib/axios';

const AttendeeReviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rating, setRating] = useState(5);
  const [likeText, setLikeText] = useState('');
  const [improveText, setImproveText] = useState('');
  const [pastReviews, setPastReviews] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, reviewsRes] = await Promise.all([
        axios.get('/api/v1/attendee/reviews/events'),
        axios.get('/api/v1/attendee/reviews')
      ]);

      const reviewableEvents = eventsRes.data || [];
      setEvents(reviewableEvents);

      const userReviews = reviewsRes.data || [];
      setPastReviews(userReviews);

      if (reviewableEvents.length > 0) {
        setSelectedEvent(reviewableEvents[0]);
        prefillReview(reviewableEvents[0].eventId, userReviews);
      }
    } catch (err) {
      console.error("Error loading review data:", err);
      setError("Không thể tải danh sách sự kiện đã tham gia. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const prefillReview = (eventId, reviewsList) => {
    const existing = reviewsList.find(r => r.eventId === eventId);
    if (existing) {
      setRating(existing.rating);
      const comment = existing.comment || '';
      const matchLike = comment.match(/Thích nhất:\s*([\s\S]*?)(?=\nGóp ý:|$)/);
      const matchImprove = comment.match(/\nGóp ý:\s*([\s\S]*)$/);

      if (matchLike) setLikeText(matchLike[1].trim());
      else if (!matchImprove) setLikeText(comment);
      else setLikeText('');

      if (matchImprove) setImproveText(matchImprove[1].trim());
      else setImproveText('');
    } else {
      setRating(5);
      setLikeText('');
      setImproveText('');
    }
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event);
    prefillReview(event.eventId, pastReviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const combinedComment = `Thích nhất: ${likeText.trim()}\nGóp ý: ${improveText.trim()}`;

    try {
      setSubmitting(true);
      const res = await axios.post('/api/v1/attendee/reviews', {
        eventId: selectedEvent.eventId,
        rating: rating,
        comment: combinedComment
      });

      const updatedReviews = [...pastReviews];
      const index = updatedReviews.findIndex(r => r.eventId === selectedEvent.eventId);
      if (index !== -1) {
        updatedReviews[index] = res.data;
      } else {
        updatedReviews.push(res.data);
      }
      setPastReviews(updatedReviews);

      alert("Đã gửi đánh giá thành công! Cảm ơn ý kiến của bạn.");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Không thể gửi đánh giá. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400">Đang tải danh sách sự kiện đã tham gia...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center flex flex-col items-center justify-center bg-white border-2 border-slate-200 rounded-[32px] shadow-md my-10">
        <Smile className="w-16 h-16 text-indigo-500 mb-6" />
        <h3 className="text-xl font-black text-slate-800 mb-2">Chưa có sự kiện nào để đánh giá</h3>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-8 max-w-xs">
          Bạn chỉ có thể đánh giá các sự kiện đã đặt vé thành công. Hãy khám phá các sự kiện thú vị xung quanh nhé!
        </p>
        <button
          onClick={() => navigate('/attendee/explore')}
          className="bg-indigo-600 hover:bg-indigo-755 text-white px-6 py-3.5 rounded-2xl font-black text-xs transition-all shadow-md shadow-indigo-200 active:scale-95 inline-flex items-center gap-1.5"
        >
          Khám phá sự kiện ngay <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const isAlreadyReviewed = selectedEvent && pastReviews.some(r => r.eventId === selectedEvent.eventId);

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Banner */}
      <div className="relative w-full h-[220px] rounded-[48px] overflow-hidden mb-6 shadow-xl group">
        <img 
          src={selectedEvent?.eventBannerUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1600"} 
          alt="Event Background" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Bạn thấy sự kiện thế nào?
          </h1>
        </div>
      </div>

      <div className="mb-12">
        <p className="text-slate-500 text-xl font-medium max-w-3xl leading-relaxed">
          Chia sẻ trải nghiệm của bạn tại sự kiện <span className="text-indigo-600 font-bold">"{selectedEvent?.eventTitle}"</span> để chúng tôi có thể phục vụ bạn tốt hơn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 bg-white rounded-[48px] p-12 shadow-sm border border-slate-100">
          
          {/* Custom Dropdown to Select Event */}
          <div className="relative mb-10">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
              Chọn sự kiện đã tham gia
            </label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-slate-50 border-2 border-slate-200 hover:border-slate-350 px-5 py-3.5 rounded-2xl flex items-center justify-between font-black text-slate-800 text-sm shadow-sm transition-all focus:outline-none"
            >
              <span className="truncate">{selectedEvent ? selectedEvent.eventTitle : 'Chọn sự kiện...'}</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 z-20 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                {events.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => {
                      handleEventChange(evt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-5 py-3 text-left text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${
                      selectedEvent?.eventId === evt.eventId ? 'text-indigo-650 bg-indigo-50/30' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{evt.eventTitle}</span>
                    {pastReviews.some(r => r.eventId === evt.eventId) && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black uppercase">
                        Đã đánh giá
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-slate-800 mb-6">Đánh giá chung</h2>
              <div className="flex justify-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-all duration-300 transform hover:scale-110 ${
                      star <= rating ? 'text-indigo-500' : 'text-slate-200'
                    }`}
                  >
                    <Star className={`w-12 h-12 ${star <= rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              <p className="text-indigo-650 font-black text-lg">
                {rating === 5 ? 'Tuyệt vời nhất! (5/5)' : rating === 4 ? 'Tuyệt vời (4/5)' : rating === 3 ? 'Khá tốt (3/5)' : rating === 2 ? 'Cần cải thiện (2/5)' : 'Chưa tốt (1/5)'}
              </p>
              {isAlreadyReviewed && (
                <span className="mt-2 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                  Bạn đã đánh giá sự kiện này. Gửi lại sẽ cập nhật đánh giá cũ.
                </span>
              )}
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Điều bạn thích nhất</label>
                <textarea
                  value={likeText}
                  onChange={(e) => setLikeText(e.target.value)}
                  required
                  placeholder="Kể cho chúng tôi về khoảnh khắc ấn tượng nhất của bạn..."
                  className="w-full bg-slate-50 border-none rounded-3xl p-6 min-h-[140px] text-slate-700 font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Góp ý cải thiện</label>
                <textarea
                  value={improveText}
                  onChange={(e) => setImproveText(e.target.value)}
                  placeholder="Điều gì có thể làm tốt hơn trong lần tới?"
                  className="w-full bg-slate-50 border-none rounded-3xl p-6 min-h-[140px] text-slate-700 font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none resize-none"
                />
              </div>

              <button
                disabled={submitting}
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white py-5 rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Gửi đánh giá của tôi"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Info Cards */}
        <div className="lg:col-span-4 space-y-8">
          {/* Gratitude Card */}
          <div className="bg-indigo-50/50 rounded-[40px] p-8 border border-indigo-100/50 space-y-6">
            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Heart className="w-7 h-7 fill-current" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">Lời cảm ơn từ Ban Tổ Chức</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Ý kiến của bạn là chìa khóa để chúng tôi kiến tạo những trải nghiệm đẳng cấp hơn. Mỗi phản hồi đều được ban tổ chức trân trọng và lắng nghe.
              </p>
            </div>
            <div className="pt-6 border-t border-indigo-100/50 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <img 
                    key={i} 
                    src={`https://i.pravatar.cc/100?u=user${i+10}`} 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm" 
                    alt="User"
                  />
                ))}
                <div className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-indigo-600">
                  +12
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Nhiều người khác đã phản hồi</span>
            </div>
          </div>

          {/* Tip Card */}
          <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 space-y-6">
            <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Lightbulb className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">Quy trình đóng góp</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Đánh giá của bạn sẽ được gửi thẳng đến ban quản trị sự kiện để tối ưu hóa khâu tổ chức, âm thanh, ánh sáng và trải nghiệm khách mời.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeReviewPage;
