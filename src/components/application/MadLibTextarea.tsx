import { cn } from '@/lib/utils';

interface MadLibTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  rows?: number;
}

export default function MadLibTextarea({
  value,
  onChange,
  placeholder,
  className,
  rows = 3,
}: MadLibTextareaProps) {
  return (
    <div className={cn('madlib-field group/ml relative', className)}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 resize-none py-1 text-inherit leading-relaxed"
      />
      {/* Rainbow underline */}
      <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-[hsl(160_40%_55%)] via-[hsl(200_60%_60%)] to-[hsl(280_50%_65%)] opacity-30 group-hover/ml:opacity-80 group-focus-within/ml:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
