import { cn } from "../../utils";

export type MenusItemPros = {
  title: string;
}

export function MenusItem({
  title
}: MenusItemPros) {
  return (
    <div className={cn(
      " text-base text-white cursor-pointer"
    )}>
      {title}
    </div>
  )
}