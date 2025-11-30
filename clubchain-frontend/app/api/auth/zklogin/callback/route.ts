import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idToken = searchParams.get("id_token");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!idToken) {
    return NextResponse.redirect(
      new URL("/auth/signin?error=no_token", request.url)
    );
  }

  // Store JWT in session storage via redirect with hash
  // Frontend will read it from the URL
  return NextResponse.redirect(
    new URL(`/auth/signin?zklogin_token=${encodeURIComponent(idToken)}`, request.url)
  );
}


