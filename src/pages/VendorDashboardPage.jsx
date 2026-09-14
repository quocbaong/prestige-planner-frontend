import React from 'react';
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarRange,
  ChartColumnBig,
  MessageSquareText,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

const metrics = [
  { label: 'Doanh thu', value: '₫128.4M', change: '+18.2%', icon: TrendingUp, tone: 'bg-indigo-100 text-indigo-600' },
  { label: 'Đơn hàng', value: '482', change: '+12.6%', icon: ShoppingBag, tone: 'bg-emerald-100 text-emerald-600' },
  { label: 'Khách hàng', value: '1.2K', change: '+9.4%', icon: Users, tone: 'bg-sky-100 text-sky-600' },
  { label: 'Đánh giá', value: '4.8/5', change: '+0.3', icon: Star, tone: 'bg-amber-100 text-amber-600' },
];

const serviceCards = [
  { name: 'Trang trí sự kiện', status: 'Đang hoạt động', revenue: '₫42.5M', progress: 82 },
  { name: 'MC & âm thanh', status: 'Đang bán', revenue: '₫31.1M', progress: 68 },
  { name: 'Chụp ảnh cưới', status: 'Mới mở', revenue: '₫18.9M', progress: 52 },
];

const orders = [
  { id: 'EV-2041', client: 'Emma Nguyen', item: 'Gói trang trí', date: '12/09', amount: '₫12.5M', status: 'Đang xử lý' },
  { id: 'EV-1987', client: 'Linh Tran', item: 'MC sự kiện', date: '11/09', amount: '₫8.2M', status: 'Đã xác nhận' },
  { id: 'EV-1752', client: 'Phúc Hưng', item: 'Thuê âm thanh', date: '10/09', amount: '₫15.0M', status: 'Chờ thanh toán' },
];

const quickActions = [
  { title: 'Đăng ký dịch vụ mới', desc: 'Mở gói kinh doanh mới cho mùa lễ hội', icon: BriefcaseBusiness },
  { title: 'Xem chat với organizer', desc: '5 tin nhắn chưa phản hồi', icon: MessageSquareText },
  { title: 'Gợi ý AI tối ưu', desc: 'Cập nhật giá và lịch phục vụ phù hợp', icon: Bot },
];

const VendorDashboardPage = () => {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 p-6 text-white shadow-xl shadow-indigo-500/20 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
              <CalendarRange className="h-3.5 w-3.5" />
              Dashboard Vendor
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Chào mừng quay lại, Vender 👋</h1>
            <p className="mt-3 max-w-xl text-sm text-blue-100 sm:text-base">
              Theo dõi doanh thu, đơn hàng và hiệu suất dịch vụ của bạn trên cùng một hệ thống.
            </p>
          </div>

          <button className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-primary shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5">
            + Tạo gói dịch vụ
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-2xl p-2 ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" />
                  {item.change}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-900">{item.value}</h3>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Doanh thu theo tháng</h2>
              <p className="text-sm text-slate-500">Tăng trưởng so với tháng trước</p>
            </div>
            <button className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Tháng 9</button>
          </div>

          <div className="flex h-56 items-end gap-4">
            {[55, 72, 46, 88, 64, 96, 78].map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-full w-full items-end justify-center rounded-t-[20px] bg-gradient-to-t from-indigo-500 to-blue-300/80 p-1" style={{ height: `${value}%` }}>
                  <div className="w-full rounded-t-[14px] bg-gradient-to-t from-indigo-600 to-sky-400" />
                </div>
                <span className="text-[10px] font-medium text-slate-400">T{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Hành động nhanh</h3>
              <ChartColumnBig className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {quickActions.map(({ title, desc, icon: Icon }) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="mt-1 text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-lg font-bold text-slate-900">AI gợi ý hôm nay</h3>
            <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-sky-50 p-4">
              <div className="flex items-center gap-2 text-primary">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-[0.12em]">Smart suggestion</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Tăng giá 5% cho gói trang trí cuối tuần để đạt mục tiêu doanh thu 160M trong tháng này.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Dịch vụ đang hoạt động</h2>
            <button className="text-sm font-semibold text-primary">Xem tất cả</button>
          </div>

          <div className="space-y-4">
            {serviceCards.map((service) => (
              <div key={service.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{service.name}</h3>
                    <p className="mt-1 text-xs font-medium text-emerald-600">{service.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Doanh thu</p>
                    <p className="text-lg font-bold text-slate-900">{service.revenue}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Hiệu suất</span>
                    <span>{service.progress}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400"
                      style={{ width: `${service.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-xl font-bold text-slate-900">Đơn hàng mới</h2>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{order.item}</p>
                    <p className="mt-1 text-xs text-slate-500">{order.client}</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-600">
                    {order.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{order.id}</span>
                  <span>{order.date}</span>
                </div>
                <div className="mt-2 text-right text-sm font-bold text-slate-900">{order.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VendorDashboardPage;
