import { Badge } from './Badge';
import { PLATFORMS } from '../../lib/constants';
import type { Platform } from '../../types';

interface PlatformBadgeProps {
  platform: Platform;
  size?: 'sm' | 'md';
}

export function PlatformBadge({ platform, size = 'sm' }: PlatformBadgeProps) {
  const p = PLATFORMS.find((x) => x.id === platform);
  if (!p) return null;
  return (
    <Badge color={p.color} size={size}>
      {p.label}
    </Badge>
  );
}
