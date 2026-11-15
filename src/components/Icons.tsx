export function ArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Check({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Cross({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Bot({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3.5" y="7" width="13" height="9.5" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 4v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="3.4" r="1.3" fill="currentColor" />
      <circle cx="7.6" cy="11.6" r="1.1" fill="currentColor" />
      <circle cx="12.4" cy="11.6" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function Spark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.5l1.9 5.1 5.1 1.9-5.1 1.9L10 16.5 8.1 11.4 3 9.5l5.1-1.9L10 2.5z" fill="currentColor" />
    </svg>
  )
}

export function Shield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2.6l6 2.2v5c0 3.6-2.5 6.3-6 7.6-3.5-1.3-6-4-6-7.6v-5l6-2.2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7.2 9.9l2 2 3.6-3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Bolt({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M11.2 2.5L4.8 11h4l-1 6.5L14.8 9h-4l.4-6.5z" fill="currentColor" />
    </svg>
  )
}

export function Code({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 5.5L3 10l4.5 4.5M12.5 5.5L17 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Eye({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2 10s3-5.2 8-5.2S18 10 18 10s-3 5.2-8 5.2S2 10 2 10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function Key({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.6 9.6L16.5 16.5M13.5 13.5l2-2M15.5 15.5l1.7-1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Cursor({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 3l5.6 13.4 2-5.1 5.1-2L4 3z" fill="currentColor" />
    </svg>
  )
}

export function Sliders({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 6h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7" cy="6" r="2.1" fill="currentColor" />
      <circle cx="13" cy="14" r="2.1" fill="currentColor" />
    </svg>
  )
}
