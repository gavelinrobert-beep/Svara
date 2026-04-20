import { LeadStatus, STATUS_LABELS, STATUS_COLORS } from '../lib/types';

interface Props {
  status: LeadStatus;
}

export function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
