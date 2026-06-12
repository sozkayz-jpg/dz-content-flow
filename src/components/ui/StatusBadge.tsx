import { Badge } from './Badge';
import { POST_STATUSES } from '../../lib/constants';
import type { PostStatus } from '../../types';

interface StatusBadgeProps {
  status: PostStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const s = POST_STATUSES.find((x) => x.id === status);
  if (!s) return null;
  return (
    <Badge color={s.color} size={size}>
      {s.label}
    </Badge>
  );
}
