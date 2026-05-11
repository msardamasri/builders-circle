export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11" cy="16" r="5" fill="currentColor" />
      <circle cx="21" cy="16" r="5" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}
