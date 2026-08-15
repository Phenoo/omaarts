import { auth } from '@/lib/firebase/config';

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageFile(file: File) {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file.';
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return 'Images must be 10MB or smaller.';
  }

  return null;
}

function safeFileName(name: string) {
  const extension = name.includes('.') ? `.${name.split('.').pop()?.toLowerCase()}` : '';
  const stem = name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return `${stem || 'image'}${extension}`;
}

export function imageStoragePath(folder: 'artworks' | 'activities' | 'gallery' | 'site', slug: string, file: File) {
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'upload';
  const uniqueId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${folder}/${safeSlug}/${Date.now()}-${uniqueId}-${safeFileName(file.name)}`;
}

export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required. Please sign in to upload images.');
  }

  const idToken = await currentUser.getIdToken();

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    // Track upload progress
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && response.url) {
          onProgress?.(100);
          resolve(response.url);
        } else {
          const errMsg = response.error || `Upload failed with status code ${xhr.status}`;
          reject(new Error(errMsg));
        }
      } catch {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload. Please check your connection and try again.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out. Please try uploading a smaller image or retry.'));
    };

    xhr.open('POST', '/api/admin/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
    xhr.send(formData);
  });
}

export function storageErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const errRecord = error as Record<string, unknown>;
    if (typeof errRecord.message === 'string') {
      return errRecord.message;
    }
    if (errRecord.code === 'storage/unauthorized') {
      return 'Permission denied: Your account does not have authorization to upload files.';
    }
    if (errRecord.code === 'storage/quota-exceeded') {
      return 'Firebase Storage quota has been reached. Check project billing.';
    }
  }

  return 'Image upload failed. Check the file and try again.';
}

