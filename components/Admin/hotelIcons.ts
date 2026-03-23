import {
    Wifi, Coffee, Utensils, Tv, Car, Bath, Bed, Sofa, Wind, Snowflake, Flame,
    Droplets, Shirt, Refrigerator, ChefHat, Wine, Plane, Train, Bus, Navigation,
    Compass, Map, MapPin, Globe, Luggage, Key, DoorOpen, Lamp, Sun, Eye, Speaker,
    Gamepad2, Book, Mountain, Trees, TreePine, Leaf, Waves, Flower2, Cloud, Moon,
    Sunrise, Sunset, Dumbbell, Bike, Camera, Music, Sparkles, Star, Gift, Heart,
    Shield, Zap, Phone, Clock, CheckCircle, Package, Briefcase, Heater, ParkingCircle,
    CookingPot, Microwave, AirVent, WashingMachine, Armchair, Telescope, Tent,
    Footprints, Anchor, Sailboat, Binoculars, TreeDeciduous, Shovel, Thermometer,
    BedDouble, BedSingle, UtensilsCrossed, MonitorCheck, Projector, Newspaper,
    FireExtinguisher, Accessibility, Baby, PawPrint, Flower, Rainbow, CloudRain,
    Snowflake as SnowflakeIcon, Wind as WindIcon, MountainSnow, PersonStanding,
    type LucideIcon,
} from 'lucide-react';

export interface HotelIconEntry {
    name: string;
    label: string;
    component: LucideIcon;
    category: string;
}

export const HOTEL_ICONS: HotelIconEntry[] = [
    // Connectivity & Entertainment
    { name: 'Wifi', label: 'WiFi', component: Wifi, category: 'Connectivity' },
    { name: 'Tv', label: 'Television', component: Tv, category: 'Connectivity' },
    { name: 'Speaker', label: 'Speaker', component: Speaker, category: 'Connectivity' },
    { name: 'Music', label: 'Music System', component: Music, category: 'Connectivity' },
    { name: 'Gamepad2', label: 'Games', component: Gamepad2, category: 'Connectivity' },
    { name: 'MonitorCheck', label: 'Smart TV', component: MonitorCheck, category: 'Connectivity' },
    { name: 'Projector', label: 'Projector', component: Projector, category: 'Connectivity' },
    { name: 'Newspaper', label: 'Newspaper', component: Newspaper, category: 'Connectivity' },

    // Food & Drink
    { name: 'Coffee', label: 'Coffee', component: Coffee, category: 'Food & Drink' },
    { name: 'Utensils', label: 'Dining', component: Utensils, category: 'Food & Drink' },
    { name: 'UtensilsCrossed', label: 'Restaurant', component: UtensilsCrossed, category: 'Food & Drink' },
    { name: 'ChefHat', label: 'Chef Kitchen', component: ChefHat, category: 'Food & Drink' },
    { name: 'Wine', label: 'Bar / Wine', component: Wine, category: 'Food & Drink' },
    { name: 'Refrigerator', label: 'Refrigerator', component: Refrigerator, category: 'Food & Drink' },
    { name: 'CookingPot', label: 'Cooking', component: CookingPot, category: 'Food & Drink' },
    { name: 'Microwave', label: 'Microwave', component: Microwave, category: 'Food & Drink' },

    // Room & Comfort
    { name: 'BedDouble', label: 'Double Bed', component: BedDouble, category: 'Room' },
    { name: 'BedSingle', label: 'Single Bed', component: BedSingle, category: 'Room' },
    { name: 'Bed', label: 'Bed', component: Bed, category: 'Room' },
    { name: 'Sofa', label: 'Sofa / Lounge', component: Sofa, category: 'Room' },
    { name: 'Armchair', label: 'Armchair', component: Armchair, category: 'Room' },
    { name: 'Lamp', label: 'Ambient Lighting', component: Lamp, category: 'Room' },
    { name: 'Key', label: 'Room Key', component: Key, category: 'Room' },
    { name: 'DoorOpen', label: 'Private Entry', component: DoorOpen, category: 'Room' },
    { name: 'Book', label: 'Library', component: Book, category: 'Room' },
    { name: 'Eye', label: 'Scenic View', component: Eye, category: 'Room' },

    // Bathroom
    { name: 'Bath', label: 'Bathtub', component: Bath, category: 'Bathroom' },
    { name: 'Droplets', label: 'Hot Water', component: Droplets, category: 'Bathroom' },
    { name: 'Thermometer', label: 'Geyser', component: Thermometer, category: 'Bathroom' },
    { name: 'Shirt', label: 'Wardrobe', component: Shirt, category: 'Bathroom' },
    { name: 'WashingMachine', label: 'Laundry', component: WashingMachine, category: 'Bathroom' },

    // Climate
    { name: 'Snowflake', label: 'Air Conditioning', component: Snowflake, category: 'Climate' },
    { name: 'Flame', label: 'Fireplace', component: Flame, category: 'Climate' },
    { name: 'Heater', label: 'Room Heater', component: Heater, category: 'Climate' },
    { name: 'AirVent', label: 'Ventilation', component: AirVent, category: 'Climate' },
    { name: 'Wind', label: 'Ceiling Fan', component: Wind, category: 'Climate' },
    { name: 'Sun', label: 'Sunlit Room', component: Sun, category: 'Climate' },

    // Travel & Transport
    { name: 'Car', label: 'Parking', component: Car, category: 'Travel' },
    { name: 'ParkingCircle', label: 'Parking Area', component: ParkingCircle, category: 'Travel' },
    { name: 'Plane', label: 'Airport Transfer', component: Plane, category: 'Travel' },
    { name: 'Train', label: 'Train Transfer', component: Train, category: 'Travel' },
    { name: 'Bus', label: 'Bus Transfer', component: Bus, category: 'Travel' },
    { name: 'Navigation', label: 'GPS / Navigation', component: Navigation, category: 'Travel' },
    { name: 'Compass', label: 'Guided Tours', component: Compass, category: 'Travel' },
    { name: 'Map', label: 'Local Map', component: Map, category: 'Travel' },
    { name: 'MapPin', label: 'Location', component: MapPin, category: 'Travel' },
    { name: 'Globe', label: 'International', component: Globe, category: 'Travel' },
    { name: 'Luggage', label: 'Luggage Storage', component: Luggage, category: 'Travel' },
    { name: 'Briefcase', label: 'Business Facilities', component: Briefcase, category: 'Travel' },

    // Nature & Mountain
    { name: 'Mountain', label: 'Mountain View', component: Mountain, category: 'Nature' },
    { name: 'MountainSnow', label: 'Snow View', component: MountainSnow, category: 'Nature' },
    { name: 'Trees', label: 'Forest', component: Trees, category: 'Nature' },
    { name: 'TreePine', label: 'Pine Forest', component: TreePine, category: 'Nature' },
    { name: 'TreeDeciduous', label: 'Garden Trees', component: TreeDeciduous, category: 'Nature' },
    { name: 'Leaf', label: 'Garden', component: Leaf, category: 'Nature' },
    { name: 'Flower2', label: 'Flower Garden', component: Flower2, category: 'Nature' },
    { name: 'Waves', label: 'Pool / Water', component: Waves, category: 'Nature' },
    { name: 'Anchor', label: 'Lakeside', component: Anchor, category: 'Nature' },
    { name: 'Sailboat', label: 'Boating', component: Sailboat, category: 'Nature' },
    { name: 'Cloud', label: 'Cloud View', component: Cloud, category: 'Nature' },
    { name: 'Moon', label: 'Stargazing', component: Moon, category: 'Nature' },
    { name: 'Sunrise', label: 'Sunrise View', component: Sunrise, category: 'Nature' },
    { name: 'Sunset', label: 'Sunset View', component: Sunset, category: 'Nature' },
    { name: 'Rainbow', label: 'Scenic Beauty', component: Rainbow, category: 'Nature' },
    { name: 'CloudRain', label: 'Rain View', component: CloudRain, category: 'Nature' },
    { name: 'Footprints', label: 'Trekking', component: Footprints, category: 'Nature' },
    { name: 'Tent', label: 'Camping', component: Tent, category: 'Nature' },
    { name: 'Telescope', label: 'Observatory', component: Telescope, category: 'Nature' },
    { name: 'Binoculars', label: 'Bird Watching', component: Binoculars, category: 'Nature' },
    { name: 'Shovel', label: 'Snow Activities', component: Shovel, category: 'Nature' },

    // Recreation & Wellness
    { name: 'Dumbbell', label: 'Gym', component: Dumbbell, category: 'Recreation' },
    { name: 'Bike', label: 'Cycling', component: Bike, category: 'Recreation' },
    { name: 'PersonStanding', label: 'Yoga', component: PersonStanding, category: 'Recreation' },
    { name: 'Camera', label: 'Photography', component: Camera, category: 'Recreation' },

    // Services & Facilities
    { name: 'Shield', label: 'Security', component: Shield, category: 'Services' },
    { name: 'Zap', label: 'Power Backup', component: Zap, category: 'Services' },
    { name: 'Phone', label: '24hr Support', component: Phone, category: 'Services' },
    { name: 'Clock', label: 'Check-in Flexible', component: Clock, category: 'Services' },
    { name: 'CheckCircle', label: 'All Inclusive', component: CheckCircle, category: 'Services' },
    { name: 'Package', label: 'Packages', component: Package, category: 'Services' },
    { name: 'FireExtinguisher', label: 'Fire Safety', component: FireExtinguisher, category: 'Services' },
    { name: 'Accessibility', label: 'Accessible', component: Accessibility, category: 'Services' },
    { name: 'Baby', label: 'Child Friendly', component: Baby, category: 'Services' },
    { name: 'PawPrint', label: 'Pet Friendly', component: PawPrint, category: 'Services' },

    // Luxury
    { name: 'Sparkles', label: 'Luxury', component: Sparkles, category: 'Luxury' },
    { name: 'Star', label: 'Premium', component: Star, category: 'Luxury' },
    { name: 'Gift', label: 'Special Package', component: Gift, category: 'Luxury' },
    { name: 'Heart', label: 'Honeymoon', component: Heart, category: 'Luxury' },
];

export const HOTEL_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
    HOTEL_ICONS.map(i => [i.name, i.component])
);

export const ICON_CATEGORIES = Array.from(new Set(HOTEL_ICONS.map(i => i.category)));
