"use client"

import { useEffect } from "react"
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa"

interface ToastProps {
  message: string | object
  type: "success" | "error" | "info" | "warning"
  onClose: () => void
  duration?: number
}

const extractMessage = (msg: string | object): string => {
  if (typeof msg === "string") {
    return msg
  }

  if (msg && typeof msg === "object") {
    if ("error" in msg && typeof (msg as any).error === "string") {
      return (msg as any).error
    }
    if ("message" in msg && typeof (msg as any).message === "string") {
      return (msg as any).message
    }
    return JSON.stringify(msg)
  }

  return "An error occurred"
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-amber-500",
  }

  const icons = {
    success: FaCheckCircle,
    error: FaTimesCircle,
    info: FaInfoCircle,
    warning: FaExclamationTriangle,
  }

  const Icon = icons[type]
  const displayMessage = extractMessage(message)

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div
        className={`${bgColors[type]} text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md backdrop-blur-sm`}
      >
        <Icon className="text-xl flex-shrink-0" />
        <p className="flex-1 font-medium">{displayMessage}</p>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <FaTimesCircle className="text-lg" />
        </button>
      </div>
    </div>
  )
}
