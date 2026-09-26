declare global {
  interface Window {
    Razorpay: any;
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK from checkout.razorpay.com');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayPaymentOptions {
  keyId: string;
  amountRupees: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (errorReason: string) => void;
}

export async function launchRazorpayCheckout(options: RazorpayPaymentOptions): Promise<boolean> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    options.onFailure('Unable to load Razorpay payment gateway script. Check your internet connection.');
    return false;
  }

  try {
    const rzpOptions = {
      key: options.keyId.trim(),
      amount: options.amountRupees * 100, // Amount in paise
      currency: 'INR',
      name: 'AstraVani India',
      description: `AstraVani Astrology Wallet Recharge (₹${options.amountRupees})`,
      image: 'https://www.astravani.in/favicon.svg',
      handler: function (response: any) {
        if (response && response.razorpay_payment_id) {
          options.onSuccess(response.razorpay_payment_id);
        } else {
          options.onFailure('Payment response was incomplete.');
        }
      },
      prefill: {
        name: options.userName || 'AstraVani Client',
        email: options.userEmail || 'support@astravani.in',
        contact: options.userPhone || '+91 9173108730'
      },
      theme: {
        color: '#D97706' // AstraVani Amber
      },
      modal: {
        ondismiss: function () {
          options.onFailure('Payment was cancelled by user.');
        }
      }
    };

    const rzp = new window.Razorpay(rzpOptions);
    rzp.on('payment.failed', function (response: any) {
      options.onFailure(response.error?.description || 'Payment transaction failed.');
    });
    rzp.open();
    return true;
  } catch (err: any) {
    options.onFailure(err.message || 'Razorpay checkout initialization failed.');
    return false;
  }
}
