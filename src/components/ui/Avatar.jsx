/** Round initials chip. Pass `className` to change size/colour. */
export function Avatar({ children, className = 'bg-accent text-on-accent', size = 'md', title }) {
  const sizes = { xs: 'size-6 text-[0.58rem]', sm: 'size-7 text-[0.62rem]', md: 'size-9 text-[0.74rem]' }
  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}
