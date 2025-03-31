// Development-only configuration
export const devConfig = {
  // Replace these values with your actual development credentials
  email: process.env.NEXT_PUBLIC_DEV_USER_EMAIL,
  password: process.env.NEXT_PUBLIC_DEV_USER_PASSWORD,
  // Flag to enable/disable auto-login in development
  enableAutoLogin: process.env.NODE_ENV === "development",
}
