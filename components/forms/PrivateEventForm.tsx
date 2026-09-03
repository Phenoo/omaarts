'use client';

import { FormEvent, useState } from 'react';

const eventTypes = ['Birthday', 'Date night / couples', "Bridal group", "Girls' night", 'Team / corporate', 'School / community', 'Private studio hire', 'Others'];

export default function PrivateEventForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, type: 'private-event' }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Please try again.');
      formElement?.reset();
      setReference(data.reference); setStatus('success');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Please try again.'); setStatus('error');
    }
  }

  if (status === 'success') return <div className="success-state" role="status"><p className="eyebrow">Enquiry received</p><h2>We have your plans.</h2><p>Your reference is <strong>{reference}</strong>. Oma or the studio team will follow up with availability and next steps.</p><button type="button" className="button button--outline" onClick={() => setStatus('idle')}>Send another enquiry</button></div>;

  return <form className="form-stack" method="post" onSubmit={submit} noValidate><div className="form-heading"><p className="eyebrow">Start a conversation</p><h2>Tell us what you are planning.</h2><p>Only the details we need to check fit and availability.</p></div>{status === 'error' && <div className="form-alert form-alert--error" role="alert">{error}</div>}<div className="form-grid"><label>Name<input name="name" required autoComplete="name" /></label><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Phone / WhatsApp<input name="phone" type="tel" required autoComplete="tel" /></label><label>Preferred date<input name="preferredDate" type="date" required /></label><label>Approximate group size
                <select name="numberOfGuests" required className="w-full rounded-xl border border-[var(--border-soft)] bg-white px-3 py-2.5 text-sm">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                  <option value="31">31+ guests</option>
                </select>
              </label><label>Event type<select name="eventType" defaultValue="Birthday">{eventTypes.map((item) => <option value={item} key={item}>{item}</option>)}</select></label></div><label>Preferred activity<input name="preferredActivity" placeholder="Paint and sip, tote painting, or open to suggestions" /></label><label>Optional message<textarea name="message" rows={5} placeholder="Tell us about timing, food, accessibility, or anything else useful." /></label><div className="sr-only" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div><button className="button button--primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Saving enquiry…' : 'Send event enquiry'}</button><p className="form-note">Prefer WhatsApp? <a href="https://wa.me/2348167009545" target="_blank" rel="noreferrer">Message the studio</a>.</p></form>;
}
