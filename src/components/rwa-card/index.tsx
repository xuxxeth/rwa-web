

export function RwaCard({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className=" bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[16px] w-[326px] h-[148px] relative cursor-pointer transition-all
    rwa-card
    ">
      { children }
    </div>
  )
}