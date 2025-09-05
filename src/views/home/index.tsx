import { Link } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";

function Home() {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  return (
    <div>
      <Link to="/">{t("home")}</Link> |{" "}
        <Link to="/about">{t("about")}</Link>
      <div style={{ marginLeft: "20px", display: "inline-block" }}>
          <button onClick={() => changeLanguage("en")}>EN</button>
          <button onClick={() => changeLanguage("zh")}>中文</button>
        </div>
    <h2>{t("welcome")}</h2>
      
    </div>
  );
}

export default Home