import { brandIcons, type BrandKey } from '@/data/brandIcons';

interface BrandIconProps {
  name: BrandKey;
  size?: number;
  /** Render in brand colour (default) or a neutral monochrome. */
  tone?: 'brand' | 'mono';
  className?: string;
}

/** Brightens very dark brand colours so they stay visible on the dark theme. */
const visibleOnDark: Partial<Record<BrandKey, string>> = {
  javascript: '#F7DF1E',
  php: '#8892BF',
  linux: '#FCC624',
  grafana: '#F46800',
  mysql: '#4E9CC7',
  postgresql: '#6EA4D9',
  sqlserver: '#E0484A',
  nodejs: '#6CC24A',
  vite: '#A78BFA',
  threejs: '#F5F5F5',
  vercel: '#F5F5F5',
  github: '#F5F5F5',
  jquery: '#4DA3E0',
  dotnet: '#9B7BFF',
  mqtt: '#C561C5',
  odoo: '#B07AA6',
  framer: '#3B82F6',
  digitalocean: '#3B9EFF',
  jira: '#4C9AFF',
};

export function BrandIcon({ name, size = 28, tone = 'brand', className }: BrandIconProps) {
  const icon = brandIcons[name];
  const fill = tone === 'mono' ? 'currentColor' : (visibleOnDark[name] ?? icon.hex);
  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={fill}
      fillRule="evenodd"
    >
      <path d={icon.path} />
    </svg>
  );
}
