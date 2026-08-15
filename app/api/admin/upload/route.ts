import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminContext } from '@/lib/firebase/admin';
import { isStaffRole } from '@/lib/auth/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function sanitizeFileName(name: string) {
  const extension = name.includes('.') ? `.${name.split('.').pop()?.toLowerCase()}` : '';
  const stem = name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return `${stem || 'image'}${extension}`;
}

export async function POST(req: NextRequest) {
  try {
    const { adminAuth, adminDb, adminStorage, isConfigured, error: initError } = getAdminContext();

    if (!isConfigured || !adminAuth || !adminDb || !adminStorage) {
      console.error('[UploadAPI] Firebase Admin is not configured:', initError);
      return NextResponse.json(
        { error: 'Storage service is temporarily unavailable. Server configuration incomplete.' },
        { status: 503 }
      );
    }

    // 1. Authenticate the caller via Firebase Auth ID Token
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication token is missing.' },
        { status: 401 }
      );
    }

    const idToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Token verification failed';
      console.error('[UploadAPI] Invalid auth token:', errMsg);
      return NextResponse.json(
        { error: 'Invalid or expired session. Please sign in again.' },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;

    // 2. Authorize caller - verify staff/admin role in Firestore
    const userDocSnap = await adminDb.collection('users').doc(uid).get();
    if (!userDocSnap.exists) {
      console.warn(`[UploadAPI] User document users/${uid} does not exist`);
      return NextResponse.json(
        { error: 'Permission denied. Staff profile not found.' },
        { status: 403 }
      );
    }

    const userData = userDocSnap.data();
    if (!isStaffRole(userData?.role)) {
      console.warn(`[UploadAPI] User ${uid} has unauthorized role: ${userData?.role}`);
      return NextResponse.json(
        { error: 'Permission denied. Staff or admin role required.' },
        { status: 403 }
      );
    }

    // 3. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const requestedPath = (formData.get('path') as string | null)?.trim();
    const folder = (formData.get('folder') as string | null)?.trim() || 'artworks';
    const slug = (formData.get('slug') as string | null)?.trim() || 'artwork';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided for upload.' },
        { status: 400 }
      );
    }

    // 4. Validate file type and size
    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 10MB.' },
        { status: 400 }
      );
    }

    // 5. Determine Storage destination path
    let storagePath: string;
    if (requestedPath) {
      // Clean and sanitize custom path
      storagePath = requestedPath.replace(/^\/+|\/+$/g, '');
    } else {
      const safeFolder = ['artworks', 'activities', 'gallery', 'site'].includes(folder) ? folder : 'artworks';
      const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'upload';
      const uniqueId = crypto.randomUUID();
      const safeName = sanitizeFileName(file.name);
      storagePath = `${safeFolder}/${safeSlug}/${Date.now()}-${uniqueId}-${safeName}`;
    }

    // 6. Upload file buffer to Firebase Storage
    const bucket = adminStorage.bucket();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const downloadToken = crypto.randomUUID();
    const fileRef = bucket.file(storagePath);

    await fileRef.save(fileBuffer, {
      contentType: file.type,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
          uploadedBy: uid,
          originalName: file.name,
        },
        cacheControl: 'public,max-age=31536000,immutable',
      },
    });

    // 7. Format standard persistent Firebase Storage download URL
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${downloadToken}`;

    return NextResponse.json({
      success: true,
      url: downloadUrl,
      path: storagePath,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload image. Please try again.';
    console.error('[UploadAPI] Unexpected upload failure:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
