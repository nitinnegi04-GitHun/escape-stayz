-- Populate data for Narkanda
INSERT INTO destinations (
    slug,
    name,
    description,
    long_description,
    image_url,
    hero_image,
    altitude,
    weather_info,
    distance_from_major_hub,
    languages_spoken,
    how_to_reach,
    local_cuisine,
    coordinates,
    best_time_to_visit,
    things_to_do,
    faqs,
    travel_tips,
    meta_title,
    meta_description
) VALUES (
    'narkanda',
    'Narkanda',
    'A serene skiing destination surrounded by apple orchards and dense forests, offering panoramic views of the snow-capped Himalayas.',
    'Perched at an altitude of 2708 meters on the Hindustan-Tibet Road (NH 5), Narkanda offers a spectacular view of the snow ranges. This is an ideal retreat for those who seek seclusion in the mountains. It is famous for its apple orchards and dense forests of oak and cedar. \n\nDuring winter, Narkanda transforms into a skiing resort. The slopes of Hatu Peak are perfect for skiing enthusiasts. In summer, it is a haven for trekkers and nature lovers.',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3', -- Placeholder Unsplash image for Narkanda
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3',
    '2,708 m (8,885 ft)',
    'Cool summers (10°C to 25°C) and snowy winters (-5°C to 10°C). Heavy snowfall from December to February.',
    '60 km from Shimla',
    ARRAY['Hindi', 'English', 'Pahari'],
    '[
        {
            "mode": "Air",
            "hub": "Shimla Airport (Jubbarhatti)",
            "distance": "85 km",
            "time": "3 hours",
            "details": "The nearest airport is at Jubbarhatti, 23 km from Shimla. From there, you can hire a taxi to Narkanda."
        },
        {
            "mode": "Train",
            "hub": "Shimla Railway Station",
            "distance": "65 km",
            "time": "2.5 hours",
            "details": "Shimla is connected by a narrow gauge railway from Kalka. The Toy Train ride is a UNESCO World Heritage experience."
        },
        {
            "mode": "Road",
            "hub": "Shimla",
            "distance": "60 km",
            "time": "2 hours",
            "details": "Narkanda is well-connected by NH 5 from Shimla. The drive through the pine forests is scenic and smooth."
        }
    ]'::jsonb,
    '{
        "intro": "Narkanda offers authentic Himachali cuisine, characterized by the use of yogurt, cardamom, and heavy spices. Being an apple belt, apple-based desserts are also popular.",
        "dishes": [
            {
                "name": "Siddu",
                "description": "Steamed wheat buns stuffed with poppy seeds or walnuts, served with ghee.",
                "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3"
            },
            {
                "name": "Madra",
                "description": "Chickpeas cooked in a yogurt-based gravy with exotic spices.",
                "image": "https://images.unsplash.com/photo-1585937421612-70a008356f36?ixlib=rb-4.0.3"
            }
        ]
    }'::jsonb,
    '{"lat": 31.2596, "lng": 77.4608}'::jsonb,
     '[
        {
            "season": "Winter (Dec - Feb)",
            "months": "December to February",
            "description": "Perfect for skiing and snow activities. The entire landscape is covered in a thick blanket of snow."
        },
        {
            "season": "Summer (Apr - Jun)",
            "months": "April to June",
            "description": "Pleasant weather, ideal for sightseeing, trekking to Hatu Peak, and exploring apple orchards."
        },
        {
            "season": "Autumn (Sep - Nov)",
            "months": "September to November",
            "description": "Clear skies and crisp air. The apple harvest season is in full swing."
        }
    ]'::jsonb,
    '[
        {
            "title": "Skiing at Narkanda",
            "category": "Adventure",
            "description": "Narkanda is one of the oldest skiing destinations in India. The slopes are suitable for both beginners and experienced skiers.",
            "imageUrl": "https://images.unsplash.com/photo-1551524164-687a55dd1126?ixlib=rb-4.0.3"
        },
        {
            "title": "Hatu Peak Trek",
            "category": "Trekking",
            "description": "A 7km trek from Narkanda leads to Hatu Peak (3400m), offering 360-degree views of the Himalayas.",
            "imageUrl": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3"
        },
        {
            "title": "Visit Tannu Jubbar Lake",
            "description": "A small, picturesque lake surrounded by trees, perfect for a picnic and a peaceful afternoon.",
            "imageUrl": "https://images.unsplash.com/photo-1596423985040-086c2e391694?ixlib=rb-4.0.3"
        }
    ]'::jsonb,
    '[
        {
            "question": "Is there snowfall in Narkanda?",
            "answer": "Yes, Narkanda receives heavy snowfall during winter months (December to February), making it a popular skiing destination."
        },
        {
            "question": "How far is Narkanda from Shimla?",
            "answer": "Narkanda is approximately 60 km from Shimla and takes about 2 hours by road."
        }
    ]'::jsonb,
    '["Carry heavy woolens if visiting in winter.", "Book hotels in advance during peak ski season.", "Roads can be slippery in winter; drive carefully."]'::jsonb,
    'Narkanda Travel Guide | Skiing, Hatu Peak & Apple Orchards',
    'Plan your trip to Narkanda with Escape Stayz. Discover skiing slopes, Hatu Peak, weather info, and best hotels in Narkanda.'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    long_description = EXCLUDED.long_description,
    image_url = EXCLUDED.image_url,
    hero_image = EXCLUDED.hero_image,
    altitude = EXCLUDED.altitude,
    weather_info = EXCLUDED.weather_info,
    distance_from_major_hub = EXCLUDED.distance_from_major_hub,
    languages_spoken = EXCLUDED.languages_spoken,
    how_to_reach = EXCLUDED.how_to_reach,
    local_cuisine = EXCLUDED.local_cuisine,
    coordinates = EXCLUDED.coordinates,
    best_time_to_visit = EXCLUDED.best_time_to_visit,
    things_to_do = EXCLUDED.things_to_do,
    faqs = EXCLUDED.faqs,
    travel_tips = EXCLUDED.travel_tips,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description;

-- Populate data for Rakcham
INSERT INTO destinations (
    slug,
    name,
    description,
    long_description,
    image_url,
    hero_image,
    altitude,
    weather_info,
    distance_from_major_hub,
    languages_spoken,
    how_to_reach,
    local_cuisine,
    coordinates,
    best_time_to_visit,
    things_to_do,
    faqs,
    travel_tips,
    meta_title,
    meta_description
) VALUES (
    'rakcham',
    'Rakcham',
    'A hidden gem in the Sangla Valley, Rakcham is a picturesque village sitting by the Baspa River, known for its pink buckwheat fields.',
    'Rakcham is a quaint village situated in the Baspa Valley of Kinnaur, located midway between Sangla and Chitkul. At an altitude of 3050 meters, it is often described as a place where time stands still. The village is surrounded by glacier-clad mountains and dense forests of pine and cedar.\n\nRakcham is famous for its pink buckwheat fields that bloom in summer, creating a stunning contrast against the rugged mountains. It is also the start of several treks and a perfect spot for trout fishing in the Baspa River.',
    'https://images.unsplash.com/photo-1623164348509-f537021e1022?ixlib=rb-4.0.3', -- Placeholder Unsplash image for Kinnaur/Rakcham
    'https://images.unsplash.com/photo-1623164348509-f537021e1022?ixlib=rb-4.0.3',
    '3,050 m (10,006 ft)',
    'Cold and crisp year-round. Summers are pleasant (10°C to 20°C). Winters are harsh with heavy snow, often cutting off road access.',
    '13 km from Sangla',
    ARRAY['Kinnauri', 'Hindi', 'English'],
    '[
        {
            "mode": "Road",
            "hub": "Shimla",
            "distance": "230 km",
            "time": "8-9 hours",
            "details": "The drive from Shimla via Rampur and Karcham is adventurous. The road follows the Satluj and then the Baspa river."
        },
        {
            "mode": "Air",
            "hub": "Shimla Airport (Jubbarhatti)",
            "distance": "250 km",
            "time": "9-10 hours",
            "details": "Nearest airport is in Shimla. Due to distance, road travel from Chandigarh or Shimla is preferred."
        }
    ]'::jsonb,
    '{
        "intro": "Kinnauri cuisine is hearty and warming. Buckwheat (Ogla/Phaphra) is a staple grain here.",
        "dishes": [
            {
                "name": "Chilta",
                "description": "Pancakes made from buckwheat flour, often served with chutney or butter.",
                "image": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3"
            },
            {
                "name": "Thukpa",
                "description": "Tibetan noodle soup, popular in the cold climate for its warmth.",
                "image": "https://images.unsplash.com/photo-1625167359766-1514a586b614?ixlib=rb-4.0.3"
            }
        ]
    }'::jsonb,
    '{"lat": 31.3926, "lng": 78.3347}'::jsonb,
     '[
        {
            "season": "Summer (Apr - Jun)",
            "months": "April to June",
            "description": "Best time to visit. The valley is green, and the weather is pleasant."
        },
        {
            "season": "Monsoon (Jul - Aug)",
            "months": "July to August",
            "description": "Rainfall can cause landslides, but the valley becomes lush green. The buckwheat flowers bloom in late summer."
        },
        {
            "season": "Autumn (Sep - Oct)",
            "months": "September to October",
            "description": "Excellent time for photography with clear blue skies and colorful foliage."
        }
    ]'::jsonb,
    '[
        {
            "title": "Walk by the Baspa River",
            "description": "Enjoy a peaceful walk along the turquoise waters of the Baspa River, surrounded by cedar forests.",
            "imageUrl": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3"
        },
        {
            "title": "Visit Chitkul",
            "description": "Drive 10km further to Chitkul, the last inhabited village on the Indo-Tibetan border.",
            "imageUrl": "https://images.unsplash.com/photo-1616428782352-79010375a34f?ixlib=rb-4.0.3"
        },
        {
            "title": "Trek to Glaciers",
            "description": "Several short treks lead towards the glaciers visible from the village.",
            "imageUrl": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3"
        }
    ]'::jsonb,
    '[
        {
            "question": "Is Rakcham open in winter?",
            "answer": "Rakcham receives heavy snowfall in winter, and the road is often closed or difficult to navigate. It is best visited from April to October."
        },
        {
            "question": "Are there hotels in Rakcham?",
            "answer": "Yes, there are several hotels, guest houses, and camps available in Rakcham."
        }
    ]'::jsonb,
    '["Carry warm clothes even in summer as evenings can be chilly.", "Road conditions can be rough; an SUV is recommended.", "ATMs are scarce; carry sufficient cash."]'::jsonb,
    'Rakcham Travel Guide | Sangla Valley, Baspa River & Kinnaur',
    'Explore Rakcham in Sangla Valley. Discover the pink buckwheat fields, Baspa River, and authentic Kinnauri culture with Escape Stayz.'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    long_description = EXCLUDED.long_description,
    image_url = EXCLUDED.image_url,
    hero_image = EXCLUDED.hero_image,
    altitude = EXCLUDED.altitude,
    weather_info = EXCLUDED.weather_info,
    distance_from_major_hub = EXCLUDED.distance_from_major_hub,
    languages_spoken = EXCLUDED.languages_spoken,
    how_to_reach = EXCLUDED.how_to_reach,
    local_cuisine = EXCLUDED.local_cuisine,
    coordinates = EXCLUDED.coordinates,
    best_time_to_visit = EXCLUDED.best_time_to_visit,
    things_to_do = EXCLUDED.things_to_do,
    faqs = EXCLUDED.faqs,
    travel_tips = EXCLUDED.travel_tips,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description;
