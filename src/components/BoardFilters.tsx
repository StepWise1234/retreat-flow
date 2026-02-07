import { useState } from 'react';
import { Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

export type BoardFilter = 'needs-action' | 'allergies' | 'payment-pending' | 'interview-week' | 'high-risk' | 'overdue-tasks' | 'has-flags';
export type BoardSort = 'stage' | 'lastTouched' | 'name';

interface Props {
  activeFilters: BoardFilter[];
  onFiltersChange: (filters: BoardFilter[]) => void;
  sort: BoardSort;
  onSortChange: (sort: BoardSort) => void;
}

const FILTER_OPTIONS: { value: BoardFilter; label: string }[] = [
  { value: 'needs-action', label: 'Needs action (7+ days)' },
  { value: 'allergies', label: 'Allergies / Special requests' },
  { value: 'payment-pending', label: 'Payment pending' },
  { value: 'interview-week', label: 'Interview this week' },
  { value: 'high-risk', label: 'High risk' },
  { value: 'overdue-tasks', label: 'Overdue tasks' },
  { value: 'has-flags', label: 'Has care flags' },
];

const SORT_OPTIONS: { value: BoardSort; label: string }[] = [
  { value: 'stage', label: 'Pipeline stage' },
  { value: 'lastTouched', label: 'Last touched' },
  { value: 'name', label: 'Name (A–Z)' },
];

export default function BoardFilters({ activeFilters, onFiltersChange, sort, onSortChange }: Props) {
  const toggleFilter = (filter: BoardFilter) => {
    if (activeFilters.includes(filter)) {
      onFiltersChange(activeFilters.filter((f) => f !== filter));
    } else {
      onFiltersChange([...activeFilters, filter]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Filter className="h-3.5 w-3.5" />
            Filter
            {activeFilters.length > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {FILTER_OPTIONS.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={activeFilters.includes(opt.value)}
              onCheckedChange={() => toggleFilter(opt.value)}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <SortAsc className="h-3.5 w-3.5" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sort} onValueChange={(v) => onSortChange(v as BoardSort)}>
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
