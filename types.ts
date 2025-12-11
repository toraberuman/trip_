

export enum EventCategory {
  Transport = 'TRANSPORT',
  Food = 'FOOD',
  Activity = 'ACTIVITY',
  Stay = 'STAY',
  Other = 'OTHER'
}

export enum PaymentMethod {
  Cash = 'CASH',
  Card = 'CARD'
}

export interface Expense {
  amountPerPerson: number;
  currency: string;
  method: PaymentMethod;
  isEstimate: boolean;
  peopleCount: number; 
  total: number; // calculated as amountPerPerson * peopleCount
}

export interface OnsenDetails {
  hasPrivateBath?: boolean; // 貸切風呂
  hasOpenAir?: boolean; // 露天風呂
  bathName?: string;
  hours?: string;
  genderSwap?: string;
  privateBathFee?: string;
}

export interface RoomInfo {
  name: string;
  description?: string;
  imageUrl?: string;
  link?: string;
}

export interface CarRentalInfo {
  model?: string;
  company?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
}

export interface LocationDetails {
  japaneseName?: string;
  hiragana?: string;
  address?: string;
  phoneNumber?: string;
  openingHours?: string;
  holidays?: string;
  lastOrder?: string;
  
  // URLs
  reservationUrl?: string;
  tabelogUrl?: string;
  websiteUrl?: string;
  
  // Status
  isReserved?: boolean;
  
  // Hotel Specific
  rooms?: RoomInfo[]; 
  roomType?: string; // Fallback for old data structure
  mealPlan?: string; // e.g. "素泊", "一泊二食"
  onsen?: OnsenDetails;
  hotelActivities?: Array<{ name: string; description: string; imageUrl?: string }>;

  // Food
  popularDishes?: Array<{ original: string; translated: string }>;
  
  // Transport / Flight
  transportInfo?: {
      departureTerminal?: string;
      arrivalTerminal?: string;
      flightNumber?: string;
  };
  
  // Car Rental
  carRental?: CarRentalInfo;

  // Map
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ItineraryEvent {
  id: string; 
  time: string; // Start time HH:MM
  endTime?: string; // For flights or long activities
  activity: string;
  location: string;
  notes: string;
  category: EventCategory;
  emoji?: string;
  details: LocationDetails;
  expense: Expense;
  
  // Calculated fields for Navigation Tip
  estimatedTravelTime?: string; // e.g. "45 min"
  estimatedArrivalTime?: string; // e.g. "14:30" - NEW
  distance?: string; // e.g. "12 km"
  trafficStatus?: 'normal' | 'moderate' | 'congested'; // Updated for 3 levels
}

export interface ItineraryDay {
  date: string;
  dayOfWeek: string; 
  dayNumber: string; 
  dayTitle: string;
  summary: string;
  location: string; 
  imageKeyword?: string; 
  coordinates?: { lat: number; lng: number }; 
  events: ItineraryEvent[];
}

export interface TripData {
  tripTitle: string;
  year: string;
  month: string; // e.g. "OCT"
  participants: number; // Default 6
  days: ItineraryDay[];
}