/*
import { initializeTables } from '../../../../lib/dynamodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await initializeTables();
    return NextResponse.json({ message: "Tables initialized successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
  */
