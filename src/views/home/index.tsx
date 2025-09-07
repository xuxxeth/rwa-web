import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Menus } from "@/components/menu";
import { Section1 } from "./components/Section1";
import { Section2 } from "./components/Section2";
import { Section3 } from "./components/Section3";
import { Section4 } from "./components/Section4";
import { Section5 } from "./components/Section5";
import { XFooter } from "@/components/footer";

function Home() {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  return (
    <div>
      <Menus />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <XFooter />
      <Link to="/">{t("home")}</Link> |{" "}
        <Link to="/about">{t("about")}</Link>
        <div style={{ marginLeft: "20px", display: "inline-block" }}>
            <button className=" text-2xl text-green-800" onClick={() => changeLanguage("en")}>EN</button>
            <button onClick={() => changeLanguage("zh")}>中文</button>
          </div>
        <h2>{t("welcome")}</h2>
      
    </div>
  );
}

export default Home