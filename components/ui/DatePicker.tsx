'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  blockedDates?: string[]; // Array of YYYY-MM-DD
  closedDays?: number[]; // Days of week (0 = Sunday, 1 = Monday, etc.)
  minDaysAhead?: number;
  maxDaysAhead?: number;
}

export default function DatePicker({
  selectedDate,
  onChange,
  blockedDates = [],
  closedDays = [], // e.g. [1] for Mondays closed
  minDaysAhead = 0,
  maxDaysAhead = 90,
}: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isDateDisabled = (dateStr: string, dateObj: Date) => {
    // 1. Is in the past?
    if (dateObj < today) return true;

    // 2. Is too far in future?
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + maxDaysAhead);
    if (dateObj > maxDate) return true;

    // 3. Is it too soon?
    const minDate = new Date();
    minDate.setDate(today.getDate() + minDaysAhead);
    if (dateObj < minDate) return true;

    // 4. Is it a closed weekday?
    const dayOfWeek = dateObj.getDay();
    if (closedDays.includes(dayOfWeek)) return true;

    // 5. Is it a manually blocked date?
    if (blockedDates.includes(dateStr)) return true;

    return false;
  };

  const renderDays = () => {
    const days = [];
    
    // Empty cells for first week offset
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Days cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isDisabled = isDateDisabled(dateStr, dateObj);
      const isSelected = selectedDate === dateStr;
      const isToday = today.toDateString() === dateObj.toDateString();

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isDisabled}
          aria-label={`${monthNames[month]} ${day}, ${year}${isDisabled ? ' unavailable' : ''}`}
          onClick={() => onChange(dateStr)}
          className={`h-10 w-10 rounded-full flex items-center justify-center font-mono text-sm transition-all relative cursor-pointer
            ${isSelected ? 'bg-[var(--accent-purple)] text-white font-bold scale-110 shadow-md z-10' : ''}
            ${!isSelected && !isDisabled ? 'hover:bg-[var(--surface-soft)] text-[var(--foreground)] hover:text-[var(--accent-purple)]' : ''}
            ${isDisabled ? 'text-gray-300 line-through cursor-not-allowed opacity-40' : ''}
          `}
        >
          {day}
          {isToday && !isSelected && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent-orange)]" />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="border border-[var(--border-soft)] rounded-2xl p-5 bg-white shadow-sm max-w-xl w-full mx-auto" role="group" aria-label="Choose booking date">
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-5 border-b border-[var(--border-soft)] pb-3">
        <h3 className="font-serif text-lg text-[var(--foreground)]" aria-live="polite">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-2 rounded-full border border-[var(--border-soft)] hover:bg-[var(--surface-soft)] hover:text-[var(--accent-purple)] transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-2 rounded-full border border-[var(--border-soft)] hover:bg-[var(--surface-soft)] hover:text-[var(--accent-purple)] transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-y-2 justify-items-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-2 justify-items-center">
        {renderDays()}
      </div>
      
      <div className="mt-4 pt-3 border-t border-[var(--border-soft)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-purple)]" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-orange)]" />
          Today
        </span>
        <span className="flex items-center gap-1.5 opacity-55">
          <span className="w-2.5 h-0.5 bg-gray-400 rotate-45 inline-block" />
          Unavailable
        </span>
      </div>
    </div>
  );
}
