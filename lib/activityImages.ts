import type { Activity } from './types';

export const ACTIVITY_IMAGES: Record<string, string[]> = {
  'cap-painting': [
    '/images/activities/cap-painting-naruto.jpg',
    '/images/activities/cap-painting-mario.jpg',
    '/images/activities/cap-painting-red.jpg',
    '/images/activities/cap-painting-process.jpg',
    '/images/activities/cap-painting-sunset.jpg',
    '/images/activities/cap-painting-gallery.jpg',
    '/images/activities/cap-painting-collage.jpg',
  ],
  'tote-bag-painting': [
    '/images/activities/tote-bag-rainbow.jpg',
    '/images/activities/tote-bag-flames.jpg',
    '/images/activities/tote-bag-sunflower.jpg',
    '/images/activities/tote-bag-tom-jerry.jpg',
    '/images/activities/tote-bag-model.jpg',
    '/images/activities/tote-bag-gallery.jpg',
  ],
  'mug-painting': [
    '/images/activities/mug-painting-sunflower.jpg',
    '/images/activities/mug-painting-cat.jpg',
    '/images/activities/mug-painting-kitten.jpg',
  ],
  'flower-pot-painting': [
    '/images/activities/flower-pot-painted-blue.webp',
    '/images/activities/flower-pot-painted-green.webp',
    '/images/activities/flower-pot-painting-ideas.webp',
    '/images/activities/flower-pot-painting-gallery.jpg',
  ],
  'scented-candle-making': [
    '/images/activities/candle-making-lavender.jpg',
    '/images/activities/candle-making-jar.jpg',
    '/images/activities/candle-making-inspiration.png',
  ],
  'hand-moulding': [
    '/images/activities/hand-moulding-front.jpg',
    '/images/activities/hand-moulding-side.jpg',
  ],
  'board-card-games': ['/images/activities/board-card-games.jpg'],
};

export function withActivityImages(activity: Activity): Activity {
  if (Array.isArray(activity.images) && activity.images.length > 0) {
    return activity;
  }
  const fallback = ACTIVITY_IMAGES[activity.slug] || ['/images/studio/IMG_0889.png'];
  return { ...activity, images: fallback };
}
