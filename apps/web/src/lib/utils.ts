import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Chess scoring utilities
export function getChessNotation(score: number): { symbol: string; name: string } {
  if (score >= 80) return { symbol: '!!', name: 'Brilliant' };
  if (score >= 70) return { symbol: '!', name: 'Excellent' };
  if (score >= 60) return { symbol: '+', name: 'Good' };
  if (score >= 40) return { symbol: '=', name: 'Average' };
  if (score >= 20) return { symbol: '?', name: 'Mistake' };
  return { symbol: '??', name: 'Blunder' };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 70) return 'text-blue-500';
  if (score >= 60) return 'text-sky-400';
  if (score >= 40) return 'text-gray-400';
  if (score >= 20) return 'text-orange-500';
  return 'text-red-500';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 60) return 'bg-sky-400';
  if (score >= 40) return 'bg-gray-400';
  if (score >= 20) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getDimensionIcon(dimension: string): string {
  const icons = {
    strategic: '🎯',
    tactical: '⚔️',
    cognitive: '🧠',
    innovation: '💡'
  };
  return icons[dimension as keyof typeof icons] || '📊';
}

export function getDimensionColor(dimension: string): string {
  const colors = {
    strategic: 'text-purple-500',
    tactical: 'text-blue-500',
    cognitive: 'text-green-500',
    innovation: 'text-yellow-500'
  };
  return colors[dimension as keyof typeof colors] || 'text-gray-500';
}

export function getTrendIcon(trend: string): string {
  const icons = {
    improving: '📈',
    declining: '📉',
    stable: '➡️',
    volatile: '📊'
  };
  return icons[trend as keyof typeof icons] || '📊';
}

export function getTrendColor(trend: string): string {
  const colors = {
    improving: 'text-green-500',
    declining: 'text-red-500',
    stable: 'text-blue-500',
    volatile: 'text-orange-500'
  };
  return colors[trend as keyof typeof colors] || 'text-gray-500';
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

