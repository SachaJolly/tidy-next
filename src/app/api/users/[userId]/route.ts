import { NextResponse } from "next/server";

export async function GET(request: Request, context: any) {
  const { params } = context;
  // TODO: Replace with actual user data
  // const user = data.find((x) => x.id === parseInt(params.userId));

  return NextResponse.json({
    user: null,
  });
}
