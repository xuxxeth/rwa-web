import { memo } from "react";
import { Loading } from ".";

const SuspenseLoading = memo(
  () => {
    return (
      <div className=' text-white flex justify-center items-center h-screen '><Loading /></div>
    )
  }
)

export { SuspenseLoading }