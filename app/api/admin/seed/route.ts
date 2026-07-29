import { NextResponse } from 'next/server';
import { seedActivities } from '@/lib/firebase/services/seedData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // Basic security key check to prevent unwanted calls
  if (key !== 'seed2026') {
    return NextResponse.json({ error: 'Unauthorized key.' }, { status: 401 });
  }

  const result = await seedActivities();
  
  if (result.success) {
    return NextResponse.json({
      message: `Seeding completed successfully. Seeded ${result.count} new activities.`,
      result
    });
  } else {
    return NextResponse.json({
      error: 'Seeding failed.',
      details: result.error
    }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
