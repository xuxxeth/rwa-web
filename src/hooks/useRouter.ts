
import { useLocation, useNavigate } from "react-router-dom"

export function useRouter() {

  const navigate = useNavigate()
  const location = useLocation()
  
  const push = (path: string) => {  
    navigate(path)
  }
  const replace = (path: string) => {
    navigate(path, { replace: true })
  }
  const back = () => {
    navigate(-1)
  }
  return {
    push,
    replace,
    back,
    location
  }
}