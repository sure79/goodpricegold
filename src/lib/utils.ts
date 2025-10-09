import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('ko-KR').format(number)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date))
}

export function generateRequestNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

  return `GK${year}${month}${day}${random}`
}

export function generateSettlementNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

  return `ST${year}${month}${day}${random}`
}

export function getStatusColor(status: string): string {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    shipped: 'bg-blue-100 text-blue-800',
    received: 'bg-purple-100 text-purple-800',
    evaluating: 'bg-orange-100 text-orange-800',
    evaluated: 'bg-indigo-100 text-indigo-800',
    confirmed: 'bg-green-100 text-green-800',
    deposited: 'bg-emerald-100 text-emerald-800',
    paid: 'bg-gray-100 text-gray-800',
  }

  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
}

export function getStatusText(status: string): string {
  const statusTexts = {
    pending: '접수완료',
    shipped: '발송완료',
    received: '수령완료',
    evaluating: '감정중',
    evaluated: '감정완료',
    confirmed: '정산확정',
    deposited: '입금완료',
    paid: '송금완료',
  }

  return statusTexts[status as keyof typeof statusTexts] || status
}