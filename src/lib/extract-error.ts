export function getErrorMessage(
  error: unknown,
  fallbackMessage: string = "Something went wrong!"
): string {
  if (
    error &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data &&
    "message" in error.data
  ) {
    return (error.data as { message?: string }).message || fallbackMessage;
  } else if (error && "message" in error) {
    return (error as { message?: string }).message || fallbackMessage;
  }

  return fallbackMessage;
}
