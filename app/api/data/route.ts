import { NextResponse } from 'next/server';
import { generateInitialData } from '../../../lib/dataGenerator';

export async function GET() {
  const data = generateInitialData(10000);
  return NextResponse.json({ data });
}
