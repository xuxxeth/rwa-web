import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant" // 可改成 'smooth' 有平滑效果
    })
   
  }, [pathname])

  return null
}
