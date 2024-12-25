'use client'

interface ConnectionStatusProps { 
  status: 'connected' | 'connecting' | 'disconnected'
  onRetry: () => void
  isOnline: boolean
}

export function ConnectionStatus({ status, onRetry, isOnline }: ConnectionStatusProps) {
  const statusColors = {
    connected: 'bg-green-500',
    connecting: 'bg-yellow-500 animate-pulse',
    disconnected: 'bg-red-500'
  }

  // If offline, override the status display
  const displayStatus = !isOnline ? 'offline' : status
  const statusColor = !isOnline ? 'bg-gray-500' : statusColors[status]

  return (
    <div 
      className="flex items-center gap-2 px-4 py-2 bg-background/95 border rounded-lg shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div 
        className={`w-2 h-2 rounded-full ${statusColor}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium">
        {!isOnline ? (
          'Offline - Using cached data'
        ) : (
          <>
            {status === 'connected' && 'Connected'}
            {status === 'connecting' && 'Connecting...'}
            {status === 'disconnected' && 'Disconnected'}
          </>
        )}
      </span>
      {(status === 'disconnected' && isOnline) && (
        <button
          onClick={onRetry}
          className="ml-2 text-sm text-primary hover:text-primary/80"
          aria-label="Retry connection"
        >
          Retry
        </button>
      )}
    </div>
  )
} 