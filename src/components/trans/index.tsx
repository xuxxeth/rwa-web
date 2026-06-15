import { useTranslation } from "@/hooks/useTranslation";
import {
  Trans as I18nTrans,
} from "react-i18next";


type I18nTransProps = React.ComponentProps<typeof I18nTrans>;

export function Trans(props: I18nTransProps) {
  // 建立语言订阅，保证使用 Trans 的组件在切语言时更新
  useTranslation((props as any).ns);
  return <I18nTrans {...props} />;
}