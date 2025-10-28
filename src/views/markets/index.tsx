import { Menus } from "@/components/menu";
import { Outlet } from "react-router-dom";
import { XFooter } from "@/components/footer";

function Markets() {
  return (
    <>
      {/* <Menus /> */}
      <Outlet />
      <XFooter />
    </>
  );
}

export default Markets;
