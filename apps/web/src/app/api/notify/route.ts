import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body: { name?: string; contact?: string; contactType?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { name, contact, contactType } = body;

  if (!name?.trim() || !contact?.trim()) {
    return NextResponse.json({ error: 'Name and contact are required.' }, { status: 400 });
  }

  const apiToken = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_BOARD_ID;

  if (!apiToken || !boardId) {
    console.error('Missing MONDAY_API_TOKEN or MONDAY_BOARD_ID environment variables');
    return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 });
  }

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const trimmedContact = contact.trim();
  const columnValues = JSON.stringify({
    ...(contactType === 'email'
      ? { email_mm28cbvb: { email: trimmedContact, text: trimmedContact } }
      : { phone_mm28r7ry: { phone: trimmedContact, countryShortName: 'IL' } }),
    date_mm278wm3: { date: dateStr },
  });

  const mutation = `mutation {
    create_item(
      board_id: ${boardId},
      item_name: ${JSON.stringify(name.trim())},
      column_values: ${JSON.stringify(columnValues)}
    ) {
      id
    }
  }`;

  try {
    const res = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiToken,
      },
      body: JSON.stringify({ query: mutation }),
    });

    const data = await res.json();

    if (data.errors?.length) {
      console.error('Monday.com API error:', JSON.stringify(data.errors));
      return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, itemId: data.data?.create_item?.id });
  } catch (err) {
    console.error('Monday.com request failed:', err);
    return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 502 });
  }
}
