import { Activity, Artwork, ActivityVariant } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  // Simple check for Nigerian/International numbers
  const clean = phone.replace(/[^0-9+]/g, '');
  return clean.length >= 8 && clean.length <= 15;
}

export function validateBookingInput(data: {
  customerName: string;
  email: string;
  phone: string;
  date: string;
  startTime: string;
  numberOfGuests: number;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.customerName.trim()) {
    errors.push({ field: 'customerName', message: 'Name is required' });
  }

  if (!data.email.trim() || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!data.phone.trim() || !validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'A valid phone number is required' });
  }

  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.push({ field: 'date', message: 'Date cannot be in the past' });
    }
  }

  if (!data.startTime) {
    errors.push({ field: 'startTime', message: 'Time slot is required' });
  }

  if (!data.numberOfGuests || data.numberOfGuests < 1) {
    errors.push({ field: 'numberOfGuests', message: 'At least 1 guest is required' });
  }

  return errors;
}

export function validateOrderInput(data: {
  customerName: string;
  email: string;
  phone: string;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.customerName.trim()) {
    errors.push({ field: 'customerName', message: 'Name is required' });
  }

  if (!data.email.trim() || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!data.phone.trim() || !validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'A valid phone number is required' });
  }

  if (data.deliveryOption === 'delivery' && (!data.deliveryAddress || !data.deliveryAddress.trim())) {
    errors.push({ field: 'deliveryAddress', message: 'Delivery address is required' });
  }

  return errors;
}

export function validateActivityInput(data: Partial<Activity>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name?.trim()) {
    errors.push({ field: 'name', message: 'Activity name is required' });
  }

  if (!data.slug?.trim()) {
    errors.push({ field: 'slug', message: 'Slug is required' });
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push({ field: 'slug', message: 'Slug must be lowercase alphanumeric and hyphens only' });
  }

  if (!data.description?.trim()) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  if (data.basePrice === undefined || data.basePrice < 0) {
    errors.push({ field: 'basePrice', message: 'Base price must be 0 or greater' });
  }

  if (!data.pricingModel) {
    errors.push({ field: 'pricingModel', message: 'Pricing model is required' });
  }

  if (!data.duration?.trim()) {
    errors.push({ field: 'duration', message: 'Duration description is required (e.g. 2 hours)' });
  }

  return errors;
}

export function validateArtworkInput(data: Partial<Artwork>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Artwork title is required' });
  }

  if (!data.slug?.trim()) {
    errors.push({ field: 'slug', message: 'Slug is required' });
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push({ field: 'slug', message: 'Slug must be lowercase alphanumeric and hyphens only' });
  }

  if (!data.artist?.trim()) {
    errors.push({ field: 'artist', message: 'Artist is required' });
  }

  if (!data.medium?.trim()) {
    errors.push({ field: 'medium', message: 'Medium is required' });
  }

  if (!data.dimensions?.trim()) {
    errors.push({ field: 'dimensions', message: 'Dimensions is required' });
  }

  if (data.price === undefined || data.price < 0) {
    errors.push({ field: 'price', message: 'Price must be 0 or greater' });
  }

  if (data.inventoryQty === undefined || data.inventoryQty < 0) {
    errors.push({ field: 'inventoryQty', message: 'Inventory quantity must be 0 or greater' });
  }

  if (!data.status) {
    errors.push({ field: 'status', message: 'Status is required' });
  }

  return errors;
}
