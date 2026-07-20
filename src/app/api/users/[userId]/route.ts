import data from "@/data.json";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: any) {
  const { params } = context;
  const user = data.find((x) => x.id === parseInt(params.userId));

  return NextResponse.json({
    user,
  });
}
