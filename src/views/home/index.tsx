
import { Menus } from "@/components/menu";
import { XFooter } from "@/components/footer";
import { lazy } from "react";
import { Section1 } from "./components/Section1";
const Section2 = lazy(() => import("./components/Section2"));
const Section3 = lazy(() => import("./components/Section3"));
const Section4 = lazy(() => import("./components/Section4"));
const Section5 = lazy(() => import("./components/Section5"));


function Home() {
  return (
    <div className=" font-normal">
      <Menus />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <XFooter />
      
    </div>
  );
}

export default Home