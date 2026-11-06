import React, { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('pu_canteen_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'light'; // Default for first-time visitors
    } catch (e) {
      return 'light';
    }
  });

  // Apply theme attributes to document.documentElement
  const applyThemeToDOM = (newTheme) => {
    try {
      const root = document.documentElement;
      root.setAttribute('data-theme', newTheme);
      if (newTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      localStorage.setItem('pu_canteen_theme', newTheme);
    } catch (e) {
      console.error("Failed to apply theme to DOM:", e);
    }
  };

  // Ensure DOM is synchronized with state on initial mount
  useEffect(() => {
    applyThemeToDOM(theme);
  }, []);

  /**
   * Circular Water-Ripple Theme Toggle
   * Captures the exact coordinates (x, y) of the clicked theme toggle button.
   * Spreads outward in all directions like an expanding water ripple across the viewport.
   * Smooth fluid easing (800ms) with full bi-directional support and instant graceful fallback.
   */
  const toggleTheme = (event) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Respect user's reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Direct synchronous update if View Transitions API is unavailable or motion reduced
    if (!document.startViewTransition || prefersReducedMotion) {
      setTheme(nextTheme);
      applyThemeToDOM(nextTheme);
      return;
    }

    // Determine water-ripple origin coordinates from clicked button
    let x = window.innerWidth - 48; // Default near top-right header actions
    let y = 32;

    if (event) {
      const target = event.currentTarget || event.target;
      const button = target && typeof target.closest === 'function' ? target.closest('button') : target;
      if (button && typeof button.getBoundingClientRect === 'function') {
        const rect = button.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else if (typeof event.clientX === 'number' && event.clientX > 0) {
        x = event.clientX;
        y = event.clientY;
      }
    }

    // Calculate maximum distance to the furthest screen corner
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const root = document.documentElement;
    // Set dynamic ripple origin CSS custom properties
    root.style.setProperty('--ripple-x', `${x}px`);
    root.style.setProperty('--ripple-y', `${y}px`);
    root.style.setProperty('--ripple-radius', `${endRadius}px`);

    try {
      // Execute View Transition with synchronous flush to snapshot new theme
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          setTheme(nextTheme);
          applyThemeToDOM(nextTheme);
        });
      });

      if (transition && transition.ready) {
        transition.ready.then(() => {
          try {
            root.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${endRadius}px at ${x}px ${y}px)`
                ]
              },
              {
                duration: 800, // 700–900ms range
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth water-ripple expansion
                pseudoElement: '::view-transition-new(root)'
              }
            );
          } catch (e) {
            // CSS @keyframes water-ripple-expand fallback executes automatically
          }
        }).catch(() => {});
      }
    } catch (err) {
      // Bulletproof fallback
      setTheme(nextTheme);
      applyThemeToDOM(nextTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
