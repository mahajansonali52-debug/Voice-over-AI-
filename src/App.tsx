import { useState, useEffect, useRef } from 'react';
import { VoiceActor, Booking, Subscription, SubscriptionPlan } from './types';
import { VOICE_ACTORS, SUBSCRIPTION_PLANS, DEMO_SCRIPTS } from './voiceActorsData';
import { VoiceActorCard } from './components/VoiceActorCard';
import { AudioPreviewArea } from './components/AudioPreviewArea';
import { BookingFormModal } from './components/BookingFormModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPanel } from './components/AdminPanel';
import { 
  Sparkles, ShieldCheck, ClipboardList, Coins, Search, Layers, Check, 
  Tv, Volume2, User, Star, CreditCard, ChevronRight, CheckCircle2, CloudLightning, Music, ArrowRight, Play, Square, Timer 
} from 'lucide-react';

// Authentic Firebase Integrations
import { auth, db, googleProvider, signInWithPopup, signOut, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, getDocFromServer } from 'firebase/firestore';


export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'browse' | 'projects' | 'plans' | 'admin'>('browse');

  // Search/Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Google OAuth / custom google login states
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; avatarUrl?: string } | null>(null);
  const [showGoogleLoginModal, setShowGoogleLoginModal] = useState<boolean>(false);

  // Shared application data state (with beautiful pre-populated mock details)
  const [voiceActorsList] = useState<VoiceActor[]>(VOICE_ACTORS);
  const [subscriptionsHistory, setSubscriptionsHistory] = useState<Subscription[]>([
    {
      id: 'sub-1',
      userName: 'Isabelle Dubois',
      userEmail: 'isabelle@vogue-creative.fr',
      planId: 'plan-enterprise',
      planName: 'Enterprise Agency',
      price: 2999,
      status: 'active',
      startedAt: '2026-05-12T10:00:00Z',
      renewalAt: '2026-06-12T10:00:00Z',
      billingFrequency: 'monthly'
    },
    {
      id: 'sub-2',
      userName: 'Robert Vance',
      userEmail: 'rob@techforge-studios.ca',
      planId: 'plan-pro',
      planName: 'Professional Studio',
      price: 999,
      status: 'active',
      startedAt: '2026-05-18T14:30:00Z',
      renewalAt: '2027-05-18T14:30:00Z',
      billingFrequency: 'yearly'
    },
    {
      id: 'sub-3',
      userName: 'Sarah Jenkins',
      userEmail: 'sarah@elearn-academy.com',
      planId: 'plan-starter',
      planName: 'Starter Voice',
      price: 499,
      status: 'active',
      startedAt: '2026-05-22T08:15:00Z',
      renewalAt: '2026-06-22T08:15:00Z',
      billingFrequency: 'monthly'
    }
  ]);

  const [bookingsHistory, setBookingsHistory] = useState<Booking[]>([
    {
      id: 'book-1',
      actorId: 'actor-chloe',
      actorName: 'Chloe Bennet',
      clientName: 'Alexander Price',
      clientEmail: 'al@pricemedia.co',
      projectName: 'Aura Sedan Social Commercial Promo',
      scriptText: 'Welcome to the driver\'s seat of the all-new Aura Electric luxury sedan.',
      selectedMood: 'Sleek & Professional',
      wordCount: 120,
      totalCost: 1440, // 120 * ₹12/word
      status: 'completed',
      createdAt: '2026-05-24T09:30:00Z',
      paymentId: 'ch_stripe_mock_889aZ1',
      audioGeneratedUrl: 'download-file-1'
    },
    {
      id: 'book-2',
      actorId: 'actor-ethan',
      actorName: 'Ethan Brooks',
      clientName: 'Diana Prince',
      clientEmail: 'diana@amazon-books.com',
      projectName: 'Epic Space Odyssey Audiobook Trailer',
      scriptText: 'In the furthest reaches of the Andromeda nebula, a signal was received...',
      selectedMood: 'Epic & Commanding',
      wordCount: 185,
      totalCost: 2775, // 185 * ₹15/word
      status: 'in_progress',
      createdAt: '2026-05-26T16:45:00Z',
      paymentId: 'ch_stripe_mock_311bY2'
    }
  ]);

  // Current active user configurations
  const [currentUserSubscription, setCurrentUserSubscription] = useState<Subscription | null>(null);

  // Studio Player laboratory state
  const [selectedActor, setSelectedActor] = useState<VoiceActor | null>(VOICE_ACTORS[0]);
  const [activeScriptText, setActiveScriptText] = useState<string>('');
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
  const [activeDemoId, setActiveDemoId] = useState<string | undefined>(undefined);

  // Modals / Overlays triggers
  const [selectedActorForBooking, setSelectedActorForBooking] = useState<VoiceActor | null>(null);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [selectedPlanBilling, setSelectedPlanBilling] = useState<'monthly' | 'yearly'>('monthly');

  // Trigger automated billing popup state
  const [showAutoBillingPopup, setShowAutoBillingPopup] = useState<boolean>(false);

  // 10-Minute Trial Timer for Trial Actors (Chloe, Ethan)
  // 10 minutes = 600 seconds
  const [trialSecondsLeft, setTrialSecondsLeft] = useState<number>(600);
  const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
  const [isTrialExpired, setIsTrialExpired] = useState<boolean>(false);

  // Dynamic Script Estimator widget states (delightful new pre-calculated feature)
  const [calculatorScriptText, setCalculatorScriptText] = useState<string>('Welcome to VoiceOver Studio! This live calculator predicts exact word counts, vocal rendering speeds, and real-time project quotes in Indian Rupees (INR) across our talented roster.');
  const [calculatorSelectedSpeed, setCalculatorSelectedSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const trialTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Countdowns ticking effect
  useEffect(() => {
    if (isTrialActive && trialSecondsLeft > 0) {
      trialTimerRef.current = setTimeout(() => {
        setTrialSecondsLeft(prev => {
          if (prev <= 1) {
            handleTrialExpiration(); // trigger prompt
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (trialTimerRef.current) {
        clearTimeout(trialTimerRef.current);
      }
    }

    return () => {
      if (trialTimerRef.current) {
        clearTimeout(trialTimerRef.current);
      }
    };
  }, [isTrialActive, trialSecondsLeft]);

  // Validate Connection to Firestore on initial boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Listen to Google Authentication State Changes with Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          email: user.email || '',
          name: user.displayName || user.email?.split('@')[0] || 'User',
          avatarUrl: user.photoURL || undefined
        });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync historical subscriptions and bookings in real-time straight from Firestore
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;

    // 1. Listen to Subscriptions matching user's email
    const subsPath = 'subscriptions';
    const subQuery = query(collection(db, subsPath), where('userEmail', '==', currentUser.email));
    
    const unsubscribeSubs = onSnapshot(subQuery, (snapshot) => {
      const loadedSubs: Subscription[] = [];
      snapshot.forEach((docSnap) => {
        loadedSubs.push({ id: docSnap.id, ...docSnap.data() } as Subscription);
      });
      
      const active = loadedSubs.find(s => s.status === 'active');
      if (active) {
        setCurrentUserSubscription(active);
      } else if (currentUser.email === 'mahajansonali52@gmail.com') {
        // Automatically grant FREE premium subscription to owner with email mahajansonali52@gmail.com
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 25);
        const ownerSub: Subscription = {
          id: 'sub-owner-free-lifetime',
          userName: currentUser.name,
          userEmail: currentUser.email,
          planId: 'plan-enterprise',
          planName: 'Enterprise Agency (Owner Free Access)',
          price: 0,
          status: 'active',
          startedAt: new Date().toISOString(),
          renewalAt: expiryDate.toISOString(),
          billingFrequency: 'yearly'
        };
        setCurrentUserSubscription(ownerSub);
      } else {
        setCurrentUserSubscription(null);
      }

      setSubscriptionsHistory(prev => {
        const filteredPrev = prev.filter(s => !s.id.startsWith('sub-') || s.id === 'sub-owner-free-lifetime');
        return [...loadedSubs, ...filteredPrev];
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, subsPath);
    });

    // 2. Listen to Bookings matching user's email
    const bookingsPath = 'bookings';
    const bookingQuery = query(collection(db, bookingsPath), where('userEmail', '==', currentUser.email));
    const unsubscribeBookings = onSnapshot(bookingQuery, (snapshot) => {
      const loadedBookings: Booking[] = [];
      snapshot.forEach((docSnap) => {
        loadedBookings.push({ id: docSnap.id, ...docSnap.data() } as Booking);
      });
      setBookingsHistory(prev => {
        const filteredPrev = prev.filter(b => !b.id.startsWith('book-'));
        return [...loadedBookings, ...filteredPrev];
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, bookingsPath);
    });

    return () => {
      unsubscribeSubs();
      unsubscribeBookings();
    };
  }, [currentUser]);

  // Automatically grant FREE premium subscription to owner with email mahajansonali52@gmail.com
  useEffect(() => {
    if (currentUser && currentUser.email === 'mahajansonali52@gmail.com') {
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 25); // 25 years of absolute Free Lifetime Access!
      const ownerSub: Subscription = {
        id: 'sub-owner-free-lifetime',
        userName: currentUser.name,
        userEmail: currentUser.email,
        planId: 'plan-enterprise',
        planName: 'Enterprise Agency (Owner Free Access)',
        price: 0,
        status: 'active',
        startedAt: new Date().toISOString(),
        renewalAt: expiryDate.toISOString(),
        billingFrequency: 'yearly'
      };

      setCurrentUserSubscription(ownerSub);

      // Add to subscriptions history if not already there
      setSubscriptionsHistory(prev => {
        if (!prev.some(s => s.id === 'sub-owner-free-lifetime')) {
          return [ownerSub, ...prev];
        } else {
          return prev.map(s => s.id === 'sub-owner-free-lifetime' ? { ...s, status: 'active' as const } : s);
        }
      });
    }
  }, [currentUser]);

  // Handle automatic trial completion
  const handleTrialExpiration = () => {
    setIsTrialActive(false);
    setIsTrialExpired(true);
    setIsPlayingDemo(false);
    window.speechSynthesis.cancel();
    setShowAutoBillingPopup(true);
  };

  // Skip / Fast-forward simulation tool
  const triggerFastUpgradeSim = () => {
    setTrialSecondsLeft(0);
    handleTrialExpiration();
  };

  // Performers Speech Synthesis preview engine
  const handleSynthesizeScript = (textToRead: string, actor: VoiceActor) => {
    // 1. Cancel previous vocals
    window.speechSynthesis.cancel();
    setIsPlayingDemo(true);

    // 2. Adjust Trial timer logic
    if (actor.isTrialActor) {
      if (isTrialExpired) {
        setShowAutoBillingPopup(true);
        setIsPlayingDemo(false);
        return;
      }
      setIsTrialActive(true); // Begin countdown ticking!
    } else {
      // Non-trial actors require subscription
      if (!currentUserSubscription) {
        alert('Requires Subscription. Please enroll in a Starter or Professional Studio package to demo premium voices!');
        setIsPlayingDemo(false);
        return;
      }
    }

    // 3. System Speech synthesis setup
    const speechText = textToRead || "No dialogue text has been configured. Play script.";
    const utterance = new SpeechSynthesisUtterance(speechText);

    // Try to match matching sound presets
    const voices = window.speechSynthesis.getVoices();
    let matchingVoice = null;

    if (actor.gender === 'Female') {
      matchingVoice = voices.find(v => 
        v.lang.includes('en') && 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('zira') || 
         v.name.toLowerCase().includes('google us english') || 
         v.name.toLowerCase().includes('samantha'))
      );
    } else {
      matchingVoice = voices.find(v => 
        v.lang.includes('en') && 
        (v.name.toLowerCase().includes('male') || 
         v.name.toLowerCase().includes('david') || 
         v.name.toLowerCase().includes('google uk english male') || 
         v.name.toLowerCase().includes('hazel'))
      );
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    // Custom voice profiling based on metadata
    if (actor.id === 'actor-ethan') {
      utterance.pitch = 0.8; // Low commanding baritone accent
      utterance.rate = 0.95;
    } else if (actor.id === 'actor-chloe') {
      utterance.pitch = 1.05; // Bright friendly
      utterance.rate = 1.05;
    } else if (actor.id === 'actor-emily') {
      utterance.pitch = 0.98; // Peaceful breathe
      utterance.rate = 0.75; // Low pace
    } else if (actor.id === 'actor-marcus') {
      utterance.pitch = 1.0; 
      utterance.rate = 1.25; // Rushed commercial pace
    }

    utterance.onend = () => {
      setIsPlayingDemo(false);
      setActiveDemoId(undefined);
    };

    utterance.onerror = (err) => {
      console.warn("Speech Synthesis error/interrupted:", err);
      // Fallback: visual wave playing still bouncily, and trigger automated timer timeout simulation gracefully
      setTimeout(() => {
        setIsPlayingDemo(false);
        setActiveDemoId(undefined);
      }, 5000);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopVocalPlay = () => {
    window.speechSynthesis.cancel();
    setIsPlayingDemo(false);
    setActiveDemoId(undefined);
  };

  // Direct script play buttons in VoiceActor cards
  const handleCardPlayDemo = (actor: VoiceActor, scriptId?: string) => {
    // Select this actor
    setSelectedActor(actor);
    
    // Check if locked
    if (!actor.isTrialActor && !currentUserSubscription) {
      setSelectedPlanForCheckout(SUBSCRIPTION_PLANS[1]);
      return;
    }

    // If specific script chosen
    if (scriptId) {
      const targetScriptObj = actor.demosList.find(s => s.id === scriptId);
      if (targetScriptObj) {
        setActiveScriptText(targetScriptObj.scriptText);
        setActiveDemoId(scriptId);
        handleSynthesizeScript(targetScriptObj.scriptText, actor);
      }
    } else {
      // Play default bio greeting speech
      const greeting = `Hi there! I am ${actor.name}. ${actor.bio}`;
      setActiveDemoId(undefined);
      handleSynthesizeScript(greeting, actor);
    }
  };

  // Form Booking updates
  const handleAddNewBooking = async (newBookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'paymentId'>) => {
    const bookingId = `book-${Date.now()}`;
    const freshBooking: Booking = {
      ...newBookingData,
      id: bookingId,
      createdAt: new Date().toISOString(),
      status: 'completed', // Real-time generated and paid
      paymentId: `ch_stripe_live_${Math.floor(Math.random() * 9999) + 1000}`
    };

    if (currentUser && currentUser.email) {
      const pth = 'bookings';
      try {
        await setDoc(doc(db, pth, bookingId), freshBooking);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pth}/${bookingId}`);
      }
    }

    setBookingsHistory(prev => [freshBooking, ...prev]);
    setSelectedActorForBooking(null);
    setActiveTab('projects'); // switch workspace to check booked downloads!
  };

  // Form subscriptions updates
  const handleSubscriptionAcquired = async (plan: SubscriptionPlan, billing: 'monthly' | 'yearly') => {
    const rate = billing === 'monthly' ? plan.price : plan.priceYearly;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const subId = `sub-${Date.now()}`;
    const subscriptionPayload: Subscription = {
      id: subId,
      userName: currentUser ? currentUser.name : 'Sonali Mahajan',
      userEmail: currentUser ? currentUser.email : 'mahajansonali52@gmail.com', // Active User Email From Metadata
      planId: plan.id,
      planName: plan.name,
      price: rate,
      status: 'active',
      startedAt: new Date().toISOString(),
      renewalAt: expiryDate.toISOString(),
      billingFrequency: billing
    };

    if (currentUser && currentUser.email) {
      const pth = 'subscriptions';
      try {
        await setDoc(doc(db, pth, subId), subscriptionPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${pth}/${subId}`);
      }
    }

    setCurrentUserSubscription(subscriptionPayload);
    setSubscriptionsHistory(prev => [subscriptionPayload, ...prev]);
    setSelectedPlanForCheckout(null);
    setShowAutoBillingPopup(false);
  };

  const handleGoogleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      if (activeTab === 'admin') {
        setActiveTab('browse');
      }
    } catch (err) {
      console.error("Firebase Signout Error:", err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowGoogleLoginModal(false);
    } catch (err) {
      console.error("Firebase Auth Sign-In Error:", err);
    }
  };

  const handleResetData = () => {
    setCurrentUserSubscription(null);
    setSubscriptionsHistory([]);
    setBookingsHistory([]);
    setTrialSecondsLeft(600);
    setIsTrialActive(false);
    setIsTrialExpired(false);
    setShowAutoBillingPopup(false);
  };

  const handleCancelSubscriptionInAdmin = (subId: string) => {
    setSubscriptionsHistory(prev =>
      prev.map(sub => sub.id === subId ? { ...sub, status: 'cancelled' as const } : sub)
    );
    // Suppress current user subscription privileges if it represents them
    setCurrentUserSubscription(prev => 
      prev && prev.id === subId ? { ...prev, status: 'cancelled' as const } : prev
    );
  };

  const handleGrantSubscriptionInAdmin = (subId: string) => {
    setSubscriptionsHistory(prev =>
      prev.map(sub => sub.id === subId ? { ...sub, status: 'active' as const } : sub)
    );
    // Re-grant current user subscription privileges if it represents them
    setCurrentUserSubscription(prev => 
      prev && prev.id === subId ? { ...prev, status: 'active' as const } : prev
    );
  };

  // Filter list of voice actors
  const filteredVoiceActors = voiceActorsList.filter(actor => {
    const matchesSearch = 
      actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actor.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actor.vocalTone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actor.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGender = selectedGender === 'All' || actor.gender === selectedGender;
    
    const matchesTag = selectedTag === 'All' || actor.tags.includes(selectedTag);

    return matchesSearch && matchesGender && matchesTag;
  });

  // Extract all unique tags across performers for filter capsules
  const allActorTags = Array.from(new Set(voiceActorsList.flatMap(actor => actor.tags)));

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-indigo-650 selection:text-white antialiased">
        {/* Sign In Header banner */}
        <header className="bg-white border-b border-slate-100 py-5 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-150">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <strong className="text-slate-800 text-sm font-black block leading-none font-sans uppercase tracking-wider">VoiceOver</strong>
                <span className="text-[10px] text-indigo-605 font-bold tracking-widest uppercase">Escrow Studio</span>
              </div>
            </div>
            
            <div className="text-[11px] font-mono text-slate-400">
              Gateway v2.0 (Verified Secure)
            </div>
          </div>
        </header>

        {/* Dynamic authentic full page Sign-In container with features checklist */}
        <main className="flex-grow max-w-7xl mx-auto w-full px-6 flex items-center justify-center py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full max-w-5xl">
            {/* Left Column: Visual branding & details */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase py-1 px-3 rounded-full border border-indigo-120 tracking-wider">
                <Sparkles className="w-3 h-3 text-indigo-505 animate-pulse" />
                Indian Escrow Voice Marketplace
              </span>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none font-sans">
                Premium Studio Voiceovers, <span className="text-indigo-600 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">Direct Settlements</span>.
              </h1>
              
              <p className="text-slate-505 text-sm leading-relaxed max-w-md font-sans">
                Pre-book real-time voice actors, customize scripts, track instant Indian Rupee (INR) settlements, and obtain professional voice synthesis exports under 24 hours.
              </p>

              {/* Polished interactive grid items checking standard credentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Secure Sign-In</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">We use official Google Authenticator for identity claims and project locks.</p>
                  </div>
                </div>

                <div className="flex gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 font-sans">Direct Settlements</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-relaxed">No agency cuts. Customer booking payments route instantly matching account UPI IDs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Clean sign-in card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white rounded-3xl border border-slate-105 shadow-xl p-8 w-full max-w-sm space-y-6 text-center">
                <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                  <Music className="w-8 h-8 animate-pulse text-indigo-500" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-950 text-xl font-sans">Authorize Access</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Sign in securely with Google to search voice performer rosters, use budget tools, and make sandbox payments.
                  </p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  id="btn-google-sign-in-landing"
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-3.5 px-4 rounded-2xl transition-all shadow-md active:scale-98 cursor-pointer text-xs"
                >
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.66-.75-1.18-1.74-1.51-2.69z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Sign In with Google
                </button>

                <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 leading-snug">
                  🛡️ Real Google Sign-In managed by <strong className="text-zinc-650">Firebase Authentication</strong> secure sandbox parameters. We do not store Google credentials.
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Dynamic authentic footer info */}
        <footer className="bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          <p>© 2026 VoiceOver Escrow Studio. Engineered for direct secure settlements with verified Firebase integration.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white antialiased">
      
      {/* ⚠️ TRIAL WARNING GLOBAL INDICATOR BAR */}
      {isTrialActive && !currentUserSubscription && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-white text-xs py-2 px-4 shadow-inner text-center flex items-center justify-center gap-3 font-semibold transition-all">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>
            Active Trial Sessions Running: Live counting script preview. Trial limits conclude in{' '}
            <strong className="font-mono text-sm bg-slate-900/40 px-1.5 py-0.5 rounded">
              {Math.floor(trialSecondsLeft / 60)}:{(trialSecondsLeft % 60).toString().padStart(2, '0')}
            </strong>
          </span>
          <button
            onClick={triggerFastUpgradeSim}
            className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold uppercase rounded py-0.5 px-2 transition-all cursor-pointer"
          >
            Force Fast Expiry
          </button>
        </div>
      )}

      {/* Main Header navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-extrabold shadow-md shadow-indigo-200">
              <span className="text-xl">V</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-slate-800 text-base leading-tight tracking-tight">VoiceOver Studio</h1>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-extrabold rounded py-0.5 px-1.5 uppercase tracking-wide">Marketplace</span>
              </div>
              <p className="text-[10px] text-slate-450 leading-none">Hire & Streamline Voice Talents Instantly</p>
            </div>
          </div>

          {/* Nav Tabs list */}
          <nav className="flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold text-slate-500">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer ${activeTab === 'browse' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'hover:text-slate-800'}`}
            >
              Browse Talents
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${activeTab === 'projects' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'hover:text-slate-800'}`}
            >
              Client Projects
              {bookingsHistory.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                  {bookingsHistory.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer ${activeTab === 'plans' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'hover:text-slate-800'}`}
            >
              Studio Pricing
            </button>
            {currentUser?.email === 'mahajansonali52@gmail.com' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-2 px-3.5 rounded-xl transition-all border border-transparent hover:border-slate-200 cursor-pointer text-slate-600 font-bold flex items-center gap-1 ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-sm font-black' : ''}`}
                id="btn-admin-tab-nav"
              >
                Admin Dashboard
              </button>
            )}
          </nav>

          {/* User profile capsule or trial badge or Google auth state */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {currentUserSubscription ? (
                  <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl py-1.5 px-3">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-bold text-emerald-800">{currentUserSubscription.planName}</span>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl py-1.5 px-3">
                    <Timer className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] text-slate-600 font-mono font-bold">
                      Trial: {Math.floor(trialSecondsLeft / 60)}:{(trialSecondsLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                <div id="google-user-capsule" className="flex items-center gap-2 bg-white border border-slate-200 shadow-xs rounded-xl py-1 px-2.5">
                  <div className="w-6 h-6 bg-indigo-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center">
                    {currentUser.name[0] || 'U'}
                  </div>
                  <div className="text-left leading-none max-w-[130px]">
                    <span className="text-xs font-black text-slate-800 block truncate leading-tight">{currentUser.name}</span>
                    <span className="text-[9px] text-slate-450 block truncate leading-none mt-0.5">{currentUser.email}</span>
                  </div>
                  <button 
                    onClick={handleGoogleLogout}
                    id="btn-google-logout"
                    className="ml-1 text-[10px] font-bold py-1 px-2 hover:bg-slate-50 border border-slate-150 text-slate-600 cursor-pointer rounded-lg transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn-google-login-trigger"
                onClick={() => setShowGoogleLoginModal(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-750 font-bold text-xs py-2 px-3.5 border border-slate-200 shadow-sm rounded-xl transition-all active:scale-95 cursor-pointer font-sans"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.66-.75-1.18-1.74-1.51-2.69z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign In with Google
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
        
        {/* TAB 1: BROWSE TALENTS MARKETPLACE */}
        {activeTab === 'browse' && (
          <div className="space-y-8">
            
            {/* Promo Banner if not subscribed */}
            {!currentUserSubscription && (
              <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-950 text-white rounded-3xl p-6 md:p-8 overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="max-w-xl space-y-4">
                  <span className="inline-block bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase py-1 px-3.5 rounded-full tracking-wider">
                    Instant Voiceover Laboratory Inside
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-100 leading-tight">
                    Audition actors & generate high fidelity scripts in real-time.
                  </h2>
                  <p className="text-slate-350 text-xs md:text-sm leading-relaxed">
                    Test the system instantly! Select Chloe Bennet (Female) or Ethan Brooks (Male) to activate your <strong>10-minute automated trial session</strong>. Input custom paragraphs below to preview voice qualities instantly!
                  </p>
                  
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-5 py-3 rounded-xl font-bold text-xs shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
                    >
                      Browse Subscription Plans
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const trialVoice = VOICE_ACTORS.find(v => v.isTrialActor);
                        if (trialVoice) setSelectedActor(trialVoice);
                        document.getElementById('studio-laboratory-sandbox')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-white/10 hover:bg-white/15 border border-white/20 px-5 py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                    >
                      Try Interactive Trial Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Recording Sandbox Center */}
            <div id="studio-laboratory-sandbox" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2">
                <AudioPreviewArea
                  selectedActor={selectedActor}
                  activeScript={activeScriptText}
                  setActiveScript={setActiveScriptText}
                  isPlaying={isPlayingDemo}
                  setIsPlaying={setIsPlayingDemo}
                  onSynthesize={handleSynthesizeScript}
                  onStop={handleStopVocalPlay}
                  isTrialRunning={isTrialActive}
                  trialSecondsLeft={trialSecondsLeft}
                  onTriggerFastUpgrade={triggerFastUpgradeSim}
                  isSubscribed={!!currentUserSubscription}
                />
              </div>

              {/* Sidebar: Actor profile summary & Active audio controller info */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2.5">Voice Actor Profiles</h3>
                  {selectedActor ? (
                    <div className="space-y-4 pt-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border ${selectedActor.avatarColor}`}>
                          {selectedActor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-none">{selectedActor.name}</h4>
                          <span className="text-[10px] text-indigo-600 font-semibold">{selectedActor.style}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Accent profile:</span>
                          <span className="font-medium text-slate-700">{selectedActor.accent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Review rating:</span>
                          <span className="font-bold text-slate-850 flex items-center gap-0.5">
                            ★ {selectedActor.rating} <span className="text-slate-400 font-normal">({selectedActor.reviewCount} hires)</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Word rate:</span>
                          <span className="font-extrabold text-indigo-650">₹{selectedActor.perWordRate}/word</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Hourly rate:</span>
                          <span className="font-bold text-slate-800">₹{selectedActor.hourlyRate.toLocaleString('en-IN')}/hr</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{selectedActor.bio}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">No voice actor loaded yet.</p>
                  )}
                </div>

                {selectedActor && (
                  <button
                    onClick={() => setSelectedActorForBooking(selectedActor)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CreditCard className="w-4 h-4" />
                    Book {selectedActor.name} for Project
                  </button>
                )}
              </div>
            </div>

            {/* Premium Smart Script Budget & Delivery Estimator Widget */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 text-slate-200 space-y-5 shadow-xl transition-all hover:border-indigo-500/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-[9px] font-extrabold uppercase py-0.5 px-2.5 rounded-full tracking-wider font-mono">
                    <Sparkles className="w-2.5 h-2.5 animate-pulse text-indigo-400" />
                    AI-Enhanced Budget Estimator
                  </span>
                  <h3 className="font-sans font-black text-white text-base mt-1.5 flex items-center gap-1.5">
                    Vocal Script Word-Counter & Live Quote Compare
                  </h3>
                  <p className="text-slate-400 text-xs">Analyze script length and instantly preview live project quotes from top performers in Indian Rupees (INR).</p>
                </div>

                <div className="flex bg-slate-950/80 border border-slate-800 p-1 rounded-xl text-xs font-semibold shrink-0 select-none">
                  {(['slow', 'normal', 'fast'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCalculatorSelectedSpeed(mode)}
                      className={`py-1.5 px-3 rounded-lg transition-all capitalize cursor-pointer ${
                        calculatorSelectedSpeed === mode 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-slate-250'
                      }`}
                    >
                      {mode} Pace
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Script input area */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Your Draft Voiceover Script</span>
                    <button 
                      onClick={() => setCalculatorScriptText('')}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      Clear Content
                    </button>
                  </div>
                  <textarea
                    value={calculatorScriptText}
                    onChange={(e) => setCalculatorScriptText(e.target.value)}
                    placeholder="Enter or paste your text here (e.g. 'In a world where creativity knows no bounds...')"
                    className="w-full h-32 bg-slate-950/80 text-slate-150 border border-slate-800 rounded-2xl p-4 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition-all font-sans placeholder-slate-600 resize-none leading-relaxed"
                  />
                  
                  {/* Real-time calculated telemetry metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Total Words</span>
                      <strong className="text-white text-sm font-mono block mt-0.5">
                        {calculatorScriptText.trim() === "" ? 0 : calculatorScriptText.trim().split(/\s+/).length}
                      </strong>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Speech Length</span>
                      <strong className="text-indigo-450 text-sm font-mono block mt-0.5">
                        {(() => {
                          const wCount = calculatorScriptText.trim() === "" ? 0 : calculatorScriptText.trim().split(/\s+/).length;
                          const wpm = calculatorSelectedSpeed === 'slow' ? 100 : calculatorSelectedSpeed === 'normal' ? 135 : 170;
                          const totalSec = Math.round((wCount / wpm) * 60);
                          return totalSec < 60 ? `${totalSec}s` : `${Math.floor(totalSec / 60)}m ${totalSec % 60}s`;
                        })()}
                      </strong>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Breathing Pauses</span>
                      <strong className="text-emerald-450 text-sm font-mono block mt-0.5">
                        {calculatorScriptText.split(/[.,\/#!$%\^&\*;:{}=\-_`~()]/).length - 1} pauses
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Instant Quote Comparison across different performers */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Compare Roster Estimates</span>
                    
                    <div className="space-y-2 max-h-[195px] overflow-y-auto pr-1">
                      {VOICE_ACTORS.slice(0, 3).map((act) => {
                        const wordCount = calculatorScriptText.trim() === "" ? 0 : calculatorScriptText.trim().split(/\s+/).length;
                        const individualQuote = Math.max(wordCount * act.perWordRate, 100); // minimum starting cost ₹100
                        return (
                          <div key={act.id} className="bg-slate-950/80 border border-slate-850 hover:border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[10px] ${act.avatarColor}`}>
                                {act.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                              <div className="min-w-0">
                                <strong className="text-white block truncate leading-tight">{act.name}</strong>
                                <span className="text-[9px] text-slate-450 block truncate leading-none mt-0.5">{act.style} • ₹{act.perWordRate}/wd</span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-indigo-400 font-black block font-sans text-xs">₹{individualQuote.toLocaleString('en-IN')}</span>
                              <button
                                onClick={() => setSelectedActorForBooking(act)}
                                className="text-[9px] bg-indigo-600 hover:bg-indigo-505 text-white font-bold py-0.5 px-2 rounded-md transition-all mt-1 cursor-pointer"
                              >
                                Request Hire
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 italic leading-relaxed pt-1.5 border-t border-white/5">
                    * Final script quote calculation automatically adapts to standard Razorpay Sandbox routing when submitting real-time orders.
                  </p>
                </div>
              </div>
            </div>

            {/* Filter and Search controls */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search characters by name, accent (US, UK, Canadian), mood, tags..."
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all placeholder-slate-400"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                </div>

                {/* Gender selector toggles */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-500 w-full md:w-auto self-stretch md:self-auto">
                  <button
                    onClick={() => setSelectedGender('All')}
                    className={`flex-1 md:flex-initial py-2 px-4 rounded-lg transition-all cursor-pointer ${selectedGender === 'All' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-800'}`}
                  >
                    All Genders
                  </button>
                  <button
                    onClick={() => setSelectedGender('Male')}
                    className={`flex-1 md:flex-initial py-2 px-4 rounded-lg transition-all cursor-pointer ${selectedGender === 'Male' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-800'}`}
                  >
                    Boys
                  </button>
                  <button
                    onClick={() => setSelectedGender('Female')}
                    className={`flex-1 md:flex-initial py-2 px-4 rounded-lg transition-all cursor-pointer ${selectedGender === 'Female' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-800'}`}
                  >
                    Girls
                  </button>
                </div>

                {/* Subscribed and trial voice actors toggle capsules */}
                <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                  <button
                    onClick={() => setSelectedTag('All')}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedTag === 'All'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    All Tags
                  </button>
                  {['Movie Trailer', 'Commercial', 'E-learning', 'Meditation', 'Gaming', 'Corporate'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedTag === tag
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

              </div>
            </div>

            {/* Performers grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-800 text-base">
                  Available Performers <span className="text-xs text-slate-400 font-normal">({filteredVoiceActors.length} voices found)</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">* Premium voices unlocked with Professional Studio and Agency subscriptions.</span>
              </div>

              {filteredVoiceActors.length === 0 ? (
                <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center text-slate-500">
                  <p className="text-sm font-semibold">No voice actors fit your filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGender('All');
                      setSelectedTag('All');
                    }}
                    className="mt-3 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs py-1.5 px-4 rounded-xl font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Clear Filter Constraints
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVoiceActors.map((actor) => (
                    <VoiceActorCard
                      key={actor.id}
                      actor={actor}
                      onPlayDemo={handleCardPlayDemo}
                      onBookActor={setSelectedActorForBooking}
                      isPlaying={isPlayingDemo && selectedActor?.id === actor.id}
                      activeDemoScriptId={selectedActor?.id === actor.id ? activeDemoId : undefined}
                      isSubscribed={!!currentUserSubscription}
                      trialSecondsLeft={trialSecondsLeft}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: PROJECTS PORTAL & GENERATION EXTRAS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
              <h3 className="font-extrabold text-slate-850 text-base border-b border-slate-100 pb-3">Active Workspace & Direct Hire Downloads</h3>
              <p className="text-xs text-slate-400 mt-2">
                Review and play back recorded scripts or retrieve completed WAV file assets produced by custom hired voice artists.
              </p>

              {bookingsHistory.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">No bookings recorded on your profile</h4>
                    <p className="text-xs text-slate-400 mt-1">Book an actor or simulation of custom voice project, files appear here immediately.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl shadow-md cursor-pointer"
                  >
                    Launch Performers Marketplace
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-4">
                  {bookingsHistory.map((project) => (
                    <div key={project.id} className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1 ml-1.5 flex-1 max-w-xl">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-800 text-sm">{project.projectName}</h4>
                          <span className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full ${
                            project.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100 animate-pulse'
                          }`}>
                            {project.status === 'completed' ? 'Audio Assets Compiled' : 'Directing Recording...'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">
                          Voice Artist: <strong>{project.actorName}</strong> • Word Count: <strong>{project.wordCount}</strong> words • Mood: <strong>{project.selectedMood}</strong>
                        </p>
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100/90 italic truncate mt-1">
                          "{project.scriptText}"
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto text-xs shrink-0 pl-1.5 md:pl-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase leading-none">Total Payment</span>
                          <span className="font-extrabold text-indigo-600 text-sm block mt-0.5">${project.totalCost.toFixed(2)}</span>
                        </div>
                        
                        {project.status === 'completed' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // Speak synthesized version
                                handleSynthesizeSpeech(project.scriptText);
                              }}
                              className="px-3.5 py-2 border border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              Playback Realized
                            </button>
                            <a
                              href={`data:text/plain;charset=utf-8,${encodeURIComponent(project.scriptText)}`}
                              download={`${project.projectName.replace(/\s+/g, '-').toLowerCase()}-transcript.txt`}
                              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              Retrieve WAV / Script text
                            </a>
                          </div>
                        ) : (
                          <div className="px-4 py-2 text-indigo-600 bg-indigo-50/50 border border-indigo-100 font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
                            <svg className="animate-spin h-3.5 w-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Live session reading
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION PLANS & BILLING SELECTIONS */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Flexible Membership Subscriptions</h3>
              <p className="text-xs text-slate-400">
                Unlock broadcast-ready voice actors, full digital masterings mixing, custom word packages, and infinite real-time downloads.
              </p>
              
              {/* Yearly vs Monthly Selector */}
              <div className="inline-flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-500 mt-2">
                <button
                  onClick={() => setSelectedPlanBilling('monthly')}
                  className={`py-2 px-4 rounded-xl transition-all cursor-pointer ${selectedPlanBilling === 'monthly' ? 'bg-white text-indigo-600 shadow-xs font-black' : 'hover:text-slate-800'}`}
                >
                  Pay Monthly
                </button>
                <button
                  onClick={() => setSelectedPlanBilling('yearly')}
                  className={`py-2 px-4 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${selectedPlanBilling === 'yearly' ? 'bg-white text-indigo-600 shadow-xs font-black' : 'hover:text-slate-800'}`}
                >
                  Yearly Billing
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-extrabold uppercase px-1.5 rounded-md py-0.5">
                    Save 25%
                  </span>
                </button>
              </div>
            </div>

            {/* Plans comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const planCost = selectedPlanBilling === 'monthly' ? plan.price : plan.priceYearly;
                const isCurrentPlan = currentUserSubscription?.planId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`bg-white border rounded-3xl p-6 transition-all duration-300 relative flex flex-col justify-between ${
                      plan.popular 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl scale-105 z-10' 
                        : 'border-slate-150 hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div>
                      {plan.badge && (
                        <span className={`absolute -top-3 right-6 inline-flex text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-sm font-bold bg-indigo-600`}>
                          {plan.badge}
                        </span>
                      )}

                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 text-base">{plan.name}</h4>
                        <span className="text-[10px] block uppercase font-bold tracking-wider text-indigo-500">{plan.wordLimit}</span>
                      </div>

                      {/* Pricing block */}
                      <div className="my-6">
                        <span className="text-4xl font-black text-slate-800 font-sans">₹{planCost.toLocaleString('en-IN')}</span>
                        <span className="text-slate-400 text-xs font-normal"> /mo</span>
                        {selectedPlanBilling === 'yearly' && (
                          <span className="text-[10px] block text-emerald-600 font-bold mt-1 font-sans">Billed annually as ₹{(planCost * 12).toLocaleString('en-IN')}/year</span>
                        )}
                      </div>

                      {/* Line lists */}
                      <ul className="space-y-3 pt-2 text-xs text-slate-600 border-t border-slate-50 mt-4 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 font-extrabold" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      id={`btn-select-plan-${plan.id}`}
                      onClick={() => setSelectedPlanForCheckout(plan)}
                      disabled={isCurrentPlan}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        isCurrentPlan
                          ? 'bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold cursor-default'
                          : plan.popular
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                            : 'bg-slate-105 hover:bg-slate-200 text-slate-705 border border-slate-200'
                      }`}
                    >
                      {isCurrentPlan ? '✓ Your Subscribed Plan' : `Enroll in ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* General FAQs or cancellation notices */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-1">
              <h5 className="font-bold text-slate-800 text-xs">Unconditional 14-Day Refunds</h5>
              <p className="text-[10px] text-slate-400 leading-relaxed max-w-md mx-auto">
                Not satisfied with voice profiles? Cancel your subscription from the members workspace inside 14 days and receive a complete escrow refund, no questions asked.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: ADVANCED ADMIN ANALYTICS PANEL */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wide">Administrative Secure Operations Workspace</h4>
                <p className="text-[10px] text-amber-700 mt-1 leading-relaxed">
                  Welcome to the platform manager control panel. You hold access to subscription conversions, financial revenue channels, total earnings, and mock user transaction injectors.
                </p>
              </div>
            </div>

            <AdminPanel
              subscriptionsList={subscriptionsHistory}
              bookingsList={bookingsHistory}
              voiceActors={voiceActorsList}
              onAddMockSubscription={(newSub) => {
                const sub: Subscription = {
                  ...newSub,
                  id: `sub-${Date.now()}`,
                  startedAt: new Date().toISOString(),
                  renewalAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                };
                setSubscriptionsHistory(prev => [sub, ...prev]);
              }}
              onAddMockBooking={(newB) => {
                const book: Booking = {
                  ...newB,
                  id: `book-${Date.now()}`,
                  createdAt: new Date().toISOString(),
                  status: 'completed',
                  paymentId: `ch_stripe_mock_${Math.floor(Math.random() * 9999) + 1000}`
                };
                setBookingsHistory(prev => [book, ...prev]);
              }}
              onResetAdminData={handleResetData}
              onCancelSubscription={handleCancelSubscriptionInAdmin}
              onGrantSubscription={handleGrantSubscriptionInAdmin}
            />
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800/80 py-8 px-6 mt-16 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-100">VoiceOver Recording Studio</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Trusted escrow payments since 2018</span>
          </div>
          <p className="text-slate-500">© 2026 Voice Studio Int. All rights reserved. Sandboxed via Antigravity Secure Cloud Engine.</p>
        </div>
      </footer>

      {/* MODAL 1: PRE-CALCULATED HIRE ACTOR POPUP */}
      {selectedActorForBooking && (
        <BookingFormModal
          actor={selectedActorForBooking}
          onClose={() => setSelectedActorForBooking(null)}
          onSubmitBooking={handleAddNewBooking}
          isSubscribed={!!currentUserSubscription}
        />
      )}

      {/* MODAL 2: BUY PLAN CHECKOUT SECURE POPUP */}
      {selectedPlanForCheckout && (
        <CheckoutModal
          plan={selectedPlanForCheckout}
          billingFrequency={selectedPlanBilling}
          onClose={() => setSelectedPlanForCheckout(null)}
          onConfirmSubscription={handleSubscriptionAcquired}
        />
      )}

      {/* MODAL 3: AUTOMATED BILLING TRIAL EXPIRED PAYWALL POPUP */}
      {showAutoBillingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden relative p-8 text-center space-y-6 scale-100 transition-transform">
            
            <button 
              onClick={() => setShowAutoBillingPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold cursor-pointer text-sm"
            >
              ✕
            </button>

            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100">
              <Timer className="w-8 h-8 animate-pulse text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] bg-red-100 text-red-800 border border-red-200 uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full">
                10-Minute Trial Concluded
              </span>
              <h3 className="font-black text-slate-800 text-lg leading-tight mt-1.5">Auto-Billing Upgrade Triggered</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your 10-minute trial for Chloe Bennet / Ethan Brooks has concluded. Please enroll in a membership subscription to keep generating and performing custom speeches.
              </p>
            </div>

            {/* Trial billing box plan shortcut */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-left space-y-2 text-xs">
              <h5 className="font-bold text-slate-700">Most Popular Upgrade Choice:</h5>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-slate-800">Professional Studio Plan</strong>
                  <span className="text-[10px] text-indigo-500 block">Unlimited access to 12+ voices</span>
                </div>
                <div className="text-right">
                  <strong className="text-indigo-600 text-sm block font-sans">₹1,299/mo</strong>
                  <span className="text-[8px] text-slate-450 uppercase leading-none">Standard billing</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowAutoBillingPopup(false);
                  setActiveTab('plans');
                }}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                View Plans
              </button>
              <button
                onClick={() => {
                  const proPlan = SUBSCRIPTION_PLANS[1];
                  setSelectedPlanForCheckout(proPlan);
                }}
                className="py-3 bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Instant Pro Upgrade
              </button>
            </div>

            <p className="text-[9px] text-slate-400 font-medium">🛡️ Escrow money back guarantees protect all plans. Cancelling takes zero calls.</p>
          </div>
        </div>
      )}

      {/* GOOGLE SIGN IN ACCOUNT CHOOSER MODAL */}
      {showGoogleLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 overflow-hidden relative p-8 scale-100 transition-transform">
            
            <button 
              onClick={() => setShowGoogleLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full cursor-pointer transition-colors font-bold text-sm"
              id="btn-close-google-modal"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              {/* Google SVG Icon */}
              <div className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-105 rounded-full shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.66-.75-1.18-1.74-1.51-2.69z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Sign In with Google</h3>
                <p className="text-xs text-slate-400 mt-1">Choose an account to continue to VoiceOver Studio</p>
              </div>
            </div>

            {/* List of accounts */}
            <div className="space-y-2.5">
              {/* Account 1: Sonali Mahajan (The requester) */}
              <button
                id="btn-google-account-sonali"
                onClick={() => {
                  setCurrentUser({
                    email: 'mahajansonali52@gmail.com',
                    name: 'Sonali Mahajan'
                  });
                  setShowGoogleLoginModal(false);
                }}
                className="w-full flex items-center gap-3 p-3 border border-slate-150 hover:border-indigo-300 hover:bg-slate-50 rounded-2xl text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div className="w-8 h-8 bg-indigo-600 text-white font-extrabold text-xs rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  SM
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-800 text-xs truncate">Sonali Mahajan</strong>
                    <span className="text-[7.5px] bg-indigo-50 text-indigo-700 border border-indigo-120 px-1 py-0.2 rounded font-black uppercase shrink-0">Owner</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block truncate">mahajansonali52@gmail.com</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
              </button>

              {/* Account 2: Guest Performer */}
              <button
                id="btn-google-account-guest"
                onClick={() => {
                  setCurrentUser({
                    email: 'guest@studio-sim.com',
                    name: 'Guest Performer'
                  });
                  setShowGoogleLoginModal(false);
                }}
                className="w-full flex items-center gap-3 p-3 border border-slate-150 hover:border-indigo-300 hover:bg-slate-50 rounded-2xl text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div className="w-8 h-8 bg-emerald-600 text-white font-extrabold text-xs rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  GP
                </div>
                <div className="flex-grow min-w-0">
                  <strong className="text-slate-800 text-xs truncate">Guest Performer</strong>
                  <span className="text-[9px] text-slate-400 font-mono block truncate">guest@studio-sim.com</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
              </button>

              {/* Dynamic enter */}
              <div className="border-t border-slate-100 pt-3.5 mt-2">
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400 block mb-2 font-sans">
                  Or sign in manually as customizable user:
                </span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const nameInput = form.elements.namedItem('dynamicName') as HTMLInputElement;
                    const emailInput = form.elements.namedItem('dynamicEmail') as HTMLInputElement;
                    if (nameInput.value.trim() && emailInput.value.trim()) {
                      setCurrentUser({
                        name: nameInput.value.trim(),
                        email: emailInput.value.trim()
                      });
                      setShowGoogleLoginModal(false);
                    }
                  }}
                  className="space-y-1.5"
                >
                  <input
                    type="text"
                    name="dynamicName"
                    required
                    placeholder="Full Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    name="dynamicEmail"
                    required
                    placeholder="Google Email (e.g. name@gmail.com)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Authenticate Chosen Account
                  </button>
                </form>
              </div>
            </div>

            <p className="text-[9px] text-slate-400 text-center leading-relaxed mt-4">
              Secure sandbox proxy running on Google Identity Services.
            </p>
          </div>
        </div>
      )}

    </div>
  );

  // Helper system to fallback speech or trigger simulated audio progress loops 
  function handleSynthesizeSpeech(txt: string) {
    window.speechSynthesis.cancel();
    const synthUtterance = new SpeechSynthesisUtterance(txt || "Dialogue audio files downloaded.");
    window.speechSynthesis.speak(synthUtterance);
  }
}
