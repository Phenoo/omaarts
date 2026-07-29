import { Activity, ActivityVariant } from '../types';

export interface PriceCalculationResult {
  subtotal: number;
  total: number;
  breakdown: string;
}

export function calculateActivityPrice(
  activity: Activity,
  selectedVariant: ActivityVariant | null,
  guests: number,
  hours: number = 1
): PriceCalculationResult {
  let subtotal = 0;
  let breakdown = '';

  const model = activity.pricingModel;

  switch (model) {
    case 'FIXED':
      subtotal = activity.basePrice;
      breakdown = `Fixed session price: ₦${activity.basePrice.toLocaleString()}`;
      break;

    case 'PER_PERSON':
      subtotal = activity.basePrice * guests;
      breakdown = `₦${activity.basePrice.toLocaleString()} x ${guests} ${guests === 1 ? 'guest' : 'guests'}`;
      break;

    case 'PER_HOUR':
      subtotal = activity.basePrice * hours;
      breakdown = `₦${activity.basePrice.toLocaleString()} x ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      break;

    case 'TIERED':
      // Specifically Karaoke:
      // Single/under 5: NGN 5,000 per hour
      // 5 persons & above: NGN 10,000 per hour
      // 10 persons & above: NGN 15,000 per hour
      let rate = activity.basePrice; // default 5000
      if (activity.id === 'full-karaoke-session') {
        if (guests >= 10) {
          rate = 15000;
        } else if (guests >= 5) {
          rate = 10000;
        } else {
          rate = 5000;
        }
      } else {
        // Fallback for general tiered
        if (guests >= 10 && activity.variants.find(v => v.id === 'group-large')) {
          rate = activity.variants.find(v => v.id === 'group-large')?.price || rate;
        } else if (guests >= 5 && activity.variants.find(v => v.id === 'group-medium')) {
          rate = activity.variants.find(v => v.id === 'group-medium')?.price || rate;
        } else {
          rate = activity.variants.find(v => v.id === 'single')?.price || activity.basePrice;
        }
      }
      subtotal = rate * hours;
      breakdown = `Tiered rate: ₦${rate.toLocaleString()}/hour x ${hours} ${hours === 1 ? 'hour' : 'hours'} (${guests} ${guests === 1 ? 'guest' : 'guests'})`;
      break;

    case 'VARIANT':
      if (selectedVariant) {
        // Some variant models are charged per person (e.g. bead making) and some are per session (e.g. hand moulding)
        const isPerPersonVariant = activity.priceUnit === 'person';
        const multiplier = isPerPersonVariant ? guests : 1;
        subtotal = selectedVariant.price * multiplier;
        breakdown = `${selectedVariant.name}: ₦${selectedVariant.price.toLocaleString()}${isPerPersonVariant ? ` x ${guests} ${guests === 1 ? 'guest' : 'guests'}` : ''}`;
      } else {
        // Fallback if no variant is specified
        subtotal = activity.basePrice * guests;
        breakdown = `Default base: ₦${activity.basePrice.toLocaleString()} x ${guests} ${guests === 1 ? 'guest' : 'guests'}`;
      }
      break;

    case 'BOOKING_ONLY':
      subtotal = 0;
      breakdown = 'Booking & enquiry only (no instant public payment)';
      break;

    case 'CUSTOM_QUOTE':
    default:
      subtotal = 0;
      breakdown = 'Enquiry based (custom quotation required)';
      break;
  }

  return {
    subtotal,
    total: subtotal, // Add taxes/fees here if required, otherwise matches subtotal
    breakdown,
  };
}
