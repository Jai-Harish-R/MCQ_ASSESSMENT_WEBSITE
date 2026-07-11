import React, { useState, useRef, useEffect } from 'react';

interface HoverableTestTitleProps {
  title: string;
  shortId?: number | string;
  questionsCount?: number;
  duration?: number;
  testCode?: string;
  customStyle?: React.CSSProperties;
}

export default function HoverableTestTitle({ title, shortId, questionsCount, duration, testCode, customStyle }: HoverableTestTitleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({ left: '0' });

  useEffect(() => {
    if (isHovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const overflowRight = rect.right - window.innerWidth;
      if (overflowRight > 0) {
        setCardStyle({ right: '0', left: 'auto' });
      }
    } else if (!isHovered) {
      setCardStyle({ left: '0' });
    }
  }, [isHovered]);

  const truncatedTitle = title.length > 14 ? title.substring(0, 14) + '...' : title;
  const displayTitle = `${truncatedTitle}${shortId ? ` - ${shortId}` : ''}`;

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ cursor: 'pointer', ...customStyle }}>
        {displayTitle}
      </span>

      {isHovered && (
        <div 
          ref={cardRef}
          style={{ 
            position: 'absolute', 
            top: '100%', 
            ...cardStyle,
            marginTop: '8px',
            zIndex: 9999, 
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
            {duration !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Duration</span>
                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>{duration} mins</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
