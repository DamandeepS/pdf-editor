import React, { useState } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: 'circle' | 'rounded';
  status?: AvatarStatus;
  fallbackIcon?: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

const getInitials = (name?: string): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  fallbackIcon,
  className = '',
  ref,
  ...rest
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name);
  const accessibleLabel = alt || name || 'User avatar';
  const hasImage = Boolean(src && !imgFailed);

  return (
    <div
      ref={ref}
      role={hasImage ? undefined : 'img'}
      aria-label={hasImage ? undefined : accessibleLabel}
      className={`inq-avatar inq-avatar--${size} inq-avatar--${shape} ${className}`.trim()}
      {...rest}
    >
      {hasImage ? (
        <img
          src={src}
          alt={accessibleLabel}
          onError={() => setImgFailed(true)}
          className="inq-avatar-image"
        />
      ) : initials ? (
        <span className="inq-avatar-initials" aria-hidden="true">
          {initials}
        </span>
      ) : fallbackIcon ? (
        <span className="inq-avatar-fallback-icon" aria-hidden="true">
          {fallbackIcon}
        </span>
      ) : (
        <svg
          className="inq-avatar-default-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}

      {status && (
        <span
          className={`inq-avatar-status inq-avatar-status--${status}`}
          aria-label={`Status: ${status}`}
          role="status"
        />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';
