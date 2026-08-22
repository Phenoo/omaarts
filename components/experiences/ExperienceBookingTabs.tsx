'use client';

import { useState } from 'react';
import { Activity } from '@/lib/types';
import BookingForm from '@/components/ui/BookingForm';
import ExperienceEnquiryForm from '@/components/forms/ExperienceEnquiryForm';

interface Props {
  activity: Activity;
}

export default function ExperienceBookingTabs({ activity }: Props) {
  const isEnquiryOnly = activity.pricingModel === 'BOOKING_ONLY' || activity.pricingModel === 'CUSTOM_QUOTE';
  const [tab, setTab] = useState<'book' | 'enquire'>(isEnquiryOnly ? 'enquire' : 'book');

  return (
    <div className="flex flex-col gap-6">
      {/* Tab switcher — prevents booking + enquiry confusion */}
      <div role="tablist" aria-label="Booking or enquiry" className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface-soft)]/50 p-1 w-fit">
        <button
          role="tab"
          aria-selected={tab === 'book'}
          aria-controls="panel-book"
          id="tab-book"
          onClick={() => setTab('book')}
          className={`rounded-full px-5 py-2 font-mono text-xs uppercase tracking-widest font-bold transition-colors ${tab === 'book' ? 'bg-[var(--accent-purple)] text-white shadow' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
        >
          Book experience
        </button>
        <button
          role="tab"
          aria-selected={tab === 'enquire'}
          aria-controls="panel-enquire"
          id="tab-enquire"
          onClick={() => setTab('enquire')}
          className={`rounded-full px-5 py-2 font-mono text-xs uppercase tracking-widest font-bold transition-colors ${tab === 'enquire' ? 'bg-[var(--accent-purple)] text-white shadow' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
        >
          Send enquiry
        </button>
      </div>

      <p className="font-sans text-xs text-[var(--text-muted)] -mt-3">
        {tab === 'book' ? 'Secure your date with online payment via Paystack.' : 'Ask a question — we reply with availability, pricing and next steps.'}
      </p>

      <div id="panel-book" role="tabpanel" aria-labelledby="tab-book" hidden={tab !== 'book'} className={tab !== 'book' ? 'hidden' : ''}>
        <BookingForm activity={activity} />
      </div>

      <div id="panel-enquire" role="tabpanel" aria-labelledby="tab-enquire" hidden={tab !== 'enquire'} className={tab !== 'enquire' ? 'hidden' : ''}>
        <ExperienceEnquiryForm activity={activity} />
      </div>
    </div>
  );
}
