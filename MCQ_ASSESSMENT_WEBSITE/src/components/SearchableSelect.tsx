import React, { useState, useRef, useEffect, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SearchableSelectProps {
  value: string | number;
  onChange: (e: any) => void;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  required?: boolean;
}

export default function SearchableSelect({ value, onChange, children, style, className }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const options: { value: string; label: ReactNode; title?: string }[] = [];
  
  const processChild = (child: ReactNode) => {
    if (isValidElement(child) && child.type === 'option') {
      const val = (child.props as any).value;
      let label = (child.props as any).children;
      const title = (child.props as any).title;
      options.push({ value: String(val), label, title });
    } else if (isValidElement(child) && child.type === React.Fragment) {
      React.Children.forEach((child.props as any).children, processChild);
    }
  };

  React.Children.forEach(children, processChild);

  const selectedOption = options.find(o => o.value === String(value));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const filteredOptions = options.filter(o => {
    let text = '';
    if (typeof o.label === 'string' || typeof o.label === 'number') {
      text = String(o.label);
    } else if (Array.isArray(o.label)) {
      text = o.label.join(' ');
    } else {
      text = String(o.label);
    }
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', minWidth: '150px' }}>
      <div 
        className={className}
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          userSelect: 'none',
          ...style
        }}
        title={selectedOption?.title}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <ChevronDown size={16} color="#64748b" style={{ flexShrink: 0, marginLeft: '8px' }} />
      </div>

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, maxHeight: '250px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={14} color="#64748b" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search options..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px', color: '#0f172a' }}
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '8px 12px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>No results found</div>
            ) : (
              filteredOptions.map((opt, i) => (
                <div 
                  key={i}
                  title={opt.title}
                  onClick={() => { onChange({ target: { value: opt.value } }); setIsOpen(false); setSearch(''); }}
                  style={{ padding: '8px 12px', fontSize: '13px', color: '#0f172a', cursor: 'pointer', backgroundColor: String(value) === opt.value ? '#f1f5f9' : 'transparent', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = String(value) === opt.value ? '#f1f5f9' : 'transparent'}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
