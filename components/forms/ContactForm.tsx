'use client';

import { FormEvent, useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus('sending'); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(form.entries()), type: 'contact' }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Please try again.');
      setReference(data.reference); setStatus('success'); event.currentTarget.reset();
    } catch (submissionError) { setError(submissionError instanceof Error ? submissionError.message : 'Please try again.'); setStatus('error'); }
  }

  if (status === 'success') return <div className="success-state" role="status"><p className="eyebrow">Message received</p><h2>Thank you for reaching out.</h2><p>Your reference is <strong>{reference}</strong>. We will reply from {`support@artsybyoma.com`}.</p><button type="button" className="button button--outline" onClick={() => setStatus('idle')}>Send another message</button></div>;

  return <form className="form-stack" onSubmit={submit} noValidate><div className="form-heading"><p className="eyebrow">Contact the studio</p><h2>Let&apos;s talk about the work.</h2></div>{status === 'error' && <div className="form-alert form-alert--error" role="alert">{error}</div>}<label>Name<input name="name" required autoComplete="name" /></label><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Phone / WhatsApp<input name="phone" type="tel" autoComplete="tel" /></label><label>Subject<select name="eventType" defaultValue="General enquiry"><option>General enquiry</option><option>Artwork enquiry</option><option>Commission enquiry</option><option>Private event</option><option>Experience question</option></select></label><label>Message<textarea name="message" required rows={6} /></label><div className="sr-only" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div><button className="button button--primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send message'}</button></form>;
}
