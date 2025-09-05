import { useTranslation } from "../../hooks/useTranslation";

function About() {
  const { t } = useTranslation();
  return <h2>{t("about")}</h2>;
}

export default About