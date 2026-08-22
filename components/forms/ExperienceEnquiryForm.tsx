'use client';

import { FormEvent, useState } from 'react';
import { Activity } from '@/lib/types';
import { Users, Mail, Phone, Calendar, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  activity: Activity;
}

export default function ExperienceEnquiryForm({ activity }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [guests, setGuests] = useState('2');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    // ensure guests dropdown value is sent as numberOfGuests
    const body = {
      ...payload,
      numberOfGuests: Number(guests),
      type: 'experience-enquiry',
      preferredActivity: activity.name,
      eventType: `Experience: ${activity.name}`,
    };

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Please try again.');
      setReference(data.reference);
      setStatus('success');
      (event.target as HTMLFormElement).reset();
      setGuests('2');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50 p-6 text-center" role="status">
        <CheckCircle2 className="mx-auto text-green-600" size={32} />
        <h3 className="font-serif text-xl text-green-900">Enquiry sent</h3>
        <p className="font-sans text-sm text-green-700">
          Your reference is <strong className="font-mono">{reference}</strong>. Oma or the studio team will reply within 24 hours.
        </p>
        <button type="button" className="mx-auto mt-2 rounded-full border border-green-300 bg-white px-6 py-2 font-mono text-xs uppercase tracking-widest hover:bg-green-100" onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div>
        <h3 className="font-serif text-2xl text-[var(--accent-purple)]">Send an enquiry</h3>
        <p className="font-sans text-sm text-[var(--text-muted)] mt-1">
          Ask about <strong>{activity.name}</strong> — ideal for questions on pricing, group sizes, or custom requests. No payment now.
        </p>
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        <label className="flex flex-col gap-1.5 font-sans text-sm">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">Your name</span>
          <input name="name" required autoComplete="name" placeholder="Adaeze Okoro" className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm focus:border-[var(--accent-purple)] focus:outline-none" />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-1.5 font-sans text-sm">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1"><Mail size={12} /> Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="ada@example.com" className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm focus:border-[var(--accent-purple)] focus:outline-none" />
          </label>
          <label className="flex flex-col gap-1.5 font-sans text-sm">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1"><Phone size={12} /> Phone / WhatsApp</span>
            <input name="phone" type="tel" autoComplete="tel" placeholder="08167009545" className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm focus:border-[var(--accent-purple)] focus:outline-none" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="flex flex-col gap-1.5 font-sans text-sm">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1"><Users size={12} /> Number of guests</span>
            <select
              name="numberOfGuests"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm focus:border-[var(--accent-purple)] focus:outline-none cursor-pointer"
              required
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
              <option value="31">31+ (specify in message)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 font-sans text-sm">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1"><Calendar size={12} /> Preferred date</span>
            <input name="preferredDate" type="date" className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm focus:border-[var(--accent-purple)] focus:outline-none" />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 font-sans text-sm">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1"><MessageSquare size={12} /> Message</span>
          <textarea name="message" rows={4} required placeholder={`Tell us about your group, timing, or what you’d like to know about ${activity.name}…`} className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-4 py-3 text-sm focus:border-[var(--accent-purple)] focus:outline-none resize-none" />
        </label>

        <div className="sr-only" aria-hidden="true">
          <label>
            Website<input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <button type="submit" disabled={status === 'sending'} className="w-full rounded-full bg-[var(--foreground)] px-6 py-4 font-mono text-xs uppercase tracking-widest text-white hover:bg-[var(--accent-purple)] disabled:opacity-60">
        {status === 'sending' ? 'Sending enquiry…' : 'Send enquiry'}
      </button>
      <p className="text-center font-mono text-[11px] text-[var(--text-muted)]">No payment now — we’ll reply with availability and next steps.</p>
    </form>
  );
}
