// Form validation and utility functions

export const validatePrice = (price: string): boolean => {
  const num = Number(price)
  return !isNaN(num) && num > 0
}

export const validateStock = (stock: string): number => {
  const num = Number(stock)
  return isNaN(num) || num < 0 ? 0 : num
}

export const validateRequired = (value: string): boolean => {
  return cleanString(value).length > 0
}

export const cleanString = (v?: string) => (v ?? "").trim()

export const formatPrice = (price: number | string): string => {
  const num = typeof price === 'string' ? Number(price) : price
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone.trim()) && phone.trim().length >= 10
}
