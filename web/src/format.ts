export function formatNumber(value: number | null): string {
  if(value === null){ return '—' }

  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatInteger(value: number | null): string {
  if(value === null){ return '—' }

  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercent(value: number | null): string {
  if(value === null){ return '—' }

  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(value))
}