import { VoiceActor, TestDemoScript, SubscriptionPlan } from './types';

export const DEMO_SCRIPTS: TestDemoScript[] = [
  {
    id: 'script-1',
    category: 'Movie Trailer',
    title: 'The Prophecy of Shadows',
    scriptText: 'In a world divided by light and shadow, one soul holds the key to the ultimate destiny. This summer, prepare to face your greatest fears.',
    suggestedMood: 'Dramatic, Epic, Intense'
  },
  {
    id: 'script-2',
    category: 'Commercial',
    title: 'Aura Electric Sedan',
    scriptText: 'Engineered for the future, styled for your soul. Take control of the road with the all-new Aura Electric luxury sedan. Pure performance, zero limits.',
    suggestedMood: 'Sleek, Energetic, Professional'
  },
  {
    id: 'script-3',
    category: 'E-learning',
    title: 'Introduction to Astrophysics',
    scriptText: 'Welcome back to class. Today, we unfold the secrets of dark energy and explore how galaxies gather along invisible filaments of cosmic dust.',
    suggestedMood: 'Educational, Professional, Calm'
  },
  {
    id: 'script-4',
    category: 'Meditation',
    title: 'Morning Breath Release',
    scriptText: 'Allow your shoulders to release downwards. Inhale slowly through your nose, holding for four counts, and exhale completely. Let go of all tension.',
    suggestedMood: 'Soothing, Gentle, Ambient'
  },
  {
    id: 'script-5',
    category: 'Promo Video ID',
    title: 'Digital Forge Conference',
    scriptText: 'The future of software is happening here. Connect with over ten thousand builders, disruptors, and founders. August twenty second, online and in Munich.',
    suggestedMood: 'Upbeat, Millennial, Bold'
  }
];

export const VOICE_ACTORS: VoiceActor[] = [
  {
    id: 'actor-chloe',
    name: 'Chloe Bennet',
    gender: 'Female',
    accent: 'US Standard (Friendly / Conversational)',
    style: 'Commercials, Brand Storytelling, Promos',
    vocalTone: 'Warm, Bright, Highly Engaging',
    rating: 4.9,
    reviewCount: 314,
    hourlyRate: 120,
    perWordRate: 1,
    avatarColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bio: 'Chloe is the voice you want for high-converting brand commercials and approachable learning courses. Her natural warmth makes listeners feel instantly at home.',
    tags: ['E-learning', 'Friendly', 'Bright', 'Explainer'],
    isTrialActor: true, // Girl trial voice: 10 minutes limit
    demosList: [
      DEMO_SCRIPTS[1], // Commercial
      DEMO_SCRIPTS[2], // E-learning
      DEMO_SCRIPTS[4]  // Promo
    ]
  },
  {
    id: 'actor-ethan',
    name: 'Ethan Brooks',
    gender: 'Male',
    accent: 'UK English (Received Pronunciation - Deep)',
    style: 'Movie Trailers, Suspense Narrations, Documentaries',
    vocalTone: 'Deep, Resonant, Commanding Baritone',
    rating: 4.85,
    reviewCount: 285,
    hourlyRate: 200,
    perWordRate: 2,
    avatarColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    bio: 'With a deep cinematic resonance, Ethan carries the gravitas needed for grand marketing, historical audiobooks, gritty gaming narrators, and movie trailers.',
    tags: ['Movie Trailer', 'Commanding', 'Deep', 'Dramatic'],
    isTrialActor: true, // Boy trial voice: 10 minutes limit
    demosList: [
      DEMO_SCRIPTS[0], // Movie Trailer
      DEMO_SCRIPTS[1], // Commercial
      DEMO_SCRIPTS[2]  // E-learning
    ]
  },
  {
    id: 'actor-sophia',
    name: 'Sophia Chen',
    gender: 'Female',
    accent: 'US West Coast (Clear / Corporate)',
    style: 'Interactive Voice Response (IVR), Corporate Demos',
    vocalTone: 'Clear, Articulate, Highly Professional',
    rating: 4.95,
    reviewCount: 195,
    hourlyRate: 150,
    perWordRate: 2,
    avatarColor: 'bg-teal-50 text-teal-700 border-teal-200',
    bio: 'Sophia is the ultimate voice for tech explanation, corporate presentation, and elegant telephone routing systems. Clients love her precise pacing and modern crisp delivery.',
    tags: ['Corporate', 'IVR', 'Explainer', 'Tech'],
    demosList: [
      DEMO_SCRIPTS[2], // E-learning
      DEMO_SCRIPTS[1], // Commercial
      DEMO_SCRIPTS[4]  // Promo
    ]
  },
  {
    id: 'actor-marcus',
    name: 'Marcus Sterling',
    gender: 'Male',
    accent: 'US Urban Standard (Upbeat / Retail)',
    style: 'Retail Ads, High-Energy Sports Promos, Car Decals',
    vocalTone: 'Energetic, High-Tempo, Electrifying',
    rating: 4.79,
    reviewCount: 412,
    hourlyRate: 100,
    perWordRate: 1,
    avatarColor: 'bg-amber-50 text-amber-700 border-amber-200',
    bio: 'If you need a voice that jumps out of the speakers, Marcus has the infectious energy to hype up local retail sales, energy beverages, or sports radio promotions.',
    tags: ['Commercial', 'Energetic', 'Bold', 'Upbeat'],
    demosList: [
      DEMO_SCRIPTS[1], // Commercial
      DEMO_SCRIPTS[4], // Promo
      DEMO_SCRIPTS[0]  // Movie Trailer
    ]
  },
  {
    id: 'actor-emily',
    name: 'Emily Thorne',
    gender: 'Female',
    accent: 'Australian English (Light / Soothing)',
    style: 'Meditation Apps, Sleep Aids, Relaxation Audios',
    vocalTone: 'Serene, Airy, Calm & Whispering',
    rating: 4.92,
    reviewCount: 164,
    hourlyRate: 140,
    perWordRate: 1,
    avatarColor: 'bg-sky-50 text-sky-700 border-sky-200',
    bio: 'Emily breathes tension out of any room. Specializing in meditation paths, ambient sleep narrations, and quiet spa promotional background, her softness is incredibly captivating.',
    tags: ['Meditation', 'Calm', 'Soothing', 'Soft'],
    demosList: [
      DEMO_SCRIPTS[3], // Meditation
      DEMO_SCRIPTS[2]  // E-learning
    ]
  },
  {
    id: 'actor-liam',
    name: 'Liam MacIntyre',
    gender: 'Male',
    accent: 'Scottish Highlands (Engaging Storyteller)',
    style: 'Game Narrations, Children Books, Whimsical Promos',
    vocalTone: 'Charming, Folky, Story-centric, Expressive',
    rating: 4.88,
    reviewCount: 220,
    hourlyRate: 180,
    perWordRate: 2,
    avatarColor: 'bg-rose-50 text-rose-700 border-rose-200',
    bio: 'Liam has a rich, folk-tinted Scottish accent that instantly captures imagination. Ideal for fantasy audiobook novels, video games, or highly evocative holiday marketing campaigns.',
    tags: ['Storyteller', 'Audiobook', 'Gaming', 'Folk'],
    demosList: [
      DEMO_SCRIPTS[0], // Movie Trailer
      DEMO_SCRIPTS[3]  // Meditation
    ]
  },
  {
    id: 'actor-isabella',
    name: 'Isabella Rossi',
    gender: 'Female',
    accent: 'European Accented (Italian-flavored / Luxurious)',
    style: 'Fashion Campaigns, Cosmetics, High-end Premium Ads',
    vocalTone: 'Smooth, Velvet, Alluring, Sophisticated',
    rating: 4.96,
    reviewCount: 188,
    hourlyRate: 350,
    perWordRate: 3,
    avatarColor: 'bg-purple-50 text-purple-700 border-purple-200',
    bio: 'For high fashion houses, high-end hospitality portfolios, and grand jewelry launches, Isabella represents unmatched charm and European grace.',
    tags: ['Luxurious', 'Smooth', 'Sultry', 'Corporate'],
    demosList: [
      DEMO_SCRIPTS[1], // Commercial
      DEMO_SCRIPTS[3]  // Meditation
    ]
  },
  {
    id: 'actor-nathan',
    name: 'Nathan Vance',
    gender: 'Male',
    accent: 'Canadian Accent (Casual / Millennial)',
    style: 'Software Walkthroughs, Explainer Videos, Podcast Intros',
    vocalTone: 'Cool, Conversational, Genuine, Relatable',
    rating: 4.81,
    reviewCount: 340,
    hourlyRate: 100,
    perWordRate: 1,
    avatarColor: 'bg-blue-50 text-blue-700 border-blue-200',
    bio: 'Nathan is the voice of the millennial coworker. Relatable, down-to-earth, and friendly, he does wonders for SaaS explanations, software guides, and podcast launches.',
    tags: ['Tech', 'Millennial', 'Friendly', 'Explainer'],
    demosList: [
      DEMO_SCRIPTS[1], // Commercial
      DEMO_SCRIPTS[4], // Promo
      DEMO_SCRIPTS[2]  // E-learning
    ]
  },
  {
    id: 'actor-avril',
    name: 'Avril Vance',
    gender: 'Female',
    accent: 'US Accent (Animated / Playful)',
    style: 'Video Game Chibis, Kids Audio, Animated TV Commercials',
    vocalTone: 'High-Pitched, Bubbly, Dynamic, Highly Playful',
    rating: 4.87,
    reviewCount: 147,
    hourlyRate: 130,
    perWordRate: 1,
    avatarColor: 'bg-orange-50 text-orange-700 border-orange-200',
    bio: 'Avril is a versatile voice actor who specializes in animations, cartoon series, and energetic toy promotions. She brings hyperactive joy and customizable tones.',
    tags: ['Gaming', 'Animation', 'Playful', 'Bubbly'],
    demosList: [
      DEMO_SCRIPTS[4], // Promo
      DEMO_SCRIPTS[1]  // Commercial
    ]
  },
  {
    id: 'actor-zane',
    name: 'Zane Shadowclaw',
    gender: 'Male',
    accent: 'South African (Gritty / Menacing)',
    style: 'Orcs, Villains, Action Gaming, Dark Documentaries',
    vocalTone: 'Gravelly, Earthy, Menacing, Hardened',
    rating: 4.93,
    reviewCount: 153,
    hourlyRate: 500,
    perWordRate: 5,
    avatarColor: 'bg-slate-50 text-slate-700 border-slate-200',
    bio: 'Zane brings raw grit and high narrative stakes. For action film bumpers, high-fidelity boss fights, and stories that require darkness, the shadows are his home.',
    tags: ['Gaming', 'Dramatic', 'Deep', 'Movie Trailer'],
    demosList: [
      DEMO_SCRIPTS[0], // Movie Trailer
      DEMO_SCRIPTS[1]  // Commercial
    ]
  },
  {
    id: 'actor-mia',
    name: 'Mia Kowalski',
    gender: 'Female',
    accent: 'Mid-Atlantic (Analytical, Documentary)',
    style: 'Scientific Whitepapers, Bio-Tech Explanations, Audio News',
    vocalTone: 'Confident, Academic, Trustworthy, Intricate',
    rating: 4.9,
    reviewCount: 122,
    hourlyRate: 250,
    perWordRate: 2,
    avatarColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    bio: 'Mia combines journalistic confidence with perfect diction. Shes chosen repeatedly by research institutes and biotech creators for complex subject scripts.',
    tags: ['Tech', 'Corporate', 'Academic', 'Explainer'],
    demosList: [
      DEMO_SCRIPTS[2], // E-learning
      DEMO_SCRIPTS[3]  // Meditation
    ]
  },
  {
    id: 'actor-kai',
    name: 'Kai Tanaka',
    gender: 'Male',
    accent: 'US West (Fresh, Rhythmic)',
    style: 'Streetwear Promos, Concert Tickets, Social Ad Campaigns',
    vocalTone: 'Fresh, Smooth, Conversational, Rhythmic',
    rating: 4.84,
    reviewCount: 96,
    hourlyRate: 120,
    perWordRate: 1,
    avatarColor: 'bg-violet-50 text-violet-700 border-violet-200',
    bio: 'Kai captures the modern youth zeitgeist effortlessly. Rythmic pacing and smooth confidence makes him ideal for streetwear, dynamic web shorts, and gaming stream trailers.',
    tags: ['Upbeat', 'Millennial', 'Commercial', 'Friendly'],
    demosList: [
      DEMO_SCRIPTS[4], // Promo
      DEMO_SCRIPTS[1]  // Commercial
    ]
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter Voice',
    price: 499,
    priceYearly: 399,
    wordLimit: '50,000 words/mo',
    features: [
      'Access to standard Voice Actors',
      'MP3 Audio Exports (High Quality)',
      'Single-user Client Portal',
      'Basic background licensing',
      'Delivery within 48 hours for bookings'
    ]
  },
  {
    id: 'plan-pro',
    name: 'Professional Studio',
    price: 1299,
    priceYearly: 999,
    wordLimit: '250,050 words/mo',
    features: [
      'Access to ALL Premium Voice Actors (including Trial VIPs)',
      'Broadcast-quality WAV, TIFF, or MP3 options',
      'Commercial & Broadcast Distribution Rights',
      'Multi-track mixing (AI background music integration)',
      'Fast-track delivery (within 24 hours)',
      'Submitting custom reference guide voices'
    ],
    popular: true,
    badge: 'Most Popular'
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise Agency',
    price: 2999,
    priceYearly: 2399,
    wordLimit: 'Unlimited words & projects',
    features: [
      'Unlimited projects' ,
      '1-on-1 Direct Skype/Zoom Live Direction sessions',
      'Dedicated Booking Success Account Manager',
      'Custom Voice Matching & Voice Cloning',
      'Flexible invoicing & team collaboration workspace',
      'Priority live-chat support 24/7'
    ],
    badge: 'Agency Scale'
  }
];
