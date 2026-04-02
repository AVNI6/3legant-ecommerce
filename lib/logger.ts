// Production-safe logger — suppresses debug logs in production

const isDev = process.env.NODE_ENV === "development"

export const logger = {
  log: (...args: unknown[]) => { if (isDev) console.log(...args) },
  warn: (...args: unknown[]) => { if (isDev) console.warn(...args) },
  error: (...args: unknown[]) => { console.error(...args) }, // always log errors
  debug: (...args: unknown[]) => { if (isDev) console.debug(...args) },
}
