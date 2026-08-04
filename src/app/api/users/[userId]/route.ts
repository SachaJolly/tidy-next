import { NextResponse } from 'next/server';

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  void userId;
  // TODO: Replace with actual user data
  // const user = data.find((x) => x.id === parseInt(params.userId));

  return NextResponse.json({
    user: null,
  });
}
