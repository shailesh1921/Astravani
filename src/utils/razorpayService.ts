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
      name: 'AstroTalk India',
      description: `Astrology Consultation Wallet Recharge (₹${options.amountRupees})`,
      image: 'https://astrotalk.com/assets/images/astrotalk-logo.png',
      handler: function (response: any) {
        if (response && response.razorpay_payment_id) {
          options.onSuccess(response.razorpay_payment_id);
        } else {
          options.onFailure('Payment response was incomplete.');
        }
      },
      prefill: {
        name: options.userName || 'Shailesh Singh',
        email: options.userEmail || 'consultation@astrotalk.com',
        contact: options.userPhone || '+91 9876543210'
      },
      theme: {
        color: '#F59E0B' // Astrotalk Gold
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
