import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
    this.props.onError?.(error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center h-full bg-bg-base text-text p-8 gap-4">
          <svg width="32" height="32" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#c50f1f" strokeWidth="1.2" />
            <path d="M6 4.5v2M6 7.5v.5" stroke="#c50f1f" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <h2 className="text-[14px] font-bold">Something went wrong</h2>
          <p className="text-[11px] text-text2 text-center max-w-[300px]">
            {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-[6px] bg-accent text-text-inv text-[12px] font-bold cursor-pointer border-none"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
