import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Odoo fills in a Sales Price of 1.00 (or 0) when a product was created without one,
 * so those values are placeholders, not real catalogue prices.
 */
export function hasListPrice(price: number | null | undefined): price is number {
  return price != null && price > 1.0001
}

export function formatListPrice(price: number | null | undefined): string {
  return hasListPrice(price) ? `SAR ${price.toFixed(2)}` : "No price"
}
