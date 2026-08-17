/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function safeFormatDate(
  dateVal?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions,
  fallback = 'Recente'
): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('pt-AO', options);
  } catch {
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? fallback : d.toLocaleDateString();
    } catch {
      return fallback;
    }
  }
}

export function safeFormatTime(
  dateVal?: string | number | Date | null,
  options?: Intl.DateTimeFormatOptions,
  fallback = '--:--'
): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleTimeString('pt-AO', options || { hour: '2-digit', minute: '2-digit' });
  } catch {
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? fallback : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return fallback;
    }
  }
}

export function safeFormatDateTime(
  dateVal?: string | number | Date | null,
  fallback = 'Recente'
): string {
  if (!dateVal) return fallback;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleString('pt-AO');
  } catch {
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? fallback : d.toLocaleString();
    } catch {
      return fallback;
    }
  }
}

export function safeFormatCurrency(amount?: number | null, fallback = '0 Kz'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return fallback;
  try {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    try {
      return `${amount.toLocaleString()} Kz`;
    } catch {
      return `${amount} Kz`;
    }
  }
}

export function safeFormatNumber(val?: number | null, fallback = '0'): string {
  if (val === undefined || val === null || isNaN(val)) return fallback;
  try {
    return val.toLocaleString('pt-AO');
  } catch {
    return String(val);
  }
}
