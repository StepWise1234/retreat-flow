import { cn } from '@/lib/utils';

interface PromptTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
  className?: string;
}

export default function PromptTextarea({
  value,
  onChange,
  placeholder = 'Type here…',
  hint,
  rows = 4,
  className,
}: PromptTextareaProps) {
  return (
    <div className={cn('mt-4', className)}>
      {hint && (
        <p className="text-xs text-white/30 mb-2 italic">{hint}</p>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'w-full bg-white/[0.04] border border-white/10 rounded-xl',
          'px-5 py-4 text-base text-white/90 placeholder:text-white/20',
          'focus:outline-none focus:border-[hsl(160_30%_65%/0.4)] focus:bg-white/[0.06]',
          'transition-all duration-300 resize-none',
          'leading-relaxed',
        )}
      />
    </div>
  );
}
