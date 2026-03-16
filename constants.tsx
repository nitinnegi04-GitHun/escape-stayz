
import { Hotel, Destination, BlogPost } from './types';

export const HOTELS: Hotel[] = [
  {
    id: 'h1',
    slug: 'rakcham',
    name: 'Escape Adventure Camps',
    destination: 'Rakcham, Kinnaur Valley',
    description: 'Luxury camping in Rakcham, Kinnaur, by a serene river stream at the foothills of Rakcham Wildlife Sanctuary.',
    longDescription: `Nestled at an altitude of 3,050 meters, Escape Adventure Camps in Rakcham offers a unique blend of luxury and raw nature. Rakcham is often described as the most beautiful village in the Kinnaur district, and our property is designed to provide a front-row seat to this splendor. 

The camp features panoramic views of the turquoise Baspa river and the rugged peaks of the Kinner Kailash range. Our luxury tents are equipped with modern amenities while keeping you connected to the outdoors. Guests can enjoy guided walks to the nearby glaciers, fly-fishing in the river, or simply meditating by the water's edge.`,
    price: 5000,
    originalPrice: 6000,
    elevation: '3,050m',
    rating: 4.9,
    amenities: ['Baspa River Access', 'Organic Orchard', 'Himalayan Spa', 'Library', 'Guided Glacial Walks'],
    imageUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1200',
    rooms: [
      { name: 'Luxury Tent', description: 'Riverside luxury tent with private sit-out.', price: 5000, capacity: '2 Adults', imageUrl: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=800' }
    ],
    nearbyAttractions: [
      { name: 'Baspa River', distance: '50m', description: 'Crystal clear waters perfect for quiet contemplation.' },
      { name: 'Rakcham Village', distance: '1km', description: 'A traditional Kinnauri village with unique stone and wood houses.' }
    ],
    faqs: [{ question: 'Is Rakcham accessible in winter?', answer: 'Rakcham receives heavy snow and is typically accessible from April to November.' }]
  },
  {
    id: 'h2',
    slug: 'kaza',
    name: 'Escape Inn Kaza',
    destination: 'Kaza, Spiti Valley',
    description: 'Escape Inn, a boutique hotel in ancient Kaza village, Spiti Valley, offers modern comfort. Located right in...',
    longDescription: `Kaza is the beating heart of Spiti, and our Escape Inn Kaza is the premier choice for travelers. We blend high-altitude functionality with boutique design. Whether you are coming back from a trek to the Key Monastery or looking for the snow leopard, our lodge provides the warmth and nutrition required for the high Himalayas.`,
    price: 4000,
    originalPrice: 5000,
    elevation: '3,800m',
    rating: 4.9,
    amenities: ['Central Kaza Location', 'Gourmet Restaurant', 'Gear Rental', 'Expedition Planning'],
    imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=1200',
    rooms: [
      { name: 'Explorer Suite', description: 'Spacious suite with heated floors and panoramic views.', price: 4000, capacity: '2 Adults', imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800' }
    ],
    nearbyAttractions: [{ name: 'Key Monastery', distance: '12km', description: 'Iconic monastery perched on a hill.' }],
    faqs: [{ question: 'Do you offer tours?', answer: 'Yes, we have resident experts for snow leopard tracking and fossil hunting.' }]
  },
  {
    id: 'h3',
    slug: 'narkanda',
    name: 'Escape Inn Narkanda',
    destination: 'Narkanda, Shimla District',
    description: 'Welcome to Escape Inn Narkanda, a brand new boutique hotel launched in 2025. Perfectly positioned...',
    longDescription: `Narkanda serves as the gateway to the higher Himalayas. Escape Inn Narkanda is situated amidst vast deodar forests, offering seclusion and peace. In winter, Narkanda is a skiing hub, and in summer, it's a temperate paradise.`,
    price: 3000,
    originalPrice: 4000,
    elevation: '2,708m',
    rating: 4.6,
    amenities: ['Apple Orchard Stay', 'Skiing Access', 'Nature Trails', 'Farm-to-Table Dining'],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
    rooms: [
      { name: 'Valley View Room', description: 'Private room with views of the Hatu Peak.', price: 3000, capacity: '2 Adults', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800' }
    ],
    nearbyAttractions: [{ name: 'Hatu Peak', distance: '8km', description: 'The highest point in the region with 360-degree views.' }],
    faqs: [{ question: 'Is skiing available?', answer: 'Yes, during Jan-Feb we provide skiing equipment and instructors.' }]
  },
  {
    id: 'h6',
    slug: 'manali',
    name: 'Cedar Peaks Riverside Resort',
    destination: 'Manali',
    description: 'Luxury on the banks of the Beas River, overlooking the snow-capped Solang Valley.',
    longDescription: `Manali needs no introduction, but our Cedar Peaks Resort offers a side of Manali most travelers never see. Located away from the crowded mall road, our resort sits directly on the banks of the Beas river, surrounded by old-growth cedar trees.`,
    price: 750,
    rating: 4.8,
    amenities: ['Riverside Deck', 'Private Cedar Garden', 'Outdoor Heated Pool', 'Fine Dining'],
    imageUrl: 'https://images.unsplash.com/photo-1493246507139-91e8bef99c1e?auto=format&fit=crop&q=80&w=1200',
    rooms: [
      { name: 'Cedar River Suite', description: 'Listen to the sound of the Beas from your private balcony.', price: 750, capacity: '2 Adults', imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=800' }
    ],
    nearbyAttractions: [{ name: 'Solang Valley', distance: '10km', description: 'A hub for adventure sports like paragliding.' }],
    faqs: [{ question: 'Is the resort family friendly?', answer: 'Yes, we have dedicated children areas and family activities.' }]
  }
];

export const DESTINATIONS: Destination[] = [
  {
    id: 'd1',
    slug: 'rakcham',
    name: 'Rakcham',
    description: 'The nomadic soul of the Baspa Valley.',
    longDescription: `Rakcham is the hidden jewel of Kinnaur. Situated between Sangla and Chitkul, it offers a landscape that is both pastoral and dramatic. The Baspa river flows through the heart of the village, surrounded by glaciers and dense forests.`,
    imageUrl: 'https://images.unsplash.com/photo-1548678912-41f2375830ff?auto=format&fit=crop&q=80&w=1200',
    hotelCount: 1,
    bestTimeToVisit: [{ season: 'Summer', months: 'May - June', description: 'The perfect weather for valley treks.' }],
    thingsToDo: [{ title: 'Walk to Chitkul', description: 'A scenic trail to the last village of India.' }],
    travelTips: ['Carry heavy woolens even in summer.'],
    faqs: [{ question: 'Is there a network?', answer: 'BSNL works best, others are sporadic.' }]
  },
  {
    id: 'd2',
    slug: 'kalpa',
    name: 'Kalpa',
    description: 'Heritage and Divinity in the clouds.',
    longDescription: `Kalpa is famous for its apple orchards and its proximity to the Kinner Kailash peak. It is a place of deep spiritual significance and architectural beauty.`,
    imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=1200',
    hotelCount: 1,
    bestTimeToVisit: [{ season: 'Autumn', months: 'Sept - Oct', description: 'The harvest season for apples.' }],
    thingsToDo: [{ title: 'Visit Suicide Point', description: 'Famous for its sheer drop and photo ops.' }],
    travelTips: ['Respect local traditions in the wooden temples.'],
    faqs: [{ question: 'Is it safe?', answer: 'Very safe, but the roads are narrow.' }]
  },
  {
    id: 'd3',
    slug: 'tabo',
    name: 'Tabo',
    description: 'The ancient spiritual heart of Spiti.',
    longDescription: `Tabo is home to one of the oldest living monasteries in the world. It is a quiet, contemplative town that feels like a step back in time.`,
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200',
    hotelCount: 1,
    bestTimeToVisit: [{ season: 'Summer', months: 'June - August', description: 'When the valley is most accessible.' }],
    thingsToDo: [{ title: 'Explore Caves', description: 'Visit the meditation caves used by monks for centuries.' }],
    travelTips: ['Acclimatize for 24 hours before any exertion.'],
    faqs: [{ question: 'Is it cold?', answer: 'Yes, even in summer the nights are chilly.' }]
  },
  {
    id: 'd4',
    slug: 'kaza',
    name: 'Kaza',
    description: 'Gateway to the high-altitude wilderness.',
    longDescription: `Kaza is the administrative center of Spiti and serves as the perfect base for exploring the high-altitude villages of Langza, Hikkim, and Komik.`,
    imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200',
    hotelCount: 1,
    bestTimeToVisit: [{ season: 'Summer', months: 'July - September', description: 'Best for road trips through the valley.' }],
    thingsToDo: [{ title: 'Post a letter at Hikkim', description: 'The highest post office in the world.' }],
    travelTips: ['Always carry a physical map; GPS is unreliable.'],
    faqs: [{ question: 'Is there a hospital?', answer: 'Kaza has a small regional hospital.' }]
  },
  {
    id: 'd5',
    slug: 'narkanda',
    name: 'Narkanda',
    description: 'The apple orchard gateway to Kinnaur.',
    longDescription: `Narkanda is a charming town that offers spectacular views of the inner Himalayas. It is famous for its skiing slopes and apple production.`,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200',
    hotelCount: 1,
    bestTimeToVisit: [{ season: 'Winter', months: 'Dec - Feb', description: 'Perfect for skiing and snow sports.' }],
    thingsToDo: [{ title: 'Trek to Hatu Peak', description: 'A gentle trek through deodar forests.' }],
    travelTips: ['Try the local siddu during your stay.'],
    faqs: [{ question: 'Distance from Shimla?', answer: 'Approximately 65 km.' }]
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    slug: 'best-time-to-visit-spiti',
    title: 'When to Explore the Silence: Best Time to Visit Spiti',
    excerpt: 'A comprehensive guide on planning your Spiti adventure based on seasons and weather conditions.',
    author: 'Elena Rossi',
    date: '2024-01-15',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1200',
    content: `
      <p>Spiti is a destination that changes its character with every passing month. Choosing the "best time to visit Spiti" depends entirely on what you want to experience.</p>
      
      <h2 id="summer-season">Summer (June - September): The Golden Window</h2>
      <p>This is the most popular time to visit. All road routes are open, including the Rohtang and Kunzum passes. The weather is pleasant, and the sky is a deep blue.</p>
      
      <h2 id="winter-season">Winter (December - March): The White Spiti</h2>
      <p>For the brave, winter offers a "White Spiti" experience. The valley is covered in deep snow, and life moves at a glacial pace. It is the best time for snow leopard sightings.</p>
      
      <h2 id="monsoon-alert">Monsoon (July - August): A Word of Caution</h2>
      <p>While Spiti itself is a rain shadow area, the roads leading to it from Shimla or Manali can be dangerous due to landslides. Always check weather reports.</p>
    `
  }
];
