interface SparkLogoProps {
  size?: number;
  className?: string;
}

/** Spark mark — a 4-point star/spark in Stanford Red. */
export function SparkLogo({ size = 24, className }: SparkLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Spark"
    >
      <path
        d="M12 1.5c.4 5.2 4.9 9.7 10.1 10.1V12c-5.2.4-9.7 4.9-10.1 10.1h-.5C11 16.9 6.5 12.4 1.3 12V12C6.5 11.6 11 7.1 11.5 1.9h.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SparkWordmark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <SparkLogo size={22} className="text-spark-500" />
      <span className="text-lg font-semibold tracking-tight">Spark</span>
    </div>
  );
}
