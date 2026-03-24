import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountNumber = searchParams.get('account_number');
  const bankCode = searchParams.get('bank_code');

  if (!accountNumber || !bankCode) {
    return NextResponse.json({ error: 'Missing account number or bank code' }, { status: 400 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Paystack Secret Key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Verification failed' }, { status: response.status });
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Resolve Account Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
