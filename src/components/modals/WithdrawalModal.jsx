import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Landmark, AlertCircle, CheckCircle2, ChevronRight, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WithdrawalModal = ({ isOpen, onClose, availableBalance }) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Review, 3: Success
  const [selectedBank, setSelectedBank] = useState(null);

  if (!isOpen) return null;

  const banks = [
    { id: 1, name: 'Vietcombank', acc: '1234****9999', holder: 'NGUYEN VAN A' },
    { id: 2, name: 'Techcombank', acc: '9988****1111', holder: 'NGUYEN VAN A' },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleClose = () => {
    setStep(1);
    setAmount('');
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600">
              <Landmark className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rút tiền về ngân hàng</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        {step < 3 && (
          <div className="flex justify-center px-8 pt-6 pb-6">
            <div className="flex items-center w-full max-w-[240px]">
              {[1, 2].map((i) => (
                <React.Fragment key={i}>
                  <div className="relative">
                    {/* Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 relative ${
                      step >= i ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {i}
                    </div>
                    {/* Label */}
                    <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap ${
                      step >= i ? 'text-indigo-600' : 'text-slate-400'
                    }`}>
                      {i === 1 ? 'Thiết lập' : 'Xác nhận'}
                    </span>
                  </div>
                  
                  {/* Progress Line */}
                  {i === 1 && (
                    <div className="flex-1 h-0.5 bg-slate-100 dark:bg-slate-800 mx-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: step > 1 ? '100%' : '0%' }}
                        className="h-full bg-indigo-600"
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Balance Info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Số dư khả dụng</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(availableBalance)}</p>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Số tiền muốn rút</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full pl-4 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xl font-bold outline-none transition-all dark:text-white"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">VND</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[5000000, 10000000, availableBalance].map((val) => (
                      <button 
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                      >
                        {val === availableBalance ? 'Rút hết' : formatCurrency(val)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Chọn tài khoản nhận tiền</label>
                  <div className="space-y-2">
                    {banks.map((bank) => (
                      <div 
                        key={bank.id}
                        onClick={() => setSelectedBank(bank)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          selectedBank?.id === bank.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-600">
                            <Landmark className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{bank.name}</p>
                            <p className="text-xs text-slate-500">{bank.acc}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedBank?.id === bank.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-200'
                        }`}>
                          {selectedBank?.id === bank.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Bạn đang thực hiện lệnh rút</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">{formatCurrency(parseInt(amount))}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px] space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Người thụ hưởng</span>
                    <span className="text-slate-900 dark:text-white font-bold">{selectedBank?.holder}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Ngân hàng</span>
                    <span className="text-slate-900 dark:text-white font-bold">{selectedBank?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Số tài khoản</span>
                    <span className="text-slate-900 dark:text-white font-bold">{selectedBank?.acc}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Phí giao dịch</span>
                    <span className="text-emerald-600 font-bold">Miễn phí</span>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                    Tiền sẽ được chuyển vào tài khoản của bạn trong vòng 24h làm việc. Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100 dark:shadow-none">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Lệnh rút tiền đã được tạo!</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
                    Yêu cầu rút <strong>{formatCurrency(parseInt(amount))}</strong> của bạn đang được hệ thống xử lý.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-xs text-slate-400 font-medium">
                  Mã tham chiếu: <span className="text-slate-900 dark:text-white font-bold">WD-77889911</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 pt-0 flex gap-3">
          {step === 1 ? (
            <button 
              disabled={!amount || !selectedBank}
              onClick={handleNext}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              Tiếp tục
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : step === 2 ? (
            <>
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all hover:bg-slate-200 active:scale-95"
              >
                Quay lại
              </button>
              <button 
                onClick={handleNext}
                className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95"
              >
                Xác nhận rút tiền
              </button>
            </>
          ) : (
            <button 
              onClick={handleClose}
              className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl transition-all hover:opacity-90 active:scale-95"
            >
              Hoàn tất
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WithdrawalModal;
