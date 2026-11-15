export function Mark({ size = 26 }: { size?: number }) {
  return (
    <span className="mark" style={{ width: size, height: size }} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}
