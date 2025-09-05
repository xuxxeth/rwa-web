import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { Menus } from "@/components/menu";
import { Section1 } from "./components/Section1";
import { Section2 } from "./components/Section2";

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