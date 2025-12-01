"use client"

import { toast } from "sonner"

type Options = {
  description?: string
  duration?: number
}

export const snackbar = {
  success(message: string, options: Options = {}) {
    toast.success(message, options)
  },
  error(message: string, options: Options = {}) {
    toast.error(message, options)
  },
  info(message: string, options: Options = {}) {
    toast(message, options)
  },
}

export default snackbar