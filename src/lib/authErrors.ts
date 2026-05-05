type FirebaseLikeError = {
  code?: string;
  message?: string;
};

export const getUserFacingErrorMessage = (
  error: FirebaseLikeError,
  fallback = 'Something went wrong. Please try again.'
): string => {
  switch (error.code) {
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently unavailable. Please contact support.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid login details. Please check your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed sign-in attempts. Please try again later.';
    case 'functions/permission-denied':
      return 'You do not have permission to perform this action.';
    case 'functions/not-found':
      return 'The requested record could not be found.';
    case 'functions/already-exists':
      return 'An account with these details already exists.';
    case 'functions/failed-precondition':
      return 'This action is not available right now.';
    case 'functions/unavailable':
      return 'The service is temporarily unavailable. Please try again shortly.';
    case 'functions/internal':
    case 'auth/internal-error':
      return 'A server error occurred. Please try again.';
    default:
      break;
  }

  if (!error.message) {
    return fallback;
  }

  const message = error.message
    .replace(/^Firebase:\s*/i, '')
    .replace(/^FirebaseError:\s*/i, '')
    .trim();

  if (!message) {
    return fallback;
  }

  const normalized = message.toLowerCase();
  if (normalized.includes('network') || normalized.includes('failed to fetch')) {
    return 'Unable to connect right now. Please check your internet connection and try again.';
  }
  if (normalized.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }
  if (normalized.includes('invalid bootstrap key')) {
    return 'The registration key is invalid.';
  }
  if (normalized.includes('admin account already exists')) {
    return 'Initial admin setup has already been completed.';
  }
  if (normalized.includes('no cached credentials exist')) {
    return 'UMIS is unavailable and no offline login is available for this account yet.';
  }
  if (normalized.includes('incorrect password')) {
    return 'Incorrect password. Please try again.';
  }
  if (normalized.includes('could not reach umis') || normalized.includes('umis')) {
    return 'UMIS is currently unavailable. Please try again shortly.';
  }
  if (normalized.includes('access denied')) {
    return 'Your account is not allowed to access this area.';
  }

  return fallback;
};

export const getAuthErrorMessage = (
  error: FirebaseLikeError,
  fallback = 'Authentication failed.'
): string => {
  return getUserFacingErrorMessage(error, fallback);
};
