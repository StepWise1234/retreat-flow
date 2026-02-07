import { CreditCard, DollarSign } from 'lucide-react';
import { Registration, PaymentStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  registration: Registration;
}

const statusColors: Record<PaymentStatus, string> = {
  Unpaid: 'text-stage-payment',
  Partial: 'text-stage-interview',
  Paid: 'text-stage-approval',
  Refunded: 'text-destructive',
};

export default function FinancialSummary({ registration }: Props) {
  const { amountDue, amountPaid, paymentStatus, accommodationPriceAdjustment, accommodationChoice } = registration;

  const total = (amountDue ?? 0) + (accommodationPriceAdjustment ?? 0);

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financial Summary</h5>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <p className={cn('font-medium', statusColors[paymentStatus])}>{paymentStatus}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Amount Due</p>
          <p className="font-medium text-foreground">
            {amountDue != null ? `$${amountDue.toLocaleString()}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Amount Paid</p>
          <p className="font-medium text-foreground">
            {amountPaid != null ? `$${amountPaid.toLocaleString()}` : '—'}
          </p>
        </div>
        {accommodationChoice && (
          <div>
            <p className="text-xs text-muted-foreground">Accommodation Adj.</p>
            <p className="font-medium text-foreground">
              {accommodationPriceAdjustment != null ? `+$${accommodationPriceAdjustment}` : '—'}
            </p>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-xs font-medium text-muted-foreground">Total Due</span>
          <span className="text-sm font-semibold text-foreground">${total.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
