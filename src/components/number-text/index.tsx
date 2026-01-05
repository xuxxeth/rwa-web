import { memo } from "react";

const NumberText = memo(
  ({ text }: {text?: string | number}) => {
    return (
      <span>
        { text !== undefined ? text : '--' }
      </span>
    )
  }
)

export { NumberText }