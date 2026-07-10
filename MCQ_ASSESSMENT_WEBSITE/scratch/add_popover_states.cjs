const fs = require('fs');
let p = 'src/components/StudentPortal.tsx';
let c = fs.readFileSync(p, 'utf8');

const stateTarget = `  const [showPin, setShowPin] = useState(false); // Default to June 7, 2025`;
const stateReplacement = `  const [showPin, setShowPin] = useState(false); // Default to June 7, 2025

  // Popover States
  const [hoveredDateStr, setHoveredDateStr] = useState<string | null>(null);
  const [hoveredTestId, setHoveredTestId] = useState<string | null>(null);
  const [hoveredAttemptId, setHoveredAttemptId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHoverEnter = (type: 'date' | 'test' | 'attempt', id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (type === 'date') setHoveredDateStr(id);
    if (type === 'test') setHoveredTestId(id);
    if (type === 'attempt') setHoveredAttemptId(id);
  };

  const handleHoverLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredDateStr(null);
      setHoveredTestId(null);
      setHoveredAttemptId(null);
    }, 300);
  };
`;

c = c.replace(stateTarget, stateReplacement);
fs.writeFileSync(p, c);
console.log('States injected');
