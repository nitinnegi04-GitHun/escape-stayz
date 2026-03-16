
export interface RoomType {
  name: string;
  description: string;
  price: number;
  capacity: string;
  imageUrl: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Attraction {
  name: string;
  distance: string;
  description: string;
}

export interface Hotel {
  id: string;
  slug: string;
  name: string;
  destination: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  elevation?: string;
  rating: number;
  amenities: string[];
  imageUrl: string;
  rooms: RoomType[];
  nearbyAttractions: Attraction[];
  faqs: FAQ[];
}

export interface SeasonalGuide {
  season: string;
  months: string;
  description: string;
}

export interface Experience {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  hotelCount: number;
  bestTimeToVisit: SeasonalGuide[];
  thingsToDo: Experience[];
  travelTips: string[];
  faqs: FAQ[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
  content: string;
}

export interface TripPlan {
  destination: string;
  duration: string;
  budget: string;
  interests: string[];
  itinerary: {
    day: number;
    activity: string;
    details: string;
  }[];
  recommendations: string[];
}
