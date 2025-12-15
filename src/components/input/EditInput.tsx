import { cn } from "@/lib/utils"
import { LazyImage } from "../image/LazyImage"
import { forwardRef, useCallback, useEffect, useRef, useState, type ComponentProps } from "react"
import { useTranslation } from "@/hooks/useTranslation"

interface KycInputProps extends ComponentProps<"input"> {
  error?: string
  label?: string | React.ReactNode
}

const EditInput = forwardRef<HTMLInputElement, KycInputProps>(
  ({ className, type, error, ...props }, ref) => {
    const { t } = useTranslation()
    const [canEdit, setCanEdit] = useState(false)
    const internalRef = useRef<HTMLInputElement>(null)
    
    const setRefs = useCallback((node: HTMLInputElement | null) => {
      // 更新内部ref
      internalRef.current = node
      
      // 处理外部ref
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }, [ref])
    
    // 处理焦点的方法
    const focusInput = useCallback(() => {
      if (internalRef.current) {
        internalRef.current.focus()
      }
    }, [])
    useEffect(() => {
      if (canEdit) {
        const timer = setTimeout(() => {
          focusInput()
        }, 150)
        return () => clearTimeout(timer)
      }
    }, [canEdit, focusInput])

    return (
      <div className=" relative">
        {
          props.label && (
            <div className="text-[16px] font-normal text-[#909090] mb-2 flex items-center">
              {props.label}
              <div className="ml-4 flex items-center gap-x-1 cursor-pointer"
                onClick={() => {
                  setCanEdit(true)
                }}
              >
                <LazyImage src="/images/kyc/edit.png" className="w-[18px] h-[18px]" />
                <span className="text-[#2962FF]">{t('kyc.t53')}</span>
              </div>
            </div>
          )
        }
        <div className=" relative">
          <input
            autoFocus={canEdit}
            disabled={!canEdit}
            type={type}
            className={cn(
              "caret-[#9CFF3A] flex h-[44px] w-full bg-none px-3 py-1 rounded-[6px] text-[16px] transition-colors disabled:cursor-text outline-0 border border-[#1D1D1D] pr-[56px]",
              className,
              error ? "border-[#CA3F64]" : "focus:border-[#FFFFFF]"
            )}
            ref={setRefs}
            {...props}
          />
          {
            canEdit && (
              <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setCanEdit(false)
                }}
              >
                <LazyImage src="/images/kyc/confirm.png" className="w-[24px] h-[24px]" />
              </div>
            )
          }
          
          
        </div>
        
      </div>
      
    )
  }
)
EditInput.displayName = "EditInput"

export { EditInput }
