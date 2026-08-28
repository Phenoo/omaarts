import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/firebase/admin';
import { isStaffRole } from '@/lib/auth/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_MAX_AGE = 5 * 24 * 60 * 60 * 1000;

function response(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const { adminAuth, adminDb, isConfigured } = getAdminContext();
  if (!isConfigured || !adminAuth || !adminDb) return response({ error: 'Authentication service is temporarily unavailable.' }, 503);

  const authorization = request.headers.get('authorization') || '';
  const idToken = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!authorization.toLowerCase().startsWith('bearer ') || !idToken) return response({ error: 'Authentication is required.' }, 401);

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const profile = await adminDb.collection('users').doc(decoded.uid).get();
    if (!profile.exists || !isStaffRole(profile.data()?.role)) return response({ error: 'Access denied.' }, 403);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE });
    const result = response({ success: true });
    result.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE / 1000,
    });
    return result;
  } catch {
    return response({ error: 'Unable to establish a secure session.' }, 401);
  }
}

export async function DELETE() {
  const result = response({ success: true });
  result.cookies.set('__session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return result;
}
