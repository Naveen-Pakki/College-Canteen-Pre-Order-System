import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const TimeContext = createContext();

// Helper to convert "hh:mm AM/PM" or "HH:mm" to minutes since midnight
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const str = timeStr.trim().toUpperCase();
  const match = str.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period) {
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

// Format minutes from midnight to "hh:mm AM/PM"
export const formatMinutesToTime = (totalMinutes) => {
  let hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minPad = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minPad} ${period}`;
};

export const DEFAULT_SCHEDULE = {
  breakfast: {
    key: 'BREAKFAST',
    label: 'Morning Tiffins',
    start: '06:00 AM',
    end: '09:30 AM',
    pickupStart: '06:30 AM',
    pickupEnd: '10:00 AM',
    warningMinutes: 30,
    closedMessage: 'Breakfast ordering is closed.',
    pickupMessage: 'Breakfast pickup: 6:30 AM – 10:00 AM'
  },
  lunch: {
    key: 'LUNCH',
    label: 'Lunch Pre-Orders',
    start: '09:00 AM',
    end: '12:00 PM',
    warningTime: '11:00 AM',
    warningMinutes: 60,
    pickupStart: '12:00 PM',
    pickupEnd: '02:00 PM',
    closedMessage: 'Lunch pre-ordering is closed.',
    warningNotice: 'Pre-order soon — lunch preparation is based on confirmed orders.',
    pickupMessage: 'Lunch pickup: 12:00 PM – 2:00 PM'
  },
  eveningSnacks: {
    key: 'SNACKS',
    label: 'Evening Snacks',
    start: '01:00 PM',
    end: '03:30 PM',
    pickupStart: '01:30 PM',
    pickupEnd: '04:30 PM',
    warningMinutes: 30,
    closedMessage: 'Evening snack ordering is closed.',
    pickupMessage: 'Snack pickup: 1:30 PM – 4:30 PM'
  },
  cake: {
    key: 'CAKE',
    label: 'Celebration Cakes',
    start: '06:00 AM',
    end: '01:00 PM',
    pickupStart: '03:00 PM',
    pickupEnd: '06:00 PM',
    warningMinutes: 60,
    closedMessage: 'Cake booking is closed for today.',
    pickupMessage: 'Your cake will be available for pickup after 3:00 PM.'
  },
  allDay: {
    key: 'ALL_DAY',
    label: 'All-Day Items',
    alwaysAvailable: true,
    pickupMessage: 'Available for immediate pickup at counter'
  }
};

export const TIME_SIMULATION_PRESETS = [
  { label: 'LIVE System Clock', value: 'LIVE', time: null, desc: 'Real-time live clock' },
  { label: '08:00 AM — Morning Tiffins Active', value: '08:00 AM', time: '08:00 AM', desc: 'Breakfast ordering open' },
  { label: '09:45 AM — Lunch Pre-Orders Open', value: '09:45 AM', time: '09:45 AM', desc: 'Breakfast closed, Lunch pre-orders active' },
  { label: '11:15 AM — Lunch Prep Notice', value: '11:15 AM', time: '11:15 AM', desc: '45 mins left for lunch pre-order' },
  { label: '11:50 AM — Lunch Closing Soon!', value: '11:50 AM', time: '11:50 AM', desc: 'Only 10 mins left before 12:00 PM cutoff' },
  { label: '12:15 PM — Lunch Closed / Pickup Window', value: '12:15 PM', time: '12:15 PM', desc: 'Lunch pre-orders closed, Lunch pickup active' },
  { label: '02:00 PM — Evening Snacks Active', value: '02:00 PM', time: '02:00 PM', desc: 'Snacks open, Cakes booking closed' },
  { label: '03:45 PM — Evening Snacks Closed / All-Day Only', value: '03:45 PM', time: '03:45 PM', desc: 'Snacks closed, Cake pickup active' }
];

export const TimeProvider = ({ children }) => {
  // Live system clock ticking every 1 second
  const [realTime, setRealTime] = useState(new Date());

  // Simulated time override (stored as "HH:MM AM/PM" or null)
  const [simulatedTimeStr, setSimulatedTimeStr] = useState(() => {
    return localStorage.getItem('pu_canteen_simulated_time') || null;
  });

  // Admin configurable schedules
  const [schedules, setSchedules] = useState(() => {
    const saved = localStorage.getItem('pu_canteen_schedules');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE;
  });

  // Track ticking interval
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save schedules to storage
  useEffect(() => {
    localStorage.setItem('pu_canteen_schedules', JSON.stringify(schedules));
  }, [schedules]);

  // Compute effective Date and total minutes from midnight
  const { effectiveDate, totalMinutes, formattedTime, formattedDate, isSimulated } = useMemo(() => {
    let date = new Date(realTime);

    if (simulatedTimeStr && simulatedTimeStr !== 'LIVE') {
      const mins = parseTimeToMinutes(simulatedTimeStr);
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      date.setHours(h, m, 0, 0);
      return {
        effectiveDate: date,
        totalMinutes: mins,
        formattedTime: formatMinutesToTime(mins),
        formattedDate: date.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        isSimulated: true
      };
    }

    const curHours = date.getHours();
    const curMins = date.getMinutes();
    const mins = curHours * 60 + curMins;

    return {
      effectiveDate: date,
      totalMinutes: mins,
      formattedTime: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      formattedDate: date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      isSimulated: false
    };
  }, [realTime, simulatedTimeStr]);

  // Set / Clear simulated time
  const setSimulationPreset = (presetValue) => {
    if (presetValue === 'LIVE' || !presetValue) {
      setSimulatedTimeStr(null);
      localStorage.removeItem('pu_canteen_simulated_time');
    } else {
      setSimulatedTimeStr(presetValue);
      localStorage.setItem('pu_canteen_simulated_time', presetValue);
    }
  };

  const updateSchedule = (newSchedules) => {
    setSchedules(prev => ({ ...prev, ...newSchedules }));
  };

  const resetScheduleToDefault = () => {
    setSchedules(DEFAULT_SCHEDULE);
  };

  // Determine current primary meal phase
  const currentMealPhase = useMemo(() => {
    const bStart = parseTimeToMinutes(schedules.breakfast.start);
    const bEnd = parseTimeToMinutes(schedules.breakfast.end);
    const lStart = parseTimeToMinutes(schedules.lunch.start);
    const lEnd = parseTimeToMinutes(schedules.lunch.end);
    const lPickupEnd = parseTimeToMinutes(schedules.lunch.pickupEnd);
    const sStart = parseTimeToMinutes(schedules.eveningSnacks.start);
    const sEnd = parseTimeToMinutes(schedules.eveningSnacks.end);

    if (totalMinutes >= bStart && totalMinutes < bEnd) {
      return {
        type: 'BREAKFAST',
        title: 'Morning Tiffins Active',
        subtitle: `Orders close at ${schedules.breakfast.end}. Hot idlis, dosas, and filter coffee available.`,
        badge: 'BREAKFAST OPEN',
        color: 'amber'
      };
    }

    if (totalMinutes >= lStart && totalMinutes < lEnd) {
      const minsLeft = lEnd - totalMinutes;
      const isUrgent = minsLeft <= 30;
      return {
        type: 'LUNCH',
        title: 'Lunch Pre-Orders Open',
        subtitle: isUrgent
          ? `⚠️ Only ${minsLeft} mins left! Lunch pre-order closes strictly at ${schedules.lunch.end}.`
          : `Place your lunch order before ${schedules.lunch.end}. Chefs cook fresh based on confirmed pre-orders.`,
        badge: isUrgent ? `CLOSING SOON (${minsLeft}m)` : 'LUNCH PRE-ORDERS OPEN',
        color: isUrgent ? 'rose' : 'blue',
        warning: isUrgent
      };
    }

    if (totalMinutes >= lEnd && totalMinutes < lPickupEnd) {
      return {
        type: 'LUNCH_PICKUP',
        title: 'Lunch Pickup Window Active',
        subtitle: `Lunch pre-orders are closed. Users with digital tickets can collect meals at the canteen until ${schedules.lunch.pickupEnd}.`,
        badge: 'LUNCH PICKUP ONLY',
        color: 'emerald'
      };
    }

    if (totalMinutes >= sStart && totalMinutes < sEnd) {
      const minsLeft = sEnd - totalMinutes;
      return {
        type: 'SNACKS',
        title: 'Evening Snacks Available',
        subtitle: `Hot samosas, puffs, and bajjis. Snack ordering closes at ${schedules.eveningSnacks.end}.`,
        badge: minsLeft <= 30 ? `SNACKS CLOSING (${minsLeft}m)` : 'EVENING SNACKS OPEN',
        color: 'teal'
      };
    }

    return {
      type: 'ALL_DAY',
      title: 'All-Day Items & Counter Pickup',
      subtitle: 'Packaged snacks, biscuits, ice creams, and cool drinks available all day.',
      badge: 'ALL-DAY OPEN',
      color: 'slate'
    };
  }, [totalMinutes, schedules]);

  // Comprehensive evaluator for a food item's time-based status
  const getItemStatus = (item) => {
    const stock = Number(item.stockQuantity ?? 50);

    // 1. Check Sold Out / Inactive
    if (item.isAvailable === false || stock <= 0) {
      return {
        isOpen: false,
        isSoldOut: true,
        status: 'SOLD_OUT',
        badge: 'SOLD OUT',
        badgeClass: 'bg-rose-600 text-white',
        message: 'This item is currently sold out for today.',
        stockRemaining: 0
      };
    }

    // 2. Check All-Day Items (always accessible if stock > 0)
    if (item.isAllDay || item.category === 'All-Day Items' || item.mealType === 'ALL_DAY') {
      return {
        isOpen: true,
        isAllDay: true,
        status: 'AVAILABLE_ALL_DAY',
        badge: 'ALL DAY',
        badgeClass: 'bg-teal-600 text-white',
        message: 'Available throughout the day while stock lasts.',
        stockRemaining: stock
      };
    }

    // 3. Determine schedule window
    let schedule = schedules.lunch;
    if (item.mealType === 'BREAKFAST' || item.category === 'Morning Tiffins') {
      schedule = schedules.breakfast;
    } else if (item.mealType === 'SNACKS' || item.category === 'Evening Snacks') {
      schedule = schedules.eveningSnacks;
    } else if (item.mealType === 'CAKE' || item.category === 'Cakes / Special Orders') {
      schedule = schedules.cake;
    }

    // Override with item-specific start and end if configured by Admin
    const startStr = item.startTime || schedule.start;
    const endStr = item.endTime || schedule.end;
    const startMin = parseTimeToMinutes(startStr);
    const endMin = parseTimeToMinutes(endStr);

    // 4. Too early (Upcoming)
    if (totalMinutes < startMin) {
      return {
        isOpen: false,
        isUpcoming: true,
        status: 'UPCOMING',
        badge: `OPENS AT ${startStr}`,
        badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
        message: `Ordering opens at ${startStr}.`,
        stockRemaining: stock,
        startStr,
        endStr
      };
    }

    // 5. Past cutoff (Closed)
    if (totalMinutes >= endMin) {
      return {
        isOpen: false,
        isClosed: true,
        status: 'CLOSED',
        badge: 'PRE-ORDER CLOSED',
        badgeClass: 'bg-slate-700 text-white',
        message: schedule.closedMessage || 'Ordering is closed for today.',
        pickupMessage: schedule.pickupMessage,
        stockRemaining: stock,
        startStr,
        endStr
      };
    }

    // 6. Closing soon warning (within warningMinutes)
    const minutesLeft = endMin - totalMinutes;
    const warnThreshold = schedule.warningMinutes || 30;

    if (minutesLeft <= warnThreshold) {
      return {
        isOpen: true,
        isClosingSoon: true,
        minutesLeft,
        status: 'CLOSING_SOON',
        badge: `CLOSING SOON (${minutesLeft}m left)`,
        badgeClass: 'bg-rose-500 text-white animate-pulse',
        message: `Only ${minutesLeft} minutes left to place orders!`,
        warningNotice: schedule.warningNotice,
        pickupMessage: schedule.pickupMessage,
        stockRemaining: stock,
        startStr,
        endStr
      };
    }

    // 7. Open & Available
    return {
      isOpen: true,
      status: 'OPEN',
      badge: item.mealType === 'LUNCH' ? 'PRE-ORDER OPEN' : 'AVAILABLE',
      badgeClass: 'bg-emerald-600 text-white',
      message: `Open until ${endStr}.`,
      pickupMessage: schedule.pickupMessage,
      stockRemaining: stock,
      startStr,
      endStr
    };
  };

  return (
    <TimeContext.Provider
      value={{
        realTime,
        effectiveDate,
        totalMinutes,
        formattedTime,
        formattedDate,
        simulatedTimeStr,
        isSimulated,
        schedules,
        currentMealPhase,
        setSimulationPreset,
        updateSchedule,
        resetScheduleToDefault,
        getItemStatus
      }}
    >
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = () => useContext(TimeContext);

export default TimeContext;

