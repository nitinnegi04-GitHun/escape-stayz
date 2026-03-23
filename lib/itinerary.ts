// Add pricing information to each itinerary
export interface ItineraryPricing {
    budget: {
        basePrice: number;
        description: string;
    };
    standard: {
        basePrice: number;
        description: string;
    };
    premium: {
        basePrice: number;
        description: string;
    };
}

export const accommodationRates = [
    {
        id: 'budget',
        name: 'Budget',
        description: 'Clean, comfortable accommodations with basic amenities.',
        priceRange: '₹1,500 - ₹3,000 per night'
    },
    {
        id: 'standard',
        name: 'Standard',
        description: 'Well-appointed rooms with good amenities and services.',
        priceRange: '₹3,000 - ₹5,000 per night'
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'Luxury accommodations with excellent amenities and services.',
        priceRange: '₹5,000 - ₹8,000 per night'
    }
];

export const itineraries = [
    {
        id: 'spiti-kinnaur-chandertal',
        title: 'Spiti Kinnaur Circuit via Chandertal',
        subtitle: 'Complete circuit through Kinnaur and Spiti with Chandertal Lake',
        duration: '8 Days / 7 Nights',
        days: 8,
        pricing: {
            budget: {
                basePrice: 24999,
                description: 'Basic accommodations, shared transport'
            },
            standard: {
                basePrice: 34999,
                description: 'Comfortable hotels, private transport'
            },
            premium: {
                basePrice: 44999,
                description: 'Luxury stays, premium transport'
            }
        },
        image: 'https://res.cloudinary.com/dzsazqbfe/image/upload/v1741726792/pexels-nitish-kumar-1481859678-29549295_a3p82a.jpg',
        description: 'Experience the complete Spiti-Kinnaur circuit including the mesmerizing Chandertal Lake. This 8-day journey takes you through diverse landscapes, from the green valleys of Kinnaur to the high-altitude desert of Spiti, ending with the stunning Manali route.',
        bestMonths: 'June to October',
        highlights: [
            'Visit the mystical Chandertal Lake (Moon Lake)',
            'Stay at our luxury properties in Rakcham and Kaza',
            'Experience the dramatic landscape change from Kinnaur to Spiti',
            'Cross the challenging Kunzum Pass (4,590m)'
        ],
        itineraryDays: [
            {
                day: 1,
                title: 'Shimla to Narkanda',
                description: 'Start your journey from Shimla and drive to Narkanda. Check-in at Escape Inn Narkanda. Evening at leisure to acclimatize and enjoy mountain views.',
                overnight: 'Escape Inn Narkanda'
            },
            {
                day: 2,
                title: 'Narkanda to Rakcham',
                description: 'Drive to Rakcham through the beautiful Kinnaur Valley. Check-in at Escape Adventure Camps. Evening bonfire and stargazing.',
                overnight: 'Escape Adventure Camps, Rakcham'
            },
            {
                day: 3,
                title: 'Rakcham',
                description: 'Full day in Rakcham. Visit Chitkul, the last village on Indo-Tibet border. Optional short treks and local village visits.',
                overnight: 'Escape Adventure Camps, Rakcham'
            },
            {
                day: 4,
                title: 'Rakcham to Tabo',
                description: 'Drive to Tabo via Khab confluence and Nako Lake. Visit the 1000-year-old Tabo Monastery, a UNESCO World Heritage site.',
                overnight: 'Hotel in Tabo'
            },
            {
                day: 5,
                title: 'Tabo to Kaza',
                description: 'Drive to Kaza. Check-in at Escape Inn Kaza. Visit local monastery and acclimatize to the altitude.',
                overnight: 'Escape Inn Kaza'
            },
            {
                day: 6,
                title: 'Kaza Local Sightseeing',
                description: 'Visit Key Monastery, Kibber Village (4,270m), and Langza fossil village. Return to Kaza by evening.',
                overnight: 'Escape Inn Kaza'
            },
            {
                day: 7,
                title: 'Kaza to Chandertal',
                description: 'Drive to Chandertal Lake via Kunzum Pass. Camp near the lake. Evening lake visit and sunset views.',
                overnight: 'Camping at Chandertal'
            },
            {
                day: 8,
                title: 'Chandertal to Manali',
                description: 'Early morning lake visit. Drive to Manali via Rohtang Pass. Tour ends in Manali by evening.',
                overnight: 'N/A'
            }
        ],
        inclusions: [
            'Accommodation as per itinerary',
            'Breakfast and dinner at all hotels/camps',
            'All transfers and sightseeing by private vehicle',
            'Experienced driver familiar with the terrain',
            'Inner Line Permit for restricted areas',
            'Camping equipment at Chandertal',
            'All applicable taxes'
        ],
        exclusions: [
            'Airfare or train fare',
            'Lunch and any meals not mentioned in inclusions',
            'Personal expenses and tips',
            'Any activities not mentioned in the itinerary',
            'Travel insurance'
        ],
        notes: [
            'This route is only operational from June to October due to snow',
            'Chandertal camping is subject to weather conditions',
            'Proper acclimatization is crucial for this high-altitude journey',
            'Carry warm clothes as temperatures can drop significantly at night',
            'ATM facilities are limited in Spiti Valley, carry sufficient cash'
        ]
    },
    {
        id: 'spiti-kinnaur-shimla',
        title: 'Spiti Kinnaur Circuit via Shimla',
        subtitle: 'Complete circuit returning via Kalpa and Shimla',
        duration: '8 Days / 7 Nights',
        days: 8,
        pricing: {
            budget: {
                basePrice: 22999,
                description: 'Basic accommodations, shared transport'
            },
            standard: {
                basePrice: 32999,
                description: 'Comfortable hotels, private transport'
            },
            premium: {
                basePrice: 42999,
                description: 'Luxury stays, premium transport'
            }
        },
        image: 'https://res.cloudinary.com/dzsazqbfe/image/upload/v1741726784/pexels-dhruv-jangid-2945224-30255573_mpzm2r.jpg',
        description: 'Experience the complete Spiti-Kinnaur circuit returning via the scenic Kalpa route. This 8-day journey offers a perfect blend of adventure and comfort, ideal for off-season travel when the Manali route is closed.',
        bestMonths: 'Year-round except June-October',
        highlights: [
            'Stay at all three EscapeStayz properties',
            'Visit ancient monasteries and traditional villages',
            'Experience the best of both Kinnaur and Spiti valleys',
            'Enjoy stunning views of Kinner Kailash from Kalpa'
        ],
        itineraryDays: [
            {
                day: 1,
                title: 'Shimla to Narkanda',
                description: 'Start your journey from Shimla and drive to Narkanda. Check-in at Escape Inn Narkanda. Evening at leisure to acclimatize.',
                overnight: 'Escape Inn Narkanda'
            },
            {
                day: 2,
                title: 'Narkanda to Rakcham',
                description: 'Drive to Rakcham through the beautiful Kinnaur Valley. Check-in at Escape Adventure Camps. Evening bonfire and stargazing.',
                overnight: 'Escape Adventure Camps, Rakcham'
            },
            {
                day: 3,
                title: 'Rakcham',
                description: 'Full day in Rakcham. Visit Chitkul, the last village on Indo-Tibet border. Optional short treks and local village visits.',
                overnight: 'Escape Adventure Camps, Rakcham'
            },
            {
                day: 4,
                title: 'Rakcham to Tabo',
                description: 'Drive to Tabo via Khab confluence and Nako Lake. Visit the 1000-year-old Tabo Monastery, a UNESCO World Heritage site.',
                overnight: 'Hotel in Tabo'
            },
            {
                day: 5,
                title: 'Tabo to Kaza',
                description: 'Drive to Kaza. Check-in at Escape Inn Kaza. Visit local monastery and acclimatize to the altitude.',
                overnight: 'Escape Inn Kaza'
            },
            {
                day: 6,
                title: 'Kaza Local Sightseeing',
                description: 'Visit Key Monastery, Kibber Village (4,270m), and Langza fossil village. Return to Kaza by evening.',
                overnight: 'Escape Inn Kaza'
            },
            {
                day: 7,
                title: 'Kaza to Kalpa',
                description: 'Drive back to Kalpa. Evening at leisure to enjoy views of the Kinner Kailash range.',
                overnight: 'Hotel in Kalpa'
            },
            {
                day: 8,
                title: 'Kalpa to Shimla',
                description: 'Early morning Kinner Kailash views. Drive back to Shimla. Tour ends in Shimla by evening.',
                overnight: 'N/A'
            }
        ],
        inclusions: [
            'Accommodation as per itinerary',
            'Breakfast and dinner at all hotels/camps',
            'All transfers and sightseeing by private vehicle',
            'Experienced driver familiar with the terrain',
            'Inner Line Permit for restricted areas',
            'All applicable taxes'
        ],
        exclusions: [
            'Airfare or train fare',
            'Lunch and any meals not mentioned in inclusions',
            'Personal expenses and tips',
            'Any activities not mentioned in the itinerary',
            'Travel insurance'
        ],
        notes: [
            'This route is operational year-round except during heavy snowfall',
            'Proper acclimatization is crucial for this high-altitude journey',
            'Carry warm clothes as temperatures can drop significantly at night',
            'ATM facilities are limited in Spiti Valley, carry sufficient cash',
            'Road conditions can be challenging during winter months'
        ]
    },
    {
        id: 'kinnaur-valley-adventure',
        title: 'Kinnaur Valley Adventure',
        subtitle: 'Explore the hidden gems of Kinnaur Valley',
        duration: '5 Days / 4 Nights',
        days: 5,
        pricing: {
            budget: {
                basePrice: 15999,
                description: 'Basic accommodations, shared transport'
            },
            standard: {
                basePrice: 22999,
                description: 'Comfortable hotels, private transport'
            },
            premium: {
                basePrice: 29999,
                description: 'Luxury stays, premium transport'
            }
        },
        image: 'https://res.cloudinary.com/dzsazqbfe/image/upload/v1741726782/pexels-ex-route-adventures-656223369-20883703_lxo2xs.jpg',
        description: 'Experience the breathtaking beauty of Kinnaur Valley with this 5-day adventure. From the lush apple orchards to the towering peaks of the Himalayas, this journey takes you through some of the most picturesque landscapes in Himachal Pradesh.',
        bestMonths: 'May to October',
        highlights: [
            'Stay at the luxurious Escape Adventure Camps in Rakcham',
            'Visit the last village of India - Chitkul',
            'Experience the unique culture and traditions of Kinnaur',
            'Enjoy stunning views of the Kinner Kailash range'
        ],
        itineraryDays: [
            {
                day: 1,
                title: 'Shimla to Narkanda',
                description: 'Start your journey from Shimla and drive to Narkanda. Check-in at Escape Inn Narkanda. Evening at leisure to explore the local area and acclimatize to the altitude.',
                overnight: 'Escape Inn Narkanda'
            },
            {
                day: 2,
                title: 'Narkanda to Sangla',
                description: 'After breakfast, drive to Sangla Valley. En route, visit Batseri village and the Kamru Fort. Check-in at a local hotel in Sangla. Evening at leisure to explore the beautiful Sangla Valley.',
                overnight: 'Hotel in Sangla'
            },
            {
                day: 3,
                title: 'Sangla to Rakcham',
                description: 'After breakfast, drive to Rakcham. Check-in at Escape Adventure Camps. Afternoon trek to the nearby meadows. Evening bonfire and dinner at the camp.',
                overnight: 'Escape Adventure Camps, Rakcham'
            },
            {
                day: 4,
                title: 'Rakcham - Chitkul - Rakcham',
                description: 'After breakfast, drive to Chitkul, the last village on the Indo-Tibet border. Explore the village, visit the temple, and enjoy the stunning views. Return to Rakcham by evening.',
                overnight: 'Escape Adventure Camps, Rakcham'
            },
            {
                day: 5,
                title: 'Rakcham to Shimla',
                description: 'After breakfast, check-out from the camp and drive back to Shimla. En route, visit Sarahan and the Bhimakali Temple. Arrive in Shimla by evening.',
                overnight: 'N/A'
            }
        ],
        inclusions: [
            'Accommodation as per itinerary',
            'Breakfast and dinner at all hotels/camps',
            'All transfers and sightseeing by private vehicle',
            'Experienced local guide for treks',
            'All applicable taxes'
        ],
        exclusions: [
            'Airfare or train fare',
            'Lunch and any meals not mentioned in inclusions',
            'Personal expenses and tips',
            'Any activities not mentioned in the itinerary',
            'Travel insurance'
        ],
        notes: [
            'This itinerary can be customized as per your preferences',
            'The best time to visit is from May to October',
            'Carry warm clothes as evenings can be cold even in summer',
            'Inner Line Permit is required for some areas, which we will arrange'
        ]
    },
    {
        id: 'spiti-valley-expedition',
        title: 'Spiti Valley Expedition',
        subtitle: 'Journey through the moonland of Himalayas',
        duration: '7 Days / 6 Nights',
        days: 7,
        pricing: {
            budget: {
                basePrice: 19999,
                description: 'Basic accommodations, shared transport'
            },
            standard: {
                basePrice: 29999,
                description: 'Comfortable hotels, private transport'
            },
            premium: {
                basePrice: 39999,
                description: 'Luxury stays, premium transport'
            }
        },
        image: 'https://res.cloudinary.com/dzsazqbfe/image/upload/v1741726782/pexels-dhruv-jangid-2945224-30255571_necvz5.jpg',
        description: 'Embark on an unforgettable journey to the high-altitude desert of Spiti Valley. This 7-day expedition takes you through ancient monasteries, traditional villages, and stunning landscapes that seem straight out of another planet.',
        bestMonths: 'June to September',
        highlights: [
            'Stay at the comfortable Escape Inn Kaza',
            'Visit the 1000-year-old Key Monastery',
            'Experience the unique culture of Spiti Valley',
            'Explore the highest motorable villages in the world'
        ],
        itineraryDays: [
            {
                day: 1,
                title: 'Shimla to Narkanda',
                description: 'Start your journey from Shimla and drive to Narkanda. Check-in at Escape Inn Narkanda. Evening at leisure to explore the local area and acclimatize to the altitude.',
                overnight: 'Escape Inn Narkanda'
            },
            {
                day: 2,
                title: 'Narkanda to Kalpa',
                description: 'After breakfast, drive to Kalpa. En route, visit Sarahan and the Bhimakali Temple. Check-in at a hotel in Kalpa. Evening at leisure to enjoy the stunning views of the Kinner Kailash range.',
                overnight: 'Hotel in Kalpa'
            },
            {
                day: 3,
                title: 'Kalpa to Nako',
                description: 'After breakfast, drive to Nako. En route, visit Khab, the confluence of Sutlej and Spiti rivers. Check-in at a hotel in Nako. Explore Nako Lake and the ancient monastery.',
                overnight: 'Hotel in Nako'
            },
            {
                day: 4,
                title: 'Nako to Kaza',
                description: 'After breakfast, drive to Kaza. En route, visit Tabo Monastery, a UNESCO World Heritage Site. Check-in at Escape Inn Kaza. Evening at leisure to acclimatize to the high altitude.',
                overnight: 'Escape Inn Kaza'
            },
            {
                day: 5,
                title: 'Kaza - Key, Kibber, Langza - Kaza',
                description: 'After breakfast, visit Key Monastery, Kibber Village, and Langza. Return to Kaza by evening.',
                overnight: 'Escape Inn Kaza'
            },
            {
                day: 6,
                title: 'Kaza - Hikkim, Komic - Kaza',
                description: 'After breakfast, visit Hikkim (highest post office in the world) and Komic (highest motorable village in the world). Return to Kaza by evening.',
                overnight: 'Escape Inn Kaza'
            },
            {
                day: 7,
                title: 'Kaza to Manali',
                description: 'After breakfast, check-out from the hotel and drive to Manali via Kunzum Pass and Rohtang Pass. Arrive in Manali by evening.',
                overnight: 'N/A'
            }
        ],
        inclusions: [
            'Accommodation as per itinerary',
            'Breakfast and dinner at all hotels',
            'All transfers and sightseeing by private vehicle',
            'Inner Line Permit for restricted areas',
            'All applicable taxes'
        ],
        exclusions: [
            'Airfare or train fare',
            'Lunch and any meals not mentioned in inclusions',
            'Personal expenses and tips',
            'Any activities not mentioned in the itinerary',
            'Travel insurance'
        ],
        notes: [
            'This itinerary can be customized as per your preferences',
            'The best time to visit is from June to September',
            'Carry warm clothes as temperatures can drop significantly at night',
            'Altitude sickness is common, so proper acclimatization is important',
            'ATM facilities are limited in Spiti Valley, so carry sufficient cash'
        ]
    },
    {
        id: 'weekend-escape-narkanda',
        title: 'Weekend Escape to Narkanda',
        subtitle: 'Quick mountain getaway from Delhi/Chandigarh',
        duration: '3 Days / 2 Nights',
        days: 3,
        pricing: {
            budget: {
                basePrice: 8999,
                description: 'Basic accommodations, shared transport'
            },
            standard: {
                basePrice: 12999,
                description: 'Comfortable hotels, private transport'
            },
            premium: {
                basePrice: 16999,
                description: 'Luxury stays, premium transport'
            }
        },
        image: 'https://res.cloudinary.com/dzsazqbfe/image/upload/v1741726782/pexels-sakshi-patwa-3335937-5324311_ev9yvf.jpg',
        description: 'Perfect for a quick weekend getaway, this 3-day trip to Narkanda offers a refreshing mountain experience without venturing too far from Delhi or Chandigarh.',
        bestMonths: 'Year-round (Snow: Dec-Feb, Apple Blossoms: Mar-Apr)',
        highlights: [
            'Stay at the comfortable Escape Inn Narkanda',
            'Trek to Hatu Peak for panoramic Himalayan views',
            'Visit nearby apple orchards (seasonal)',
            'Experience snow activities in winter (December-February)'
        ],
        itineraryDays: [
            {
                day: 1,
                title: 'Delhi/Chandigarh to Narkanda',
                description: 'Start early from Delhi/Chandigarh and drive to Narkanda. Check-in at Escape Inn Narkanda. Evening at leisure to explore the local area.',
                overnight: 'Escape Inn Narkanda'
            },
            {
                day: 2,
                title: 'Narkanda - Hatu Peak - Narkanda',
                description: 'After breakfast, trek to Hatu Peak, the highest point in the area offering panoramic views of the Himalayas. Visit the Hatu Mata Temple. Return to Narkanda by evening.',
                overnight: 'Escape Inn Narkanda'
            },
            {
                day: 3,
                title: 'Narkanda to Delhi/Chandigarh',
                description: 'After breakfast, check-out from the hotel and drive back to Delhi/Chandigarh. En route, visit Thanedar, the birthplace of apple cultivation in India (if time permits).',
                overnight: 'N/A'
            }
        ],
        inclusions: [
            'Accommodation at Escape Inn Narkanda',
            'Breakfast and dinner',
            'All transfers and sightseeing by private vehicle',
            'All applicable taxes'
        ],
        exclusions: [
            'Airfare or train fare',
            'Lunch and any meals not mentioned in inclusions',
            'Personal expenses and tips',
            'Any activities not mentioned in the itinerary',
            'Travel insurance'
        ],
        notes: [
            'This itinerary can be customized as per your preferences',
            'The best time to visit is year-round, with each season offering a unique experience',
            'Winter (December-February) offers snow activities',
            'Spring (March-April) offers apple blossoms',
            'Summer (May-June) offers pleasant weather',
            'Autumn (September-November) offers apple harvesting'
        ]
    }
];