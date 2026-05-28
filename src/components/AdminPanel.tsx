import React, { useState } from 'react';
import { Subscription, Booking, VoiceActor } from '../types';
import { 
  TrendingUp, Users, Coins, BadgePercent, ShieldAlert, Plus, 
  Trash2, RefreshCw, CheckCircle2, FileText, ArrowUpRight 
} from 'lucide-react';

interface AdminPanelProps {
  subscriptionsList: Subscription[];
  bookingsList: Booking[];
  voiceActors: VoiceActor[];
  onAddMockSubscription: (sub: Omit<Subscription, 'id' | 'startedAt' | 'renewalAt'>) => void;
  onAddMockBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status' | 'paymentId'>) => void;
  onResetAdminData: () => void;
  onCancelSubscription: (subId: string) => void;
  onGrantSubscription: (subId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  subscriptionsList,
  bookingsList,
  voiceActors,
  onAddMockSubscription,
  onAddMockBooking,
  onResetAdminData,
  onCancelSubscription,
  onGrantSubscription
}) => {
  const [mockName, setMockName] = useState<string>('');
  const [mockEmail, setMockEmail] = useState<string>('');
  const [mockPlan, setMockPlan] = useState<string>('plan-pro');
  const [mockBilling, setMockBilling] = useState<'monthly' | 'yearly'>('monthly');

  // Calculate administrative metrics in Indian Rupees (INR)
  const totalSubEarnings = subscriptionsList.reduce((acc, curr) => {
    // Treat active subscription prices towards revenue
    return curr.status === 'active' ? acc + curr.price : acc;
  }, 0);
  const totalBookingEarnings = bookingsList.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalEarnings = totalSubEarnings + totalBookingEarnings;

  const totalUsers = subscriptionsList.length + 8; // Simulated general visitors
  const conversionRate = totalUsers > 0 ? ((subscriptionsList.filter(s => s.status === 'active').length / totalUsers) * 105) : 12.5;
  
  const activeSubsCount = subscriptionsList.filter(s => s.status === 'active').length;

  const handleSimulateSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName.trim() || !mockEmail.trim()) {
      alert('Please fill out Name and Email fields for subscription grant.');
      return;
    }

    const priceMap: { [key: string]: { name: string; price: number } } = {
      'plan-starter': { name: 'Starter Voice', price: mockBilling === 'monthly' ? 499 : 399 },
      'plan-pro': { name: 'Professional Studio', price: mockBilling === 'monthly' ? 1299 : 999 },
      'plan-enterprise': { name: 'Enterprise Agency', price: mockBilling === 'monthly' ? 2999 : 2399 }
    };

    const target = priceMap[mockPlan];

    onAddMockSubscription({
      userName: mockName,
      userEmail: mockEmail,
      planId: mockPlan,
      planName: target.name,
      price: target.price,
      status: 'active',
      billingFrequency: mockBilling
    });

    // Reset fields
    setMockName('');
    setMockEmail('');
  };

  const handleQuickAddSale = () => {
    const randomActors = voiceActors;
    const actor = randomActors[Math.floor(Math.random() * randomActors.length)];
    const randomAmount = Math.floor(Math.random() * 8000) + 1500;
    const randomNames = ['Sonali Mahajan', 'David Miller', 'Rebecca Lawson', 'Yuki Tanaka', 'Sarah Connor'];
    const randomProjects = ['SaaS Explainer Bumper', 'Yoga App Ambient Intro', 'Epic Mobile Fighter Game Voiceover', 'Commercial Car Launch Spot'];
    
    onAddMockBooking({
      actorId: actor.id,
      actorName: actor.name,
      clientName: randomNames[Math.floor(Math.random() * randomNames.length)],
      clientEmail: 'client@studio-sim.com',
      projectName: randomProjects[Math.floor(Math.random() * randomProjects.length)],
      scriptText: 'This is a simulated transaction representing automated billing and direct hired actor work.',
      selectedMood: 'Conversational',
      wordCount: Math.floor(randomAmount / actor.perWordRate),
      totalCost: randomAmount,
      audioGeneratedUrl: 'mock-audio'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Earnings Card */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none">Gross Revenue</span>
            <h4 className="text-2xl font-black text-slate-800">₹{totalEarnings.toLocaleString('en-IN')}</h4>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +14.8% vs last month
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shadow-inner">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        {/* Active Subscribers Card */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none">Subscribers</span>
            <h4 className="text-2xl font-black text-slate-800">{activeSubsCount} <span className="text-xs text-slate-400 font-normal">active</span></h4>
            <span className="text-[10px] text-indigo-600 font-semibold">
              ₹{totalSubEarnings.toLocaleString('en-IN')} Recurring MRR
            </span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Project Bookings Card */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none">Individual Orders</span>
            <h4 className="text-2xl font-black text-slate-800">{bookingsList.length} <span className="text-xs text-slate-400 font-normal">Hires</span></h4>
            <span className="text-[10px] text-slate-500 font-semibold">
              ₹{totalBookingEarnings.toLocaleString('en-IN')} Escrow payouts
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest leading-none">Conversion Rate</span>
            <h4 className="text-2xl font-black text-slate-800">{conversionRate.toFixed(1)}%</h4>
            <span className="text-[10px] text-slate-500">
              {subscriptionsList.filter(s => s.status === 'active').length} active / {totalUsers} visitors
            </span>
          </div>
          <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center border border-pink-100 shadow-inner">
            <BadgePercent className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Stats Charts & Control Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Earnings chart area */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl lg:col-span-2 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-base font-sans">Monthly Earnings Trend</h3>
              <p className="text-xs text-slate-400 font-sans">Total processed revenue generated in INR</p>
            </div>
            <span className="text-xs bg-slate-100 border border-slate-200 py-1 px-2.5 rounded-lg text-slate-600 font-semibold">2026 Year-to-Date</span>
          </div>

          {/* Visualizing dynamic analytics with clean SVG vectors */}
          <div className="relative h-48 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-end justify-between h-36 pt-4 px-2">
              {[
                { m: 'Jan', v: '24000', h: '30%' },
                { m: 'Feb', v: '48000', h: '45%' },
                { m: 'Mar', v: '75000', h: '62%' },
                { m: 'Apr', v: '99000', h: '88%' },
                { m: 'May', v: totalEarnings.toString(), h: '100%', active: true }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <div className="text-[10px] text-slate-400 font-semibold mb-1 opacity-100 transition-opacity">
                    ₹{parseFloat(item.v).toLocaleString('en-IN')}
                  </div>
                  <div className="w-10 bg-slate-200 rounded-t-lg transition-all duration-500 relative overflow-hidden" 
                       style={{ height: `${parseInt(item.h) * 0.9}px` }}>
                    <div className={`absolute inset-0 bg-gradient-to-t ${item.active ? 'from-indigo-600 to-indigo-400' : 'from-slate-400 to-slate-200'} rounded-t-lg`} />
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${item.active ? 'text-indigo-600 font-black' : 'text-slate-500'}`}>
                    {item.m}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-slate-100/90 pt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>* Private sandbox billing engine simulation tools loaded</span>
              <span className="font-medium text-indigo-500 flex items-center gap-0.5">
                Valuation Estimate: ₹{(totalEarnings * 12).toLocaleString('en-IN')}/yr ARR
              </span>
            </div>
          </div>
        </div>

        {/* Quick Simulations Sandbox */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between border border-indigo-950">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400 animate-pulse" />
              <h4 className="font-bold text-slate-100 text-base font-sans">Direct Grant Subscription Tool</h4>
            </div>
            <p className="text-slate-350 text-xs leading-relaxed font-sans">
              Admin bypass tool to directly assign any customer name and mobile/email address an active subscription immediately!
            </p>

            {/* Quick checkout form */}
            <form onSubmit={handleSimulateSubscriber} className="space-y-2.5 pt-1">
              <input
                type="text"
                required
                placeholder="Name (e.g., Sonali Mahajan)"
                value={mockName}
                onChange={(e) => setMockName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600"
              />
              <input
                type="email"
                required
                placeholder="Email (e.g., mail@8208152171.com)"
                value={mockEmail}
                onChange={(e) => setMockEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-600"
              />

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-800 font-medium">
                <select
                  value={mockPlan}
                  onChange={(e) => setMockPlan(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="plan-starter">Starter (₹499)</option>
                  <option value="plan-pro">Professional (₹1,299)</option>
                  <option value="plan-enterprise font-sans">Enterprise (₹2,999)</option>
                </select>
                
                <select
                  value={mockBilling}
                  onChange={(e) => setMockBilling(e.target.value as 'monthly' | 'yearly')}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-2 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <button
                type="submit"
                id="btn-admin-add-sub-sim"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer font-sans"
              >
                <Plus className="w-3.5 h-3.5" />
                Direct Grant Active Plan
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-2 mt-4 text-xs font-semibold">
            <button
              onClick={handleQuickAddSale}
              id="btn-admin-add-sale-sim"
              className="w-full py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              Simulate Direct Studio Booking Sale
            </button>

            <button
              onClick={onResetAdminData}
              id="btn-admin-reset-data"
              className="w-full py-2 text-rose-450 hover:bg-rose-950/40 border border-transparent hover:border-red-900/35 rounded-xl transition-all text-center flex items-center justify-center gap-1 cursor-pointer text-red-400"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Stats & Database
            </button>
          </div>
        </div>

      </div>

      {/* User subscriptions and Bookings tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Subscribers Audit Log */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-150 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm font-sans">Customer Subscriptions Registry</h4>
              <p className="text-[10px] text-slate-400 font-sans">Admin console to directly cancel or give users active premium access</p>
            </div>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-indigo-700 font-bold">
              {subscriptionsList.length} Accounts Registered
            </span>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            {subscriptionsList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-sans">No subscriber history inside local storage yet. Use the Direct Grant form to inject records.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold">
                    <th className="p-3.5 pl-5">User Account</th>
                    <th className="p-3.5">Tier Plan</th>
                    <th className="p-3.5 text-right">Fee Rate</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {subscriptionsList.map((sub, idx) => {
                    const isActive = sub.status === 'active';
                    return (
                      <tr key={sub.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="font-medium text-slate-800 font-sans">{sub.userName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sub.userEmail}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-indigo-600">
                          {sub.planName}
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-normal text-left">
                            {sub.billingFrequency === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right text-slate-800 font-bold font-mono">
                          ₹{sub.price.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 py-0.5 px-2 rounded-full font-bold text-[10px]">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-100 py-0.5 px-2 rounded-full font-bold text-[10px]">
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          {isActive ? (
                            <button
                              onClick={() => onCancelSubscription(sub.id)}
                              className="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 font-black px-2 py-1 rounded transition-colors border border-red-200 cursor-pointer"
                              title="Instantly terminate user privileges"
                            >
                              Cancel Sub
                            </button>
                          ) : (
                            <button
                              onClick={() => onGrantSubscription(sub.id)}
                              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded transition-colors border border-emerald-200 cursor-pointer"
                              title="Renew and grant immediately"
                            >
                              Grant Active
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Direct Voice Bookings Audit Log */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-150 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm font-sans">Escrow Direct Booking Sales</h4>
              <p className="text-[10px] text-slate-400 font-sans">Track current direct performer hires, calculated word charges, and project metadata</p>
            </div>
            <span className="text-[10px] bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-amber-700 font-bold">
              {bookingsList.length} Bookings Hired
            </span>
          </div>

          <div className="overflow-x-auto">
            {bookingsList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-sans">No direct custom hires or bookings recorded yet.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold">
                    <th className="p-3.5 pl-5">Project details</th>
                    <th className="p-3.5">Assigned Performer</th>
                    <th className="p-3.5 text-right">Dialog count</th>
                    <th className="p-3.5 pr-5 text-right">Fee Escrow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {bookingsList.map((booking, idx) => (
                    <tr key={booking.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-semibold text-slate-800 truncate max-w-[150px] font-sans">{booking.projectName}</div>
                        <div className="text-[10px] text-slate-450 truncate max-w-[150px] font-mono">{booking.clientName} ({booking.clientEmail})</div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">
                        {booking.actorName}
                        <span className="text-[9px] uppercase tracking-wider text-emerald-600 block leading-tight font-bold">
                          Razorpay Approved
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-500">
                        {booking.wordCount} words
                      </td>
                      <td className="p-3.5 pr-5 text-right text-slate-800 font-black text-indigo-600 font-mono">
                        ₹{booking.totalCost.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* DYNAMIC GATEWAY SETTLEMENT MODULE & HOW PAYMENTS TRANSFER TO OWNER */}
      <div id="payment-gateway-setup-panel" className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div>
            <span className="text-[10px] bg-indigo-100 border border-indigo-250 text-indigo-700 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider font-mono">
              Live Escrow Settings
            </span>
            <h3 className="font-sans font-black text-slate-900 text-lg mt-1">Payment Settlement Dashboard</h3>
            <p className="text-slate-500 text-xs">Configure your Google Pay, Paytm UPI, and Razorpay API details to receive direct client funds instantly.</p>
          </div>
          
          <div className="flex bg-white shadow-xs p-1.5 border border-slate-100 rounded-xl font-sans text-xs shrink-0 self-end md:self-auto">
            <span className="bg-indigo-600 text-white font-bold py-1 px-3.5 rounded-lg">Indian Rupees (INR) Base</span>
            <span className="text-slate-400 py-1 px-3.5 font-medium">Automatic Settlement T+1</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Configured Merchant Details */}
          <div className="bg-white border border-slate-150 p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">1. Account Information</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Add your local UPI ID and details to receive instant bank notification alerts whenever clients register or pre-book custom projects.
              </p>
              
              <div className="space-y-2 pt-1 font-sans">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Your Destination UPI ID*</label>
                  <input
                    type="text"
                    defaultValue="8208152171@paytm"
                    placeholder="Enter your UPI (e.g., cellNo@paytm)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 md:p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-800 font-bold font-mono"
                  />
                  <span className="text-[8.5px] text-emerald-600 font-medium block mt-0.5">● Active for instant direct escrow transfers</span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Razorpay Key ID</label>
                  <input
                    type="text"
                    defaultValue="rzp_live_920831Mahajan52"
                    placeholder="rzp_live_xxxxxxxxxxxx"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Your Direct Bank (Settlements)</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold cursor-pointer">
                    <option>Paytm Payments Bank / UPI Account</option>
                    <option>State Bank of India (India)</option>
                    <option>HDFC Bank Ltd.</option>
                    <option>ICICI Bank Ltd.</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-120/40 text-[10px] text-indigo-800 leading-snug">
              <strong>💡 Pro Tip:</strong> Change inputs to customize settlement destinations dynamically in real-time.
            </div>
          </div>

          {/* Column 2: How Client Payment Reaches You */}
          <div className="bg-white border border-slate-150 p-5 rounded-2xl space-y-4 lg:col-span-2">
            <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider font-sans">2. Customer Transfer Flow - How Money Reaches Your Pocket</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 text-[11px] font-sans leading-relaxed">
              
              <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-150 text-indigo-700 font-black text-[10px] flex items-center justify-center">
                  A
                </div>
                <strong className="text-slate-800 block text-xs">Customer Pays (UPI/Card)</strong>
                <p className="text-slate-500">
                  When a client chooses a plan or book a voice artist, they enter their mobile phone and pay securely via payment modal (UPI apps like Paytm, GPay, PhonePe, or cards).
                </p>
              </div>

              <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-150 text-emerald-800 font-black text-[10px] flex items-center justify-center">
                  B
                </div>
                <strong className="text-slate-800 block text-xs">Razorpay Aggregator</strong>
                <p className="text-slate-500">
                  The integrated API clears simulated and live payments, confirming authorized success in milliseconds, then assigns the active VIP status and projects directory instantly.
                </p>
              </div>

              <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-150 text-amber-800 font-black text-[10px] flex items-center justify-center">
                  C
                </div>
                <strong className="text-slate-800 block text-xs">T+1 Direct Deposit!</strong>
                <p className="text-slate-500 font-medium">
                  Money settles straight into your bank/UPI endpoint (<strong className="text-slate-700">8208152171@paytm</strong>) without middle-man manual delays. You will receive SMS alerts instantly!
                </p>
              </div>

            </div>

            {/* Visual routing flowchart illustration with icons */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <div className="p-1 px-1.5 bg-slate-800 border-slate-700/80 rounded font-bold text-center">
                  🛒 Client UI Invoice
                </div>
                <span className="text-indigo-400">➔</span>
                <div className="p-1 px-1.5 bg-indigo-900 border-indigo-700/80 rounded font-bold text-center">
                  💳 Razorpay Sandbox
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-800/50 py-1 px-2.5 rounded text-emerald-400 text-[9px]">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                Securely Escrow Routing Triggered
              </div>

              <div className="flex items-center gap-2">
                <span className="text-indigo-450">➔</span>
                <div className="p-1 px-2 bg-emerald-600 text-white rounded font-bold text-center">
                  🏦 Sonali Mahajan Account (8208152171)
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
