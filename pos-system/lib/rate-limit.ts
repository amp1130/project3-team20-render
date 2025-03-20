import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
// In production, use Redis or another distributed store
const ipRequestCounts = new Map<string, { count: number, timestamp: number }>();

export function rateLimit(request: NextRequest, limit = 100, windowMs = 60000) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const current = ipRequestCounts.get(ip) || { count: 0, timestamp: now };
  
  // Reset if outside window
  if (current.timestamp < windowStart) {
    current.count = 0;
    current.timestamp = now;
  }
  
  current.count++;
  ipRequestCounts.set(ip, current);
  
  return current.count <= limit;
} 