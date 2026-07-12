import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface HoverableTestTitleProps {
  title: string;
  shortId?: number | string;
  questionsCount?: number;
  duration?: number;
  testCode?: string;
  customStyle?: React.CSSProperties;
  correctQuestions?: number;
  isPassing?: boolean;
}

export default function HoverableTestTitle({ title, shortId, questionsCount, duration, testCode, customStyle, correctQuestions, isPassing }: HoverableTestTitleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({ visibility: 'hidden', position: 'fixed' });

  useEffect(() => {
    if (isHovered && wrapperRef.current && cardRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const cardRect = cardRef.current.getBoundingClientRect();
      
      let top = rect.bottom + 8;
      let left = rect.left;
      
      if (top + cardRect.height > window.innerHeight) {
        top = Math.max(16, window.innerHeight - cardRect.height - 16);
      }
      
      if (left + cardRect.width > window.innerWidth) {
        left = window.innerWidth - cardRect.width - 16;
      }
      
      setCardStyle({ position: 'fixed', top, left, visibility: 'visible', zIndex: 999999 });
    } else if (!isHovered) {
      setCardStyle({ visibility: 'hidden', position: 'fixed' });
    }
  }, [isHovered]);

  const truncatedTitle = title.length > 10 ? title.substring(0, 10) + '...' : title;
  const displayTitle = `${truncatedTitle}${shortId ? ` - ${shortId}` : ''}`;

  return (
    <div 
      ref={wrapperRef}
      style={{ display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ cursor: 'pointer', ...customStyle }}>
        {displayTitle}
      </span>

      {isHovered && createPortal(
        <div 
          ref={cardRef}
          style={{ 
            ...cardStyle,
            width: 'max-content',
            minWidth: '280px',
            maxWidth: '400px',
            backgroundColor: '#ffffff',
            padding: '16px', 
            borderRadius: '16px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            pointerEvents: 'none',
            textAlign: 'left'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#3b82f6', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Assessment Details
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>
            {title}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {shortId && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Test ID</span>
                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>{shortId}</span>
              </div>
            )}
            {testCode && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Test Code</span>
                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>{testCode}</span>
              </div>
            )}
            {questionsCount !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Questions</span>
                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>{questionsCount}</span>
              </div>
            )}
            {correctQuestions !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Correct</span>
                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>{correctQuestions}</span>
              </div>
            )}
            {duration !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Duration</span>
                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>{duration} mins</span>
              </div>
            )}
            {isPassing !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Result</span>
                <span style={{ fontSize: '14px', color: isPassing ? '#16a34a' : '#dc2626', fontWeight: '900' }}>{isPassing ? 'PASS' : 'FAIL'}</span>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
