import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountNumber = searchParams.get('account_number');
  const bankCode = searchParams.get('bank_code');

  if (!accountNumber || !bankCode) {
    return NextResponse.json({ error: 'Missing account number or bank code' }, { status: 400 });
  }

  const secretKey = process.env.KORAPAY_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Korapay Secret Key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.korapay.com/merchant/api/v1/misc/banks/resolve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
         bank: bankCode,
         account: accountNumber
      })
    });

    const data = await response.json();
    if (!data.status) {
      return NextResponse.json({ error: data.message || 'Verification failed' }, { status: 400 });
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Resolve Account Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
