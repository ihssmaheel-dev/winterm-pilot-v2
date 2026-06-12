import { useState, useCallback, useEffect } from 'react'
import { setToastCallback } from './useKeyboard'

export function useToast() {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })

  const show = useCallback((msg: string) => {
    setToast({ message: msg, visible: true })
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2200)
  }, [])

  useEffect(() => {
    setToastCallback(show)
    return () => setToastCallback(() => {})
  }, [show])

  return toast
}
