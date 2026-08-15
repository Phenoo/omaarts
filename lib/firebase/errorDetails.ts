export function firebaseErrorDetails(error: unknown) {
  if (typeof error !== 'object' || error === null) {
    return { code: 'unknown', message: String(error) };
  }

  const candidate = error as { code?: unknown; message?: unknown; name?: unknown; status?: unknown };
  return {
    code: typeof candidate.code === 'string' ? candidate.code : 'unknown',
    message: typeof candidate.message === 'string' ? candidate.message : 'Unknown Firebase error',
    name: typeof candidate.name === 'string' ? candidate.name : undefined,
    status: typeof candidate.status === 'number' ? candidate.status : undefined,
  };
}
