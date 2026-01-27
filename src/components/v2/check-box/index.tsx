import { memo, useEffect, useState } from "react";
import { LazyImage } from "../../image/LazyImage";

type CheckBoxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

const CheckBox = memo(({ checked, onChange }: CheckBoxProps) => {
  const [check, setCheck] = useState(checked);
  useEffect(() => {
    setCheck(checked)
  }, [checked])
  return (
    <button
      type="button"
      className=" cursor-pointer outline-none"
      onClick={() => {
        setCheck(!check);
        onChange && onChange(!check);
      }}
    >
      <LazyImage
        src={check ? "/images/v2/icons/checked.png" : "/images/v2/icons/check.png"}
        className="w-[14px] h-[14px]"
      />
    </button>
  );
});


export { CheckBox };
