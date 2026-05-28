export interface TestDemoScript {
  id: string;
  category: string; // e.g., "Movie Trailer", "Commercial", "E-learning", "Meditation"
  title: string;
  scriptText: string;
  suggestedMood: string;
}

export interface VoiceActor {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  accent: string;
  style: string;
  vocalTone: string; // e.g. "Warm, Deep, Energetic"
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  perWordRate: number;
  avatarColor: string; // Tailwind colour class / hex
  bio: string;
  tags: string[];
  isTrialActor?: boolean; // 1 girl and 1 boy will be trial actors
  avatarUrl?: string;
  demosList: TestDemoScript[];
}

export interface Booking {
  id: string;
  actorId: string;
  actorName: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  scriptText: string;
  selectedMood: string;
  wordCount: number;
  totalCost: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  paymentId: string;
  audioGeneratedUrl?: string; // If completed, user can listen to the resulting audio!
}

export interface Subscription {
  id: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  status: 'active' | 'cancelled';
  startedAt: string;
  renewalAt: string;
  billingFrequency: 'monthly' | 'yearly';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceYearly: number;
  wordLimit: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

export interface VoiceOverProjectPreset {
  category: string;
  suggestedVoices: string[];
}
