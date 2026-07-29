'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createEnquiry } from '@/lib/firebase/services/enquiries';
import { Sparkles, Calendar, CalendarRange, Clock, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/Footer';

export default function EventsPage() {
  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('Corporate Team Bonding');
  const [guests, setGuests] = useState(10);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [message, setMessage] = useState('');
  
  // Selected activities checkboxes
  const [activities, setActivities] = useState<string[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Damage Policy default text (CMS editable in settings)
  const damagePolicyText = "Guests are responsible for damage caused during their stay. Studio equipment and facilities should be treated with care and left in appropriate condition after use.";

  const toggleActivity = (act: string) => {
    setActivities((prev) => 
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!name.trim() || !email.trim() || !phone.trim() || !preferredDate) {
      setErrorMsg('Please fill in all required fields (Name, Email, Phone, Preferred Date).');
      return;
    }

    setLoading(true);

    try {
      await createEnquiry({
        type: eventType === 'Space/Venue Rental' ? 'space' : 'corporate',
        name,
        company: company.trim() || undefined,
        email,
        phone,
        eventType,
        numberOfGuests: guests,
        preferredDate,
        preferredTime,
        activityInterests: activities,
        message,
      });
      setSuccess(true);
      // Reset form
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setMessage('');
      setActivities([]);
    } catch (err: any) {
      console.error('Failed to submit event enquiry:', err);
      setErrorMsg('Failed to submit enquiry. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  const activityOptions = [
    'Paint & Sip Hangout',
    'Tote Bag Painting',
    'Scented Candle Making',
    'Clay Pot / Vase Painting',
    'Karaoke Session',
    'Trivia / Board Games'
  ];

  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div className="max-w-[90vw] mx-auto pb-24 w-full flex-grow">
        
        {/* HERO */}
        <div className="mb-20 border-b border-[var(--border-soft)] pb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)] mb-3">Group Experiences</p>
          <h1 className="font-serif text-6xl md:text-8xl text-[var(--accent-purple)] tracking-tight leading-[0.9] mb-8">
            Private Events &<br/>Space Bookings
          </h1>
          <p className="font-sans text-xl opacity-75 max-w-3xl leading-relaxed">
            Host your next team bonding, birthday celebration, bridal shower, or custom creative party at ABO Gallery. Enjoy a tailored paint experience led by Oma in our Awka studio.
          </p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-start">
          
          {/* Left info column */}
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="font-serif text-3xl mb-4 text-[var(--accent-purple)]">Plan Your Celebration</h2>
              <p className="font-sans text-base text-[var(--text-muted)] leading-relaxed mb-4">
                We design custom experiences tailored specifically to your group size, budget, and vision. Bring your own food and cakes, and we will handle all the setup, clean up, canvas supplies, and guidelines.
              </p>
              <ul className="font-mono text-xs uppercase tracking-widest text-[var(--accent-orange)]/90 space-y-2 mt-4">
                <li>• Corporate Team Bonding & Team Building</li>
                <li>• Birthday Parties & Celebrations</li>
                <li>• Bridal Showers & Girls Nights</li>
                <li>• Date Nights & Private Couples Sessions</li>
                <li>• Space Rentals for Photography / Art Shows</li>
              </ul>
            </div>

            {/* Space rentals info & damage policy */}
            <div className="p-6 md:p-8 rounded-2xl border border-[var(--border-soft)] bg-white/70 flex flex-col gap-5">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--accent-orange)] bg-[var(--surface-soft)] px-2.5 py-1 rounded-full w-fit">
                  Studio Space Rental
                </span>
                <h3 className="font-serif text-2xl text-[var(--foreground)] mt-3 mb-2">Book Our Space</h3>
                <p className="font-sans text-sm text-[var(--text-muted)] leading-relaxed">
                  ABO Gallery is open for space bookings, corporate launches, panel events, or intimate exhibitions. Contact us below to get a custom rental rate.
                </p>
              </div>

              {/* Damage policy block */}
              <div className="border-t border-[var(--border-soft)] pt-4 flex gap-3 text-xs text-[var(--text-muted)] font-sans leading-relaxed">
                <ShieldAlert className="text-[var(--accent-orange)] flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="text-[var(--foreground)] block mb-0.5">Studio Damage Policy</strong>
                  {damagePolicyText}
                </div>
              </div>
            </div>

            {/* Gallery Image snippet */}
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-[var(--border-soft)] shadow-sm bg-[var(--surface-soft)]">
              <Image
                src="/images/events/IMG_6954.JPG"
                alt="Paint Party Setup"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right column: Enquiry Form */}
          <div className="section-shell p-6 md:p-8 bg-white shadow-md border border-[var(--border-soft)] sticky top-24">
            
            {success ? (
              /* Success Screen */
              <div className="py-12 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-serif text-3xl text-[var(--foreground)]">Enquiry Sent!</h3>
                <p className="font-sans text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
                  Thank you for planning with us. Oma or our team representative will contact you via email/phone within 24 hours to confirm rates and availability.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 bg-[var(--accent-purple)] text-white rounded-full font-mono text-xs uppercase tracking-widest hover:bg-[var(--accent-orange)] transition-colors cursor-pointer"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              /* Actual Form */
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-[var(--foreground)]">
                <div>
                  <h3 className="font-serif text-3xl mb-1 text-[var(--accent-purple)]">Enquire Now</h3>
                  <p className="font-sans text-xs text-[var(--text-muted)]">Tell us about your planned gathering.</p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 font-mono text-[10px]">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Company Name (Optional)</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Corp"
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08167009545"
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] cursor-pointer"
                    >
                      <option>Corporate Team Bonding</option>
                      <option>Birthday Party</option>
                      <option>Private Paint Session</option>
                      <option>Date Night / Anniversary</option>
                      <option>Bridal Group Shower</option>
                      <option>Space/Venue Rental</option>
                      <option>Other Event</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Number of Guests</label>
                    <input
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] font-sans"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Preferred Time</label>
                    <input
                      type="time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-[var(--accent-purple)] font-sans"
                    />
                  </div>
                </div>

                {/* Checklist of activities */}
                {eventType !== 'Space/Venue Rental' && (
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Interested Activities</label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                      {activityOptions.map((act) => (
                        <label key={act} className="flex items-center gap-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={activities.includes(act)}
                            onChange={() => toggleActivity(act)}
                            className="rounded border-[var(--border-soft)] text-[var(--accent-purple)] focus:ring-[var(--accent-purple)] w-3.5 h-3.5"
                          />
                          <span>{act}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Message / Details</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about special catering, theme ideas, custom paint prompts, or general details..."
                    rows={3}
                    className="w-full bg-white border border-[var(--border-soft)] rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--accent-purple)] transition-colors font-sans text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-full font-mono text-xs uppercase tracking-widest font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm
                    ${loading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[var(--accent-purple)] hover:bg-[var(--accent-orange)] text-white'
                    }
                  `}
                >
                  {loading ? 'Submitting Enquiry...' : 'Submit Event Request'}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
      <Footer />
    </main>
  );
}
export const dynamic = 'force-dynamic';
