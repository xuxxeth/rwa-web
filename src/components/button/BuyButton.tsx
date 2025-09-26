import ArrowRight2SVG from "./arrow-right2.svg?react";
import { noop } from "@/utils";

import { useNavigate } from "react-router-dom";

export default function BuyButton({ to }: { to?: string }) {
  const navigate = useNavigate();
  const onClick = to ? () => navigate(to) : noop;
  return (
    <button
      onClick={onClick}
      className="flex flex-row hover:bg-[rgba(33,201,94,1)] text-[rgba(33,201,94,1)] hover:text-black items-center font-medium h-10 px-3 py-2  bg-[rgba(33,201,94,0.1)] rounded-[5px] cursor-pointer"
    >
      <span>Buy</span>
      <ArrowRight2SVG className="w-4 h-4 ml-2" />
    </button>
  );
}
