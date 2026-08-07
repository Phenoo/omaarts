'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Fatal global error in root layout:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#fcf9ff',
        color: '#2d1658',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '500px',
          padding: '40px 24px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 18px 60px rgba(74, 37, 152, 0.12)',
          border: '1px solid #d9c9f4',
        }}>
          <h1 style={{
            fontSize: '28px',
            color: '#6f3bd2',
            marginBottom: '16px',
            fontWeight: 700,
          }}>
            Artsy by Oma
          </h1>
          <h2 style={{
            fontSize: '20px',
            marginBottom: '12px',
            fontWeight: 600,
          }}>
            Critical Application Error
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#6c5a90',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}>
            A critical error interrupted the core application root. Please reload or return to safety.
          </p>

          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6f3bd2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '12px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Reload Studio Application
          </button>
        </div>
      </body>
    </html>
  );
}
