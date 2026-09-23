export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Content-Type, x-api-version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      amount, 
      customerName, 
      customerPhone, 
      customerEmail, 
      appId, 
      secretKey, 
      env 
    } = req.body || {};

    const isProd = env === 'production';
    const endpoint = isProd 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    const clientId = appId || process.env.CASHFREE_APP_ID || '';
    const clientSecret = secretKey || process.env.CASHFREE_SECRET_KEY || '';

    const orderId = `order_av_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': clientId,
        'x-client-secret': clientSecret
      },
      body: JSON.stringify({
        order_amount: Number(amount) || 50,
        order_currency: 'INR',
        order_id: orderId,
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_name: customerName || 'AstraVani Client',
          customer_email: customerEmail || 'client@astravani.in',
          customer_phone: customerPhone || '9876543210'
        },
        order_meta: {
          return_url: `https://astravani.in/?order_id=${orderId}`
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
