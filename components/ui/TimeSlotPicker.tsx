'use client';

import React from 'react';

interface TimeSlotPickerProps {
  slots: string[]; // e.g. ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
  selectedSlot: string;
  onChange: (slot: string) => void;
  bookedSlots?: string[]; // Slots that are fully booked for the selected date
}

export default function TimeSlotPicker({
  slots,
  selectedSlot,
  onChange,
  bookedSlots = [],
}: TimeSlotPickerProps) {
  
  const formatTime = (time24: string) => {
    try {
      const [hourStr, minStr] = time24.split(':');
      const hour = parseInt(hourStr, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHour}:${minStr} ${ampm}`;
    } catch {
      return time24;
    }
  };

  if (slots.length === 0) {
    return (
      <div className="text-center py-6 border border-dashed border-[var(--border-soft)] rounded-xl bg-[var(--surface-soft)]/20">
        <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
          No available time slots for this date
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
      {slots.map((slot) => {
        const isBooked = bookedSlots.includes(slot);
        const isSelected = selectedSlot === slot;

        return (
          <button
            key={slot}
            type="button"
            disabled={isBooked}
            onClick={() => onChange(slot)}
            className={`py-3 px-4 rounded-xl font-mono text-xs uppercase tracking-widest text-center border transition-all cursor-pointer
              ${isSelected 
                ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)] font-bold shadow-sm' 
                : 'bg-white text-[var(--foreground)] border-[var(--border-soft)] hover:border-[var(--accent-purple)] hover:text-[var(--accent-purple)]'
              }
              ${isBooked 
                ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed line-through opacity-50' 
                : ''
              }
            `}
          >
            {formatTime(slot)}
          </button>
        );
      })}
    </div>
  );
}
