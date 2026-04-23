export function formatTND(amount: number): string {
  return `${amount.toFixed(3)} TND`
}

export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    paid: 'bg-blue-100 text-blue-800 border-blue-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    approved: 'Approved',
    completed: 'Completed',
    rejected: 'Rejected',
  }
  return labels[status] || status
}
