
import { useForm, type DefaultValues, type UseFormReturn } from 'react-hook-form';
import { useCallback, useEffect, useRef } from 'react';

export function usePersistentForm<T extends Record<string, any>>(
  storageKey: string,
  defaultValues?: DefaultValues<T>
): UseFormReturn<T> & { clear: () => void } {
  const methods = useForm<T>({
    defaultValues: defaultValues
  });
  const { watch, reset } = methods;
  const clearRef = useRef(false)
  // 加载本地
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      reset(JSON.parse(savedData));
    }
  }, [reset, storageKey]);

  // 加载保存的数据
  useEffect(() => {
    try {
      if (defaultValues?.firstName) return
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (!parsedData.extraList || parsedData.extraList.length <= 0) {
          parsedData.extraList = [{ name: "", description: "", files: [] }]
        }
        reset({...defaultValues, ...parsedData} as T);
      }
    } catch (error) {
      console.error('加载表单数据失败:', error);
    }
  }, [reset, storageKey]);

  // 自动保存数据变化
  useEffect(() => {
    const subscription = watch((data) => {
      if (clearRef.current) return
      try {
        if (defaultValues?.firstName) return
        const _extraList = (data.extraList || [{ name: "", description: "", files: [] }]).map((item: any) => ({...item, files: []}))    
        const _data = {
          ...data,
          idCardFront: '',
          idCardBack: '',
          idCard: '',
          passport: '',
          addressCertification: '',
          incomeCertifications: '',
          extraList: _extraList
        }
        localStorage.setItem(storageKey, JSON.stringify(_data));
      } catch (error) {
        console.error('保存表单数据失败:', error);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, storageKey]);

  // 新增清空方法
  const clear = () => {
    clearRef.current = true
    localStorage.removeItem(storageKey);
    reset(defaultValues);
    setTimeout(() => {
      clearRef.current = false
    }, 1500)
  };

  return {
    ...methods,
    clear
  };
}
