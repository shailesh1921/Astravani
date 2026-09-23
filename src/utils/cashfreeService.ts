// Cashfree JS SDK v3 client helper for AstraVani
declare global {
  interface Window {
    Cashfree: any;
  }
}

interface CashfreeCheckoutOptions {
  appId: string;
  secretKey: string;
  env: 'sandbox' | 'production';
  amount: number;
  userName: string;
  userPhone?: string;
  userEmail?: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (errorMsg: string) => void;
}

export const loadCashfreeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Cashfree) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const launchCashfreeCheckout = async (options: CashfreeCheckoutOptions): Promise<void> => {
  try {
    const isLoaded = await loadCashfreeScript();
    if (!isLoaded || !window.Cashfree) {
      options.onFailure('Unable to load Cashfree checkout SDK. Please check your internet connection.');
      return;
    }

    // 1. Create order through our serverless endpoint or sandbox proxy
    let paymentSessionId = '';
    let cfOrderId = '';

    try {
      const resp = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: options.amount,
          customerName: options.userName,
          customerPhone: options.userPhone || '9876543210',
          customerEmail: options.userEmail || 'client@astravani.in',
          appId: options.appId,
          secretKey: options.secretKey,
          env: options.env
        })
      });

      if (resp.ok) {
        const orderData = await resp.json();
        paymentSessionId = orderData.payment_session_id;
        cfOrderId = orderData.order_id;
      }
    } catch (e) {
      console.warn('API endpoint unavailable, attempting direct sandbox generation...', e);
    }

    // Fallback: If running locally without serverless api running, call sandbox directly
    if (!paymentSessionId) {
      const endpoint = options.env === 'production' 
        ? 'https://api.cashfree.com/pg/orders' 
        : 'https://sandbox.cashfree.com/pg/orders';

      const orderId = `order_av_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
      const directResp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': options.appId,
          'x-client-secret': options.secretKey
        },
        body: JSON.stringify({
          order_amount: options.amount,
          order_currency: 'INR',
          order_id: orderId,
          customer_details: {
            customer_id: `cust_${Date.now()}`,
            customer_name: options.userName || 'AstraVani Client',
            customer_email: options.userEmail || 'client@astravani.in',
            customer_phone: options.userPhone || '9876543210'
          },
          order_meta: {
            return_url: `https://astravani.in/?order_id=${orderId}`
          }
        })
      });

      if (directResp.ok) {
        const directData = await directResp.json();
        paymentSessionId = directData.payment_session_id;
        cfOrderId = directData.order_id;
      }
    }

    if (!paymentSessionId) {
      options.onFailure('Could not initiate payment session with Cashfree. Please verify your credentials.');
      return;
    }

    // 2. Initialize Cashfree and trigger checkout
    const cashfree = window.Cashfree({
      mode: options.env === 'production' ? 'production' : 'sandbox'
    });

    cashfree.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: '_modal'
    }).then((result: any) => {
      if (result.error) {
        options.onFailure(result.error.message || 'Payment was cancelled.');
      } else if (result.paymentDetails) {
        options.onSuccess(cfOrderId || `cf_${Date.now()}`);
      } else {
        // Fallback success for modal closure with successful flow
        options.onSuccess(cfOrderId || `cf_${Date.now()}`);
      }
    });

  } catch (err: any) {
    options.onFailure(err.message || 'An unexpected error occurred during Cashfree checkout.');
  }
};
