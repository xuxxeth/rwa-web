import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function SwitchChainButton() {

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="h-[38px] flex items-center px-6 bg-[#9CFF3A] text-sm font-semibold rounded-[100px] cursor-pointer">
          Connect Wallet
        </div>
      </DropdownMenuTrigger>
       <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>在线</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span>离开</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>忙碌</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
      
    </DropdownMenu>
  )
}