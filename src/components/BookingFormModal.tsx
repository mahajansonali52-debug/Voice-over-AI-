import React, { useState } from 'react';
import { VoiceActor, Booking } from '../types';
import { X, Calendar, FileText, BadgeDollarSign, CreditCard, ChevronRight, CheckCircle, ShieldCheck } from 'lucide-react';

interface BookingFormModalProps {
  actor: VoiceActor;
  onClose: () => void;
  onSubmitBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status' | 'paymentId'>) => void;
  isSubscribed: boolean;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  actor,
  onClose,
  onSubmitBooking,
  isSubscribed
}) => {
  const [step, setStep] = useState<number>(1); // 1 = Details, 2 = Payment Flow, 3 = Success state
  const [projectName, setProjectName] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('user@example.com');
  const [clientPhone, setClientPhone] = useState<string>('8208152171');
  const [scriptText, setScriptText] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('Conversational');
  const [wordCount, setWordCount] = useState<number>(250);
  const [useBackground, setUseBackground] = useState<boolean>(false);
  
  // Custom Indian payment selector
  const [paymentType, setPaymentType] = useState<'upi' | 'netbanking' | 'card'>('upi');
  const [upiId, setUpiId] = useState<string>('8208152171@paytm');
  const [selectedBank, setSelectedBank] = useState<string>('SBI');

  // Credit Card Form states
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Auto-calculate billing rates in INR (₹)
  const basePrice = wordCount * actor.perWordRate;
  const backgroundMusicFee = useBackground ? 999 : 0;
  const agencyManagementFee = isSubscribed ? 0 : 499; // Unsubscribed users pay standard booking premium
  const totalPrice = basePrice + backgroundMusicFee + agencyManagementFee;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!projectName.trim() || !clientName.trim() || !clientEmail.trim() || !clientPhone.trim() || !scriptText.trim()) {
        alert('Please complete all fields (including your 10-digit mobile number) to proceed.');
        return;
      }
      setStep(2);
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentType === 'card') {
      if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        alert('Please fill out card transaction credentials.');
        return;
      }
    } else if (paymentType === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        alert('Please enter a valid UPI ID (e.g. name@upi or cellcode@paytm).');
        return;
      }
    }

    setIsProcessing(true);
    
    // Simulate real gateway processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      
      // Submit new completed booking detail
      onSubmitBooking({
        actorId: actor.id,
        actorName: actor.name,
        clientName,
        clientEmail,
        projectName,
        scriptText,
        selectedMood,
        wordCount,
        totalCost: totalPrice,
        audioGeneratedUrl: 'generated-audio-voice-preview'
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 overflow-hidden my-8">
        
        {/* Top title and Close header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Secure Booking Gateway</span>
            <h3 className="font-bold text-slate-800 text-base mt-1">Hire Voice: {actor.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Step Indicators */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-2.5 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>1</span>
            <span className={`${step === 1 ? 'text-indigo-600 font-semibold' : ''}`}>Project Details</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <div className="flex items-center gap-1">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>2</span>
            <span className={`${step === 2 ? 'text-indigo-600 font-semibold' : ''}`}>Payment Checkout</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <div className="flex items-center gap-1">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>3</span>
            <span className={`${step === 3 ? 'text-indigo-600 font-semibold' : ''}`}>Confirmation</span>
          </div>
        </div>

        {/* STEP 1: PROJECT DETAILS */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number (Receives Whatsapp updates & Invoice)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="8208152171"
                    className="w-full border border-slate-200 rounded-xl p-2.5 pl-11 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Project Name</label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Autumn Clothing Brand Radio spot"
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Word Count Estimate</label>
                <input
                  type="number"
                  min="5"
                  max="5000"
                  required
                  value={wordCount}
                  onChange={(e) => setWordCount(Math.max(5, parseInt(e.target.value) || 0))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vibe Direction</label>
                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="Warm & Friendly">Warm & Conversational</option>
                  <option value="Epic & Dramatic">Epic & Dramatic</option>
                  <option value="Energetic Hype">Energetic Hype</option>
                  <option value="Polished Corporate">Polished Corporate</option>
                  <option value="Whispering / Sleep">Soft Meditation</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 block">Voice Script Content</label>
                <button
                  type="button"
                  onClick={() => setScriptText(actor.demosList[0]?.scriptText || '')}
                  className="text-[10px] text-indigo-600 hover:underline font-bold"
                >
                  Auto-fill demo script
                </button>
              </div>
              <textarea
                required
                rows={4}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Paste the final script to be read by the performer here..."
                className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-550 outline-none resize-none"
              />
            </div>

            {/* Custom Background Music Option */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-background"
                  checked={useBackground}
                  onChange={(e) => setUseBackground(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                />
                <label htmlFor="chk-background" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Add Stock Background Audio Overlay
                </label>
              </div>
              <span className="text-xs font-medium text-slate-550">+₹999</span>
            </div>

            {/* Price Calculations */}
            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Base Script Read ({wordCount} words * ₹{actor.perWordRate}/wd):</span>
                <span className="font-semibold">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              {useBackground && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Stock Licensing & Mixing Fee:</span>
                  <span className="font-semibold">₹999</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-600">
                <span>Platform Booking Priority Fee:</span>
                <span className="font-semibold">
                  {isSubscribed ? <span className="text-emerald-600 font-bold">FREE (Subscribed)</span> : '₹499'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-indigo-100 text-sm font-bold text-slate-800">
                <span>Total Estimated Project Cost:</span>
                <span className="text-indigo-600">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-booking-details-submit"
                className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 rounded-xl cursor-pointer"
              >
                Proceed to Secure Payment
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: MULTI-METHOD INDIAN CHECKOUT */}
        {step === 2 && (
          <form onSubmit={handleProcessPayment} className="p-6 space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Booking Voice:</span>
                <strong className="text-slate-800">{actor.name}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600 mt-1">
                <span>Project Booking Draft:</span>
                <strong className="text-slate-800">{projectName}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-650 mt-1">
                <span>Registered Mobile:</span>
                <strong className="text-slate-800">+91 {clientPhone}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-800 mt-2 pt-2 border-t border-slate-200 text-sm font-bold">
                <span>Payment Due:</span>
                <span className="text-indigo-600">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-center">
              <button
                type="button"
                onClick={() => setPaymentType('upi')}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${paymentType === 'upi' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                📱 UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('netbanking')}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${paymentType === 'netbanking' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                🏦 NetBanking
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('card')}
                className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${paymentType === 'card' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                💳 Card
              </button>
            </div>

            {/* Render Active Payment Form Tab */}
            {paymentType === 'upi' && (
              <div className="space-y-4 p-4 border border-indigo-100 rounded-xl bg-indigo-50/10">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Unified Payments Interface</span>
                  <p className="text-xs text-slate-500 mt-0.5">Pay via GPay, PhonePe, Paytm, or BHIM</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Enter Your UPI ID / VPA</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="8208152171@paytm"
                      className="w-full border border-slate-200 bg-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <button type="button" onClick={() => setUpiId(`${clientPhone}@paytm`)} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded font-mono">@{clientPhone}@paytm</button>
                    <button type="button" onClick={() => setUpiId(`${clientPhone}@ybl`)} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded font-mono">@ybl</button>
                    <button type="button" onClick={() => setUpiId(`${clientPhone}@oksbi`)} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded font-mono">@oksbi</button>
                  </div>
                </div>

                {/* Simulated QR block representing Indian UPI style */}
                <div className="bg-white border text-center border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 max-w-[200px] mx-auto">
                  <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xl font-bold border border-slate-200/50">
                    [[ QR ]]
                  </div>
                  <span className="text-[9px] uppercase font-bold text-slate-400">Scan to pay ₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {paymentType === 'netbanking' && (
              <div className="space-y-3 p-4 border border-indigo-100 rounded-xl bg-indigo-50/10">
                <label className="text-xs font-bold text-slate-700 block">Select Indian Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full border border-slate-200 bg-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="SBI">State Bank of India (SBI)</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="KOTAK">Kotak Mahindra Bank</option>
                  <option value="PNB">Punjab National Bank</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  You will be securely redirected to your bank portal credentials login page.
                </p>
              </div>
            )}

            {paymentType === 'card' && (
              <div className="space-y-3">
                {/* Visual Credit Card */}
                <div className="relative text-white rounded-2xl h-44 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-5 shadow-xl flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-bold text-indigo-300">VOICE STUDIO INTERNATIONAL</p>
                      <p className="text-xs uppercase text-slate-400 font-medium">Domestic Cards</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-indigo-400 fill-indigo-950/40" />
                  </div>

                  {/* Encrypted/Standard Card Render */}
                  <div className="my-2">
                    <span className="text-sm font-mono tracking-[4px]">
                      {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim().substring(0, 19) : '•••• •••• •••• ••••'}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase leading-none">Cardholder Name</p>
                      <span className="text-xs font-bold tracking-wide uppercase font-mono truncate max-w-[170px] block">
                        {cardName || 'YOUR FULL NAME'}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase leading-none">Expires</p>
                        <span className="text-xs font-bold font-mono">{cardExpiry || 'MM/YY'}</span>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase leading-none">CVV</p>
                        <span className="text-xs font-bold font-mono">{cardCvv || '•••'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="4111 2222 3333 4444"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Sonali Mahajan"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.length === 2 && !val.includes('/')) {
                            val = val + '/';
                          }
                          setCardExpiry(val);
                        }}
                        placeholder="MM/YY"
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-center focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-center focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                id="btn-process-payment-submit"
                disabled={isProcessing}
                className={`flex-1 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing via Razorpay/UPI Sandbox...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 fill-emerald-850" />
                    Complete Hire Checkout (₹{totalPrice.toLocaleString('en-IN')})
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
              🔒 Razorpay Escrow Safe Protection & 256-Bit SSL Enforcements
            </p>
          </form>
        )}

        {/* STEP 3: TRANSACTION COMPLETE */}
        {step === 3 && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-inner">
              <CheckCircle className="w-10 h-10 animate-pulse text-emerald-500" />
            </div>
            
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-xl font-sans">Payment Approved Successfully!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Razorpay sandbox verified. Instant booking confirmation and tax invoice has been dispatched to <strong className="text-slate-700">+91 {clientPhone}</strong>.
              </p>
            </div>

            {/* Custom Interactive Receipt */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left text-xs space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-sans">Transaction Receipt</span>
              <div className="grid grid-cols-2 gap-y-1.5 pt-1 border-t border-slate-100 font-sans">
                <span className="text-slate-500">Invoice Reference:</span>
                <span className="text-slate-800 font-bold font-mono text-right">#VS-{Math.floor(Math.random() * 8899) + 1100}</span>
                
                <span className="text-slate-500">Voice Performer:</span>
                <span className="text-slate-800 font-bold text-right truncate">{actor.name}</span>
                
                <span className="text-slate-500">Project Name:</span>
                <span className="text-slate-800 font-semibold text-right truncate">{projectName}</span>

                <span className="text-slate-500">Selected Mood / Tone:</span>
                <span className="text-indigo-600 font-bold text-right">{selectedMood}</span>
                
                <span className="text-slate-500">Word Count Estimate:</span>
                <span className="text-slate-800 font-mono text-right font-medium">{wordCount} words</span>
                
                <span className="text-slate-500">Amount Charged:</span>
                <span className="text-indigo-600 font-black text-right text-sm">₹{totalPrice.toLocaleString('en-IN')}</span>

                <span className="text-slate-500">Method of Payment:</span>
                <span className="text-slate-600 font-bold text-right uppercase text-[10px]">{paymentType === 'upi' ? `UPI ID (${upiId})` : paymentType === 'netbanking' ? `${selectedBank} NetBanking` : 'Credit/Debit Card'}</span>
              </div>
            </div>

            {/* Step-by-step breakdown of What Happens Next */}
            <div className="border border-slate-100 hover:border-indigo-100 bg-white p-4 rounded-2xl text-left space-y-3 transition-colors">
              <h5 className="text-xs font-black text-slate-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                Instant Studio Operations Flow - What Happens Next?
              </h5>
              
              <div className="space-y-2.5 text-[11px] leading-relaxed">
                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                  <div>
                    <strong className="text-slate-800 block leading-tight font-sans">Queue Dispatch</strong>
                    <span className="text-slate-500">Your custom text script has been synchronized and sent directly to {actor.name}&apos;s vocal queue pipeline.</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                  <div>
                    <strong className="text-slate-800 block leading-tight font-sans">Voice Synthesis & Sound Mixing</strong>
                    <span className="text-slate-500">Under the professional hood, the actor will review the context direction ({selectedMood}) and render studio-grade audio overlays within 24 hours.</span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                  <div>
                    <strong className="text-slate-800 block leading-tight font-sans">Notification Link</strong>
                    <span className="text-slate-500">We will notify you on WhatsApp at +91 {clientPhone} and email with your high-definition export audio files (MP3/WAV format) for download.</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              id="btn-booking-success-finish"
              className="w-full py-3.5 bg-indigo-650 hover:bg-slate-900 transition-colors text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer font-sans active:scale-98"
            >
              Back to Performer Directory
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
