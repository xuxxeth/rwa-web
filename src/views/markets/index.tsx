import { Menus } from "@/components/menu";
import { Outlet } from "react-router-dom";
import { MainLayout } from "@/layouts/main";
import { BoxCard } from "../../components/BoxCard";
import { LazyImage } from "@/components/image/LazyImage";
import { useTranslation } from "@/hooks/useTranslation";
import { XFooter } from "@/components/footer";
import { useEffect, useState } from "react";
import { MarketTrading } from "@/components/market-trading";
import { ConvertTabs } from "@/components/markets/ConvertTabs";
import { KlineSwitch } from "@/components/markets/KlineSwitch";
import { ConverBody } from "@/components/markets/ConvetBody";
import { FAQ } from "@/components/markets/FAQ";
import { KlineBody } from "./components/Klinebody";

function Markets() {
  // const { t } = useTranslation();

  // const [action, setAction] = useState("buy");
  // const [showKline, setShowKline] = useState(false);

  return (
    <>
      <Menus />
      <Outlet />
      <XFooter />
    </>
  );
}

export default Markets;
