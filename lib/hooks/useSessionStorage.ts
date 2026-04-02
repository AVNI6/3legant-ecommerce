import { useState, useEffect } from 'react'

/**
 * Hook for managing sessionStorage with SSR support
 * Persists data across page navigation within same session
 * @param key The sessionStorage key
 * @param initialValue Default value if no stored value exists
 * @returns [value, setValue] tuple similar to useState
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Read from sessionStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = sessionStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      }
    } catch (err) {
      console.warn(`[useSessionStorage] Failed to read key "${key}":`, err)
    }
  }, [key])

  // Write to sessionStorage whenever value changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        if (valueToStore === null) {
          sessionStorage.removeItem(key)
        } else {
          sessionStorage.setItem(key, JSON.stringify(valueToStore))
        }
      }
    } catch (err) {
      console.warn(`[useSessionStorage] Failed to write key "${key}":`, err)
    }
  }

  return [storedValue, setValue] as const
}
