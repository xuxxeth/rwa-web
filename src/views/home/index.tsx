import { lazy } from "react";
import Section1 from "./new/Section1";
import { XFooter } from "@/components/footer";

const Section2 = lazy(() => import("./new3/Section2"));
const Section3 = lazy(() => import("./new3/Section3"));
const Section4 = lazy(() => import("./new/Section4"));
const Section5 = lazy(() => import("./new/Section5"));
const Section6 = lazy(() => import("./new/Section6"));

export let heroAnimatedOnce = false


export default function Page() {
  return (
    <div className=" font-normal bg-[#06070A]">

      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
      <XFooter from="home" />
    </div>
  )
}
