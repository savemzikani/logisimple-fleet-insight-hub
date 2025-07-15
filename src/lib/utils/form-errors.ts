import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type FieldError } from "react-hook-form";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFormErrors(errors: Record<string, FieldError>): string[] {
  return Object.values(errors).map(error => error.message || 'Invalid field');
}

export function extractNestedErrorMessages(error: any): string[] {
  if (!error) return [];
  
  if (typeof error === 'string') {
    return [error];
  }
  
  if (Array.isArray(error)) {
    return error.flatMap(e => extractNestedErrorMessages(e));
  }
  
  if (typeof error === 'object') {
    return Object.values(error).flatMap(value => 
      extractNestedErrorMessages(value as any)
    );
  }
  
  return [String(error)];
}

export function displayError(toast: any, error: any, defaultMessage: string) {
  const messages = extractNestedErrorMessages(error);
  const errorMessage = messages.length > 0 ? messages[0] : defaultMessage;
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
}
