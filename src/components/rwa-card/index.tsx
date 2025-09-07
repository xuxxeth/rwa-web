

export function RwaCard({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className=" bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[40px] w-[500px] h-[324px] relative
    ">
      { children }
    </div>
  )
}