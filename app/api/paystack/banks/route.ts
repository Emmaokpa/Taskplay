import { NextResponse } from 'next/server';

const FALLBACK_BANKS = [
  { id: 1, name: "Access Bank", code: "044" },
  { id: 2, name: "Ecobank Nigeria", code: "050" },
  { id: 3, name: "Fidelity Bank", code: "070" },
  { id: 4, name: "First Bank of Nigeria", code: "011" },
  { id: 5, name: "First City Monument Bank", code: "214" },
  { id: 6, name: "Guaranty Trust Bank", code: "058" },
  { id: 7, name: "Heritage Bank", code: "030" },
  { id: 8, name: "Keystone Bank", code: "082" },
  { id: 9, name: "Kuda Bank", code: "50211" },
  { id: 10, name: "OPay", code: "999992" },
  { id: 11, name: "Palmpay", code: "999991" },
  { id: 12, name: "Stanbic IBTC Bank", code: "039" },
  { id: 13, name: "Sterling Bank", code: "232" },
  { id: 14, name: "Union Bank of Nigeria", code: "032" },
  { id: 15, name: "United Bank for Africa", code: "033" },
  { id: 16, name: "Unity Bank", code: "215" },
  { id: 17, name: "Wema Bank", code: "035" },
  { id: 18, name: "Zenith Bank", code: "057" },
];

export async function GET() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(FALLBACK_BANKS);
  }

  try {
    const response = await fetch('https://api.paystack.co/bank?currency=NGN', {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    const data = await response.json();
    if (!response.ok || !data.data) {
      throw new Error('Upstream failed');
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Fetch Banks Fallback Active:', error);
    // Return fallback banks if Paystack is unreachable (ECONNRESET fix)
    return NextResponse.json(FALLBACK_BANKS);
  }
}
