type ErrorContext = {
  area: string;
  action?: string;
};

export function logInternalError(error: unknown, context: ErrorContext): void {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[Drumkit:${context.area}] ${context.action ?? 'error'}: ${message}`);
}

export function logInternalWarning(message: string, context: ErrorContext): void {
  console.warn(`[Drumkit:${context.area}] ${context.action ?? 'warning'}: ${message}`);
}
