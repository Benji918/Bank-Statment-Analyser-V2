import dayjs from 'dayjs'

export function formatCurrency(amount: number, currency = 'GBP'): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount)
}

export function formatDate(dateStr: string, format = 'DD MMM YYYY'): string {
    return dayjs(dateStr).format(format)
}

export function formatPeriod(period: string): string {
    return dayjs(period + '-01').format('MMMM YYYY')
}

export function formatPercentage(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
