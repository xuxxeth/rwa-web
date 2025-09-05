
export function MainLayout({
  children
}: {
  children: React.ReactNode
}) {

  return (
    <div className=' xl:max-w-[1440px] mx-auto'>
      {children}
    </div>
  )

}