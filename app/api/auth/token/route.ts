import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
    const response = await fetch(`${issuerBaseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.AUTH0_API_CLIENT_ID,
        client_secret: process.env.AUTH0_API_CLIENT_SECRET,
        audience: process.env.AUTH0_API_AUDIENCE,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      console.error('Failed to get token from Auth0:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to authenticate with Auth0' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error obtaining access token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
