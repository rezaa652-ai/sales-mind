export default function HIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center align-middle mr-2">
      <span className="h-[1.1em] w-[1.1em] inline-flex">{children}</span>
    </span>
  )
}
