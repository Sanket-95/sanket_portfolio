interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

/** Monogram + name lockup used in the navbar and footer. */
export function Logo({ className = '', showTagline = false }: LogoProps) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-accent text-[15px] font-bold tracking-tight text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.9)]"
      >
        SS
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[17px] font-semibold tracking-tight text-white">
          Sanket <span className="font-normal text-slate-300">Sathe</span>
        </span>
        {showTagline && (
          <span className="mt-1.5 text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
            Full Stack · Cloud · Industrial
          </span>
        )}
      </span>
    </span>
  );
}
