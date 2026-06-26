import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `PKR ${value.toFixed(2)}`;
  }
}

/**
 * Clears Radix UI (and similar) scroll lock / pointer-events from document.body.
 * Call after closing a dialog before navigation, or when the page is left unclickable after a dialog closes.
 * See: https://github.com/radix-ui/primitives/issues/3797
 */
export function clearBodyScrollLock(): void {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "";
  document.body.style.pointerEvents = "";
  document.body.removeAttribute("data-scroll-locked");
}
