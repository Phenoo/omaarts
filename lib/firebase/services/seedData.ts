import { db } from '../config';
import { collection, doc, writeBatch, getDoc } from 'firebase/firestore';
import { Activity } from '../../types';
import { ACTIVITY_IMAGES } from '../../activityImages';

export const INITIAL_ACTIVITIES: Omit<Activity, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'paint-and-sip',
    name: 'Paint and Sip',
    slug: 'paint-and-sip',
    description: 'A relaxed social painting experience. Paint your canvas while sipping your choice of complimentary drinks and enjoying great music.',
    shortDescription: 'Social guided painting experience with drinks & music.',
    images: ['/images/events/IMG_5527.JPG'],
    basePrice: 15000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '2 hours',
    complimentaryItems: ['1 Complimentary Drink', 'Guided Prompting', 'Art Supplies', 'Games'],
    category: 'Painting',
    active: true,
    featured: true,
    bookingEnabled: true,
    sortOrder: 1,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'tote-bag-painting',
    name: 'Tote Bag Painting',
    slug: 'tote-bag-painting',
    description: 'Express your style on a wearable canvas. Design and paint your own custom tote bag to take home.',
    shortDescription: 'Customize and paint your own canvas tote bag.',
    images: ACTIVITY_IMAGES['tote-bag-painting'],
    basePrice: 12000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '2 hours',
    complimentaryItems: ['Tote Bag', 'Art Supplies', '1 Complimentary Drink', 'Music & Games'],
    category: 'Crafts',
    active: true,
    featured: true,
    bookingEnabled: true,
    sortOrder: 2,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 't-shirt-painting',
    name: 'T-shirt Painting',
    slug: 't-shirt-painting',
    description: 'Design and paint custom patterns on high-quality t-shirts. Make your own fashion statement.',
    shortDescription: 'Paint your own custom design on a T-shirt.',
    images: ['/images/events/IMG_1325.JPG'],
    basePrice: 15000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '2 hours',
    complimentaryItems: ['Premium T-shirt', 'Art Supplies', '1 Complimentary Drink', 'Music & Games'],
    category: 'Crafts',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 3,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'cap-painting',
    name: 'Cap Painting',
    slug: 'cap-painting',
    description: 'Paint custom designs on a stylish baseball cap. The ultimate wearable art workshop.',
    shortDescription: 'Custom paint your own baseball cap.',
    images: ACTIVITY_IMAGES['cap-painting'],
    basePrice: 10000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '1.5 hours',
    complimentaryItems: ['Baseball Cap', 'Art Supplies', '1 Complimentary Drink', 'Music & Games'],
    category: 'Crafts',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 4,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'hand-moulding',
    name: 'Hand Moulding',
    slug: 'hand-moulding',
    description: 'Create a beautiful 3D sculpture of your hands. Keep a memory frozen in time.',
    shortDescription: '3D lifelike hand sculpture casting experience.',
    images: ACTIVITY_IMAGES['hand-moulding'],
    basePrice: 20000, // base price represents single
    currency: 'NGN',
    pricingModel: 'VARIANT',
    variants: [
      { id: 'single', name: 'Single Mould', price: 20000, description: 'Cast a sculpture of a single hand' },
      { id: 'double', name: 'Double Mould', price: 30000, description: 'Cast a sculpture of two hands holding' }
    ],
    priceUnit: 'session',
    duration: '2.5 hours',
    complimentaryItems: ['Moulding Gel & Plaster', 'Detailed Casting', '1 Complimentary Drink', 'Music & Games'],
    category: 'Sculpting',
    active: true,
    featured: true,
    bookingEnabled: true,
    sortOrder: 5,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'glow-in-the-dark-painting',
    name: 'Glow in the Dark Painting',
    slug: 'glow-in-the-dark-painting',
    description: 'Paint in a dark studio using fluorescent paints and UV neon blacklights. A visually stunning, social experience.',
    shortDescription: 'Fluorescent paint experience under UV blacklights.',
    images: ['/images/events/IMG_5525.JPG'],
    basePrice: 15000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '2 hours',
    complimentaryItems: ['Fluorescent Paint', 'Canvas', '1 Complimentary Drink', 'UV Lights', 'Music & Games'],
    category: 'Painting',
    active: true,
    featured: true,
    bookingEnabled: true,
    sortOrder: 6,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'pour-art',
    name: 'Pour Art (Fluid Painting)',
    slug: 'pour-art',
    description: 'Learn fluid acrylic techniques. Pour paint onto your canvas to create beautiful, abstract marble effects.',
    shortDescription: 'Create abstract marble fluid art paintings.',
    images: ['/images/events/IMG_1279.JPG'],
    basePrice: 12000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '1.5 hours',
    complimentaryItems: ['Fluid Mediums', 'Canvas', '1 Complimentary Drink', 'Music & Games'],
    category: 'Painting',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 7,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'mug-painting',
    name: 'Mug Painting',
    slug: 'mug-painting',
    description: 'Hand paint a ceramic coffee mug. Bring your morning coffee to life with personalized art.',
    shortDescription: 'Design and paint your own ceramic coffee mug.',
    images: ACTIVITY_IMAGES['mug-painting'],
    basePrice: 10000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '1.5 hours',
    complimentaryItems: ['Ceramic Mug', 'Ceramic Paint', '1 Complimentary Drink', 'Music & Games'],
    category: 'Crafts',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 8,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'flower-pot-painting',
    name: 'Flower Pot / Vase Painting',
    slug: 'flower-pot-painting',
    description: 'Decorate clay flower pots or ceramic vases. Perfect for bringing some art to your home plants.',
    shortDescription: 'Paint custom designs on clay flower pots or vases.',
    images: ACTIVITY_IMAGES['flower-pot-painting'],
    basePrice: 15000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '2 hours',
    complimentaryItems: ['Clay Pot or Vase', 'Art Supplies', '1 Complimentary Drink', 'Music & Games'],
    category: 'Crafts',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 9,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'scented-candle-making',
    name: 'Scented Candle Making',
    slug: 'scented-candle-making',
    description: 'Learn the craft of soy candle pouring. Mix your own custom scents, colors, and take home a beautiful jar candle.',
    shortDescription: 'Craft and pour your own custom scented soy candles.',
    images: ACTIVITY_IMAGES['scented-candle-making'],
    basePrice: 15000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '2 hours',
    complimentaryItems: ['Soy Wax & Scent Oils', 'Glass Jar', '1 Complimentary Drink', 'Music & Games'],
    category: 'Crafts',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 10,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'bead-making',
    name: 'Bead Making',
    slug: 'bead-making',
    description: 'Design and string your own jewelry. Craft custom glass, clay, or traditional beads into bracelets, bangles, or neck pieces.',
    shortDescription: 'Design and make your own custom beaded jewelry.',
    images: ['/images/events/IMG_1300.JPG'],
    basePrice: 5000,
    currency: 'NGN',
    pricingModel: 'VARIANT',
    variants: [
      { id: 'bangles', name: 'Bangles / Bracelets', price: 5000, description: 'Design beaded bracelets or bangles' },
      { id: 'neckpieces', name: 'Neck Pieces & Others', price: 10000, description: 'Design beaded neck pieces and complete sets' }
    ],
    priceUnit: 'person',
    duration: '1.5 hours',
    complimentaryItems: ['Premium Beads Selection', 'Jewelry Findings', '1 Complimentary Drink', 'Music & Games'],
    category: 'Crafts',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 11,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'face-painting',
    name: 'Face Painting',
    slug: 'face-painting',
    description: 'Get artistic face paint transformations. Perfect for events, kids, parties, or creative photography.',
    shortDescription: 'Professional artistic face painting designs.',
    images: ['/images/events/IMG_1305.JPG'],
    basePrice: 1500,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person', // The administrator can edit this unit in the CMS settings
    duration: '15 mins',
    complimentaryItems: ['Hypoallergenic paints', 'Quick painting'],
    category: 'Body Art',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 12,
    complimentaryText: 'Music and Games'
  },
  {
    id: 'body-painting',
    name: 'Body Painting',
    slug: 'body-painting',
    description: 'Artistic body paint transformations for festivals, shoots, or celebrations.',
    shortDescription: 'Custom, temporary artistic body painting.',
    images: ['/images/events/IMG_1309.JPG'],
    basePrice: 3000,
    currency: 'NGN',
    pricingModel: 'PER_PERSON',
    variants: [],
    priceUnit: 'person',
    duration: '30 mins',
    complimentaryItems: ['Body-safe paints', 'Custom design session'],
    category: 'Body Art',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 13,
    complimentaryText: 'Music and Games'
  },
  {
    id: 'full-karaoke-session',
    name: 'Full Karaoke Session',
    slug: 'full-karaoke-session',
    description: 'Rent our private sound room. Enjoy singing your lungs out with state-of-the-art microphones, acoustics, and video screens.',
    shortDescription: 'Private group karaoke room bookings per hour.',
    images: ['/images/events/IMG_1366.JPG'],
    basePrice: 5000,
    currency: 'NGN',
    pricingModel: 'TIERED', // Tiered + hourly pricing
    variants: [
      { id: 'single', name: 'Single Person (per hour)', price: 5000, description: 'Solo singing session' },
      { id: 'group-medium', name: '5 Persons & above (per hour)', price: 10000, description: 'Group singing up to 9 people' },
      { id: 'group-large', name: '10 Persons & above (per hour)', price: 15000, description: 'Large group singing 10+ people' }
    ],
    priceUnit: 'hour',
    duration: '1 hour',
    complimentaryItems: ['HD Video Screen', 'Double Wireless Mics', 'Complimentary Soft Drinks', 'Sound Control Room'],
    category: 'Entertainment',
    active: true,
    featured: true,
    bookingEnabled: true,
    sortOrder: 14,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'trivia-game-nights',
    name: 'Trivia Game Nights',
    slug: 'trivia-game-nights',
    description: 'Competitive, fun trivia quiz game nights with prizes, hosted by Oma. Custom questions based on themes.',
    shortDescription: 'Interactive trivia game showdowns. Booking only.',
    images: ['/images/events/IMG_1373.JPG'],
    basePrice: 0,
    currency: 'NGN',
    pricingModel: 'BOOKING_ONLY',
    variants: [],
    priceUnit: 'group',
    duration: '2 hours',
    complimentaryItems: ['Game Buzzer Equipment', 'Custom Questions Pack', 'Prizes for Winners', 'Music & host'],
    category: 'Entertainment',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 15,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  },
  {
    id: 'board-card-games',
    name: 'Board & Card Games',
    slug: 'board-card-games',
    description: 'Access our full collection of board, tabletop, and card games. Enjoy with drinks and friends in a cozy atmosphere.',
    shortDescription: 'Tabletop, card and board games pass.',
    images: ACTIVITY_IMAGES['board-card-games'],
    basePrice: 0,
    currency: 'NGN',
    pricingModel: 'CUSTOM_QUOTE', // Booking/enquiry based unless price configured
    variants: [],
    priceUnit: 'person',
    duration: 'Unlimited',
    complimentaryItems: ['Access to 30+ games', 'Snack bowls'],
    category: 'Entertainment',
    active: true,
    featured: false,
    bookingEnabled: true,
    sortOrder: 16,
    complimentaryText: 'Complimentary Drinks, Music and Games'
  }
];

export async function seedActivities(): Promise<{ success: boolean; count: number; error?: unknown }> {
  try {
    const batch = writeBatch(db);
    const colRef = collection(db, 'activities');
    let count = 0;

    for (const act of INITIAL_ACTIVITIES) {
      const docRef = doc(colRef, act.id);
      
      // We check if it already exists before creating to prevent accidental overwrites
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        const fullDoc = {
          ...act,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batch.set(docRef, fullDoc);
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
    return { success: true, count };
  } catch (error) {
    console.error('Seeding activities error:', error);
    return { success: false, count: 0, error };
  }
}
