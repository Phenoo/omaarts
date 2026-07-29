'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ActivityVariant } from '../../lib/types';
import DatePicker from './DatePicker';
import TimeSlotPicker from './TimeSlotPicker';
import { calculateActivityPrice } from '../../lib/utils/pricing';
import { validateBookingInput, ValidationError } from '../../lib/validation';
import { Calendar, Users, Clock, CreditCard, ClipboardList } from 'lucide-react';

interface BookingFormProps {
  activity: Activity;
  onSuccess?: (bookingData: any) => void;
}

export default function BookingForm({ activity, onSuccess }: BookingFormProps) {
  // Contact details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Selection details
  const [selectedVariant, setSelectedVariant] = useState<ActivityVariant | null>(
    activity.variants.length > 0 ? activity.variants[0] : null
  );
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [guests, setGuests] = useState(1);
  const [durationHours, setDurationHours] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');

  // UI States
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Default slots (Can be customized via site settings later)
  const defaultSlots = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

  // Re-calculate price on selection change
  const priceResult = calculateActivityPrice(activity, selectedVariant, guests, durationHours);

  // Clear errors when values change
  const clearError = (field: string) => {
    setErrors((prev) => prev.filter((err) => err.field !== field));
  };

  const getFieldError = (field: string) => {
    return errors.find((err) => err.field === field)?.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    const customerName = `${firstName} ${lastName}`.trim();
    const validationErrors = validateBookingInput({
      customerName,
      email,
      phone,
      date,
      startTime,
      numberOfGuests: guests,
    });

    if (firstName.trim() === '') {
      validationErrors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (lastName.trim() === '') {
      validationErrors.push({ field: 'lastName', message: 'Last name is required' });
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Scroll to the first error
      const firstErrorEl = document.getElementById(`err-${validationErrors[0].field}`);
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      // Post to checkout initialization route
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking',
          firstName,
          lastName,
          email,
          phone,
          activityId: activity.id,
          variantId: selectedVariant?.id || "null",
          date,
          startTime,
          numberOfGuests: guests,
          durationHours: activity.pricingModel === 'TIERED' || activity.pricingModel === 'PER_HOUR' ? durationHours : 1,
          specialRequests,
          bookingNotes,
          amount: priceResult.total,
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.success === false) {
        throw new Error(resData.error || 'Failed to initialize booking payment');
      }

      if (resData.authorizationUrl) {
        // Redirect client to Paystack Gateway checkout page
        window.location.href = resData.authorizationUrl;
      } else {
        throw new Error('No checkout URL returned from payment server');
      }
    } catch (err: any) {
      console.error('Booking checkout error:', err);
      setSubmitError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const isBookingOnly = activity.pricingModel === 'BOOKING_ONLY' || activity.pricingModel === 'CUSTOM_QUOTE';

  return (
    <form onSubmit={handleSubmit} className="section-shell p-6 md:p-8 bg-white/90 shadow-lg border border-[var(--border-soft)] max-w-2xl mx-auto flex flex-col gap-8 text-[var(--foreground)]">
      <div>
        <h2 className="font-serif text-3xl mb-2 text-[var(--accent-purple)]">Reserve Your Experience</h2>
        <p className="font-sans text-sm text-[var(--text-muted)]">
          {isBookingOnly 
            ? 'Submit an enquiry details. No initial payment is required.'
            : 'Select options, schedule a date, and pay securely via Paystack.'
          }
        </p>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 font-mono text-xs">
          {submitError}
        </div>
      )}

      {/* 1. Selection Options */}
      {activity.variants.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium">
            Choose Package / Variant
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activity.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSelectedVariant(v);
                  clearError('variant');
                }}
                className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer
                  ${selectedVariant?.id === v.id 
                    ? 'border-[var(--accent-purple)] bg-[var(--surface-soft)]/40 shadow-sm' 
                    : 'border-[var(--border-soft)] hover:border-[var(--accent-purple)] bg-white'
                  }
                `}
              >
                <span className="font-serif text-lg text-[var(--foreground)]">{v.name}</span>
                {v.description && <span className="font-sans text-xs text-[var(--text-muted)]">{v.description}</span>}
                <span className="font-mono text-sm text-[var(--accent-orange)] font-semibold mt-1">
                  ₦{v.price.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Sizing / Guest Count & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Guest Counter */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium flex items-center gap-1.5">
            <Users size={14} className="text-[var(--accent-purple)]" />
            Number of Guests
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={guests <= 1}
              onClick={() => {
                setGuests(g => Math.max(1, g - 1));
                clearError('numberOfGuests');
              }}
              className="w-10 h-10 rounded-full border border-[var(--border-soft)] bg-white flex items-center justify-center font-bold text-lg hover:border-[var(--accent-purple)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              -
            </button>
            <span className="font-mono text-lg font-semibold w-8 text-center">{guests}</span>
            <button
              type="button"
              onClick={() => {
                setGuests(g => g + 1);
                clearError('numberOfGuests');
              }}
              className="w-10 h-10 rounded-full border border-[var(--border-soft)] bg-white flex items-center justify-center font-bold text-lg hover:border-[var(--accent-purple)] cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Hourly Duration Selector (Karaoke, etc.) */}
        {(activity.pricingModel === 'TIERED' || activity.pricingModel === 'PER_HOUR') && (
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium flex items-center gap-1.5">
              <Clock size={14} className="text-[var(--accent-purple)]" />
              Duration (Hours)
            </label>
            <select
              value={durationHours}
              onChange={(e) => setDurationHours(parseInt(e.target.value, 10))}
              className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 font-mono text-sm focus:outline-none focus:border-[var(--accent-purple)] transition-colors cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map((h) => (
                <option key={h} value={h}>
                  {h} {h === 1 ? 'Hour' : 'Hours'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Date Selection */}
      <div className="flex flex-col gap-3">
        <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium flex items-center gap-1.5" id="err-date">
          <Calendar size={14} className="text-[var(--accent-purple)]" />
          Choose Date
        </label>
        <DatePicker
          selectedDate={date}
          onChange={(val) => {
            setDate(val);
            clearError('date');
          }}
        />
        {getFieldError('date') && (
          <span className="text-red-500 text-xs font-mono">{getFieldError('date')}</span>
        )}
      </div>

      {/* 4. Time Slot Selection */}
      {date && (
        <div className="flex flex-col gap-3">
          <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] font-medium flex items-center gap-1.5" id="err-startTime">
            <Clock size={14} className="text-[var(--accent-purple)]" />
            Available Time Slots
          </label>
          <TimeSlotPicker
            slots={defaultSlots}
            selectedSlot={startTime}
            onChange={(val) => {
              setStartTime(val);
              clearError('startTime');
            }}
          />
          {getFieldError('startTime') && (
            <span className="text-red-500 text-xs font-mono">{getFieldError('startTime')}</span>
          )}
        </div>
      )}

      {/* 5. Customer Details */}
      <div className="border-t border-[var(--border-soft)] pt-8 flex flex-col gap-5">
        <h3 className="font-serif text-xl text-[var(--accent-purple)]">Contact Details</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]" id="err-firstName">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                clearError('firstName');
              }}
              placeholder="Chidi"
              className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm"
            />
            {getFieldError('firstName') && (
              <span className="text-red-500 text-xs font-mono">{getFieldError('firstName')}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]" id="err-lastName">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                clearError('lastName');
              }}
              placeholder="Okonkwo"
              className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm"
            />
            {getFieldError('lastName') && (
              <span className="text-red-500 text-xs font-mono">{getFieldError('lastName')}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]" id="err-email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError('email');
              }}
              placeholder="chidi@example.com"
              className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm"
            />
            {getFieldError('email') && (
              <span className="text-red-500 text-xs font-mono">{getFieldError('email')}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]" id="err-phone">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                clearError('phone');
              }}
              placeholder="08167009545"
              className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm"
            />
            {getFieldError('phone') && (
              <span className="text-red-500 text-xs font-mono">{getFieldError('phone')}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Special Requests (Optional)</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Let us know if you have birthday celebrations, allergies, accessibility needs, etc."
            rows={3}
            className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm resize-none"
          />
        </div>
      </div>

      {/* 6. Pricing Summary */}
      {!isBookingOnly && (
        <div className="border-t border-[var(--border-soft)] pt-8 flex flex-col gap-4">
          <h3 className="font-serif text-xl text-[var(--accent-purple)] flex items-center gap-1.5">
            <ClipboardList size={18} />
            Summary
          </h3>
          
          <div className="bg-[var(--surface-soft)]/45 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-sans text-[var(--text-muted)]">Activity</span>
              <span className="font-serif text-[var(--foreground)] font-medium">{activity.name}</span>
            </div>
            {selectedVariant && (
              <div className="flex justify-between items-center text-sm">
                <span className="font-sans text-[var(--text-muted)]">Option</span>
                <span className="font-sans text-[var(--foreground)]">{selectedVariant.name}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="font-sans text-[var(--text-muted)]">Schedule</span>
              <span className="font-mono text-xs text-[var(--foreground)]">
                {date ? `${date} @ ${startTime || '--:--'}` : 'Select date below'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-sans text-[var(--text-muted)]">Rate Calculation</span>
              <span className="font-mono text-xs text-[var(--text-muted)]">{priceResult.breakdown}</span>
            </div>
            
            <div className="border-t border-[var(--border-soft)] pt-3 flex justify-between items-center mt-2">
              <span className="font-serif text-base text-[var(--foreground)] font-bold">Total Amount</span>
              <span className="font-mono text-xl text-[var(--accent-orange)] font-bold">
                ₦{priceResult.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Action Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 rounded-full font-mono text-sm uppercase tracking-widest font-bold text-center transition-all flex items-center justify-center gap-2 cursor-pointer
          ${loading 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white shadow-md'
          }
        `}
      >
        <CreditCard size={16} />
        {loading 
          ? 'Initializing Secure Checkout...' 
          : isBookingOnly 
            ? 'Send Enquiry' 
            : `Pay ₦${priceResult.total.toLocaleString()}`
        }
      </button>
    </form>
  );
}
