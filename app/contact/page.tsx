'use client';

import React, { useState } from 'react';
import { createEnquiry } from '@/lib/firebase/services/enquiries';
import { Phone, MessageSquare, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in Name, Email, and Message.');
      return;
    }

    setLoading(true);

    try {
      await createEnquiry({
        type: 'contact' as any, // unified database mapping
        name,
        email,
        phone: phone.trim() || '',
        eventType: subject, // mapped for database consistency
        numberOfGuests: 0,
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: '',
        message,
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setErrorMsg('Could not submit message. Please try again or WhatsApp us.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 pb-24 w-full flex-grow">
        
        {/* Left: Info */}
        <div className="flex flex-col justify-between h-full">
          <div>
            <h1 className="font-serif text-8xl md:text-9xl mb-12 text-[var(--accent-purple)] tracking-tighter leading-[0.8]">
              LET&apos;S<br/>TALK
            </h1>
            <p className="font-sans text-xl opacity-80 max-w-md leading-relaxed">
              Have questions about booking? Interested in commissions or collaborations? Reach out to Oma.
            </p>
          </div>
          
          <div className="mt-16 md:mt-0 space-y-8 font-mono text-sm tracking-widest uppercase text-[var(--foreground)]">
            <div>
              <span className="block opacity-50 mb-2 text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--accent-orange)]" />
                ABO Gallery Studio
              </span>
              <p className="font-serif text-lg leading-relaxed normal-case">
                ABO Gallery,<br/>
                No. 40 Majuo Street,<br/>
                Umudioka, Awka,<br/>
                Nigeria.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 font-mono text-xs">
              <a
                href="tel:+2348167009545"
                className="px-6 py-3 rounded-full border border-[var(--border-soft)] hover:bg-[var(--accent-purple)] hover:text-white transition-all flex items-center gap-2 cursor-pointer w-fit"
              >
                <Phone size={14} />
                Call: 08167009545
              </a>
              <a
                href="https://wa.me/2348167009545"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full border border-green-300 text-green-700 bg-green-50/50 hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 cursor-pointer w-fit"
              >
                <MessageSquare size={14} />
                WhatsApp Chat
              </a>
            </div>

            <div>
              <span className="block opacity-50 mb-2 text-xs text-[var(--text-muted)]">Email</span>
              <a href="mailto:support@artsybyoma.com" className="hover:text-[var(--accent-orange)] transition-colors lowercase">
                support@artsybyoma.com
              </a>
            </div>
          </div>
        </div>

        {/* Right: Form Container */}
        <div className="flex flex-col justify-center">
          {success ? (
            /* Success Block */
            <div className="section-shell p-10 text-center flex flex-col items-center gap-5 bg-white max-w-md w-full">
              <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="font-serif text-2xl">Message Received!</h3>
              <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed">
                Thank you for contacting Paint & Sip with Oma. We have saved your inquiry and will follow up shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            /* Contact Form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:pt-12">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 font-mono text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="group">
                <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2 group-focus-within:text-[var(--accent-purple)] transition-colors">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border-b border-[#333] py-4 text-xl focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div className="group">
                <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2 group-focus-within:text-[var(--accent-purple)] transition-colors">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#333] py-4 text-xl focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
                  placeholder="email@address.com"
                />
              </div>

              <div className="group">
                <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2 group-focus-within:text-[var(--accent-purple)] transition-colors">Phone (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent border-b border-[#333] py-4 text-xl focus:outline-none focus:border-[var(--accent-purple)] transition-colors"
                  placeholder="08167009545"
                />
              </div>

              <div className="group font-mono text-xs flex flex-col gap-2">
                <label className="block opacity-50 uppercase tracking-widest">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-transparent border-b border-[#333] py-3 text-lg focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer text-[var(--foreground)]"
                >
                  <option>General Inquiry</option>
                  <option>Artwork Purchase</option>
                  <option>Private Commissions</option>
                  <option>Murals & Brand Collab</option>
                  <option>Feedback / Hello</option>
                </select>
              </div>

              <div className="group">
                <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2 group-focus-within:text-[var(--accent-purple)] transition-colors">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-transparent border-b border-[#333] py-4 text-xl focus:outline-none focus:border-[var(--accent-purple)] transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`self-start mt-8 px-12 py-4 rounded-full font-mono text-sm uppercase tracking-widest transition-all cursor-pointer shadow-sm
                  ${loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white'
                  }
                `}
              >
                {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
