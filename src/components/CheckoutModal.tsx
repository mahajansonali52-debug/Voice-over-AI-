import React, { useState } from 'react';
import { SubscriptionPlan } from '../types';
import { X, Check, CreditCard, ShieldCheck, CheckCircle2, Award, Zap } from 'lucide-react';

interface CheckoutModalProps {
  plan: SubscriptionPlan;
  billingFrequency: 'monthly' | 'yearly';
  onClose: () => void;
  onConfirmSubscription: (plan: SubscriptionPlan, billing: 'monthly' | 'yearly') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  billingFrequency,
  onClose,
  onConfirmSubscription
}) => {
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('Sonali Mahajan');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('8208152171');
  const [paymentType, setPaymentType] = useState<'upi' | 'netbanking' | 'card'>('upi');
  const [upiId, setUpiId] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('SBI');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // 1 = Entry Form, 2 = Success splash

  const cost = billingFrequency === 'monthly' ? plan.price : plan.priceYearly;

  // Calculate Expiry Date for subscription
  const expiryDate = new Date();
  if (billingFrequency === 'monthly') {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }
  const expiryString = expiryDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentType === 'card') {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        alert('Please fill out card credit info.');
        return;
      }
    } else if (paymentType === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        alert('Please specify a valid UPI Address.');
        return;
      }
    }

    setIsProcessing(true);
    // Simulate payment merchant handling
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
      onConfirmSubscription(plan, billingFrequency);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden my-8">
        
        {/* Close Button absolute */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full cursor-pointer transition-colors z-10 font-bold"
        >
          ✕
        </button>

        {step === 1 ? (
          <div>
            {/* Header banner */}
            <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-center gap-2 text-indigo-400">
                <Zap className="w-4 h-4 fill-current animate-bounce" />
                <span className="text-[10px] uppercase font-extrabold tracking-wider">Premium Access License</span>
              </div>
              <h3 className="text-xl font-extrabold mt-1 font-sans">Upgrade to {plan.name}</h3>
              <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                Unlock instant studio voice synthesizers. Subscription expires on <span className="text-amber-300 font-bold">{expiryString}</span>.
              </p>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">₹{cost.toLocaleString('en-IN')}</span>
                <span className="text-slate-400 text-xs font-normal">/{billingFrequency === 'monthly' ? 'month' : 'mo (billed yearly)'}</span>
              </div>
            </div>

            {/* Included highlights list */}
            <div className="p-6 pb-2 space-y-2 text-left">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Included Core Features</span>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {plan.features.slice(0, 3).map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 font-extrabold" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi Payment Tabs */}
            <div className="px-6 pt-2">
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-center">
                <button
                  type="button"
                  onClick={() => setPaymentType('upi')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${paymentType === 'upi' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                >
                  📱 UPI ID
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('netbanking')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${paymentType === 'netbanking' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                >
                  🏦 NetBank
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('card')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${paymentType === 'card' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                >
                  💳 Card
                </button>
              </div>
            </div>

            {/* Form Inputs Container */}
            <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
              
              {paymentType === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">UPI Address (VPA)</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@ybl or mobileNumber@paytm"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    />
                    
                    <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg mt-2 text-left">
                      <p className="text-[10px] text-slate-500 leading-normal">
                        🛡️ <strong>Why UPI ID is requested:</strong> We require your UPI ID to match database transactions in real-time. It acts as a safe gateway ticket to bind your payment metadata directly to your signed-in Google account for instant Premium feature assignment.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number (Receives Payment SMS)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full border border-slate-200 rounded-xl p-2.5 pl-11 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    UPI authentication prompt will be pushed instantly to your mobile app associated with +91 {clientPhone}.
                  </p>
                </div>
              )}

              {paymentType === 'netbanking' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="AXIS">Axis Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Contact</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full border border-slate-200 rounded-xl p-2.5 pl-11 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentType === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        placeholder="4000 1234 5678 9010"
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full border border-slate-200 rounded-xl p-2.5 pl-9 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Expiration</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let text = e.target.value;
                          if (text.length === 2 && !text.includes('/')) {
                            text = text + '/';
                          }
                          setCardExpiry(text);
                        }}
                        placeholder="MM/YY"
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-center focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">CVV / CVN</label>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-center focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  id="btn-sub-checkout-pay"
                  disabled={isProcessing}
                  className={`w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 transition-all font-bold text-white text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Provisioning Razorpay Profile...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-300 fill-indigo-950" />
                      Approve & Pay ₹{cost.toLocaleString('en-IN')}
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                🔒 Razorpay Smart Escrows. Backed by transactional security.
              </p>
            </form>
          </div>
        ) : (
          /* SUCCESS splash screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
              <CheckCircle2 className="w-12 h-12 animate-pulse text-emerald-500" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-slate-900 text-xl font-sans">Subscription Active now!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Authorized successfully for smartphone <strong className="text-slate-700">+91 {clientPhone}</strong> via secure gateway protocols.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">Active Studio Subscription</span>
              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-100">
                <span>Account Tier:</span>
                <span className="font-bold text-slate-900">{plan.name}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Monthly Allocation:</span>
                <span className="font-bold text-slate-900">{plan.wordLimit}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-indigo-700 font-bold">Planned Date of Expiry:</span>
                <span className="font-black text-rose-600 font-mono text-xs">{expiryString}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Billing Status:</span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  Active / Paid (₹{cost.toLocaleString('en-IN')})
                </span>
              </div>
            </div>

            {/* Step-by-step breakdown of What Happens Next */}
            <div className="border border-slate-100 hover:border-indigo-100 bg-white p-4 rounded-2xl text-left space-y-3 transition-colors">
              <h5 className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                Subscription Activated - What Happens Next?
              </h5>
              
              <div className="space-y-2.5 text-[11px] leading-relaxed">
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                  <div>
                    <strong className="text-slate-800 block leading-tight font-sans">Premium Voices Unlocked</strong>
                    <span className="text-slate-500">You now have immediate access to hire and preview trial actors as VIP models on the directory.</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                  <div>
                    <strong className="text-slate-800 block leading-tight font-sans">Waived Booking Fees</strong>
                    <span className="text-slate-500">The platform booking convenience fee of ₹499 is completely waived on all of your future individual script orders.</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                  <div>
                    <strong className="text-slate-800 block leading-tight font-sans">Monthly Word Bank Credit</strong>
                    <span className="text-slate-500">Your account is topped up. You can generate up to {plan.wordLimit} high-fidelity voice synthesis words this month.</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              id="btn-sub-checkout-start"
              className="w-full py-3.5 bg-indigo-600 hover:bg-slate-900 transition-all font-bold text-white text-xs rounded-xl shadow-lg cursor-pointer font-sans"
            >
              Start Recording Demos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
