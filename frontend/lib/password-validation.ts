// Password validation utilities

export interface PasswordValidation {
  isValid: boolean
  hasMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  const errors: string[] = []

  if (!hasMinLength) errors.push("Password must be at least 8 characters.")
  if (!hasUppercase) errors.push("Password must include at least one uppercase letter (A-Z).")
  if (!hasLowercase) errors.push("Password must include at least one lowercase letter (a-z).")
  if (!hasNumber) errors.push("Password must include at least one number (0-9).")
  if (!hasSpecialChar) errors.push("Password must include at least one special character (!@#$%, etc.).")

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar

  return {
    isValid,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    errors,
  }
}
