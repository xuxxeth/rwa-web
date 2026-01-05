import { memo } from "react";

const SmallButton = memo(
  ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => {
    return (
      <div className="flex items-center justify-center h-[32px] cursor-pointer px-2 rounded-[8px] border border-[rgba(255,255,255,0.2)] text-white font-medium text-[12px] hover:bg-[rgba(255,255,255,0.1)]"
        onClick={() => {
          onClick && onClick()
        }}
      >
        { children }
      </div>
    )
  }
)

export { SmallButton }