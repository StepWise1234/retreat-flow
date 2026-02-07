import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InlineFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  type?: string;
  width?: string;
}

export default function InlineField({
  value,
  onChange,
  placeholder,
  className,
  type = 'text',
  width,
}: InlineFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);

  // Auto-size input width based on content
  useEffect(() => {
    if (sizerRef.current && inputRef.current && !width) {
      const textWidth = sizerRef.current.offsetWidth;
      inputRef.current.style.width = `${Math.max(textWidth + 8, 60)}px`;
    }
  }, [value, placeholder, width]);

  return (
    <span className="relative inline-block align-baseline">
      {/* Hidden sizer element */}
      <span
        ref={sizerRef}
        className="invisible absolute whitespace-pre text-inherit font-inherit"
        aria-hidden
      >
        {value || placeholder}
      </span>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={width ? { width } : undefined}
        className={cn(
          'inline-block bg-transparent border-0 border-b-2 border-white/20',
          'focus:border-[hsl(160_30%_65%)] outline-none',
          'text-white font-normal placeholder:text-white/25',
          'transition-colors duration-300 px-1 py-0.5',
          'text-inherit leading-inherit',
          className,
        )}
      />
    </span>
  );
}
