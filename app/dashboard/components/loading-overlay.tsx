export function LoadingOverlay() {
  return (
    <div 
      className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="alert"
      aria-busy="true"
      aria-label="Loading metrics"
    >
      <div className="flex flex-col items-center gap-2">
        <div 
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"
          aria-hidden="true"
        />
        <p className="text-sm text-muted-foreground">Updating metrics...</p>
      </div>
    </div>
  )
} 