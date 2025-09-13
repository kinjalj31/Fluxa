interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'uploaded':
        return { color: 'bg-blue-100 text-blue-800', icon: '📤', text: 'Uploaded' }
      case 'processing':
        return { color: 'bg-yellow-100 text-yellow-800', icon: '⚙️', text: 'Processing' }
      case 'processed':
        return { color: 'bg-green-100 text-green-800', icon: '✅', text: 'Processed' }
      case 'validated':
        return { color: 'bg-green-100 text-green-800', icon: '✅', text: 'Validated' }
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: '❌', text: 'Failed' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '❓', text: status }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  )
}