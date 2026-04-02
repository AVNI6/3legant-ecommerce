// Form-related types shared across components
export interface BaseFormData {
  [key: string]: string | number | boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface SignInInputs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpInputs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agreeToTerms?: boolean;
}

export interface ForgotPasswordInputs {
  email: string;
}

export interface AdminFormValues {
  email: string;
  password: string;
}
