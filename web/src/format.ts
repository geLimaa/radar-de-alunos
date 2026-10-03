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

export function formatDays(value: number | null): string {
  if(value === null){ return '—' }

  return `${formatNumber(value)} dias`
}

export function formatActivityDays(value: number | null): string {
  if(value === null){ return 'Nunca' }
  if(value === 0){ return 'hoje' }
  if(value === 1){ return 'há 1 dia' }

  return `há ${formatNumber(value)} dias`
}