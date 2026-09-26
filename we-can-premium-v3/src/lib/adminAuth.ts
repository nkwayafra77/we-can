import { NextRequest } from 'next/server';
export function isAdmin(request: NextRequest) {
  const token = request.cookies.get('wecan_admin')?.value;
  return !!token && token === process.env.ADMIN_PASSWORD;
}
