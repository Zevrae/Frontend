import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart, CartItem } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { useAuth } from './hooks/UseAuth';
import { cartApi } from './api/cart';
import { ordersApi, Order } from './api/orders';
import { paymentsApi } from './api/payments';
import { discountsApi, Discount } from './api/discounts';
import { ChevronLeft, ShieldCheck, Lock, Truck, CreditCard, Wallet, ArrowRight, CheckCircle2, Smartphone, Tag, X as XIcon, Home } from 'lucide-react';
import {
  ReceiptPrinter,
  type ReceiptPrinterStage,
} from './features/ReceiptPrinter';
import { generateReceiptPdf } from './utils/generateReceiptPdf';
import { isSoftToy, formatSoftToySize } from './utils/sizeFormatter';


const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Receipt Printer state ──────────────────────────────────────────
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [completedItems, setCompletedItems] = useState<CartItem[]>([]);
  const [completedPaymentMethod, setCompletedPaymentMethod] = useState<string>('');
  const [receiptStage, setReceiptStage] = useState<ReceiptPrinterStage>('processing');
  const receiptTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clean up receipt animation timers on unmount
  useEffect(() => {
    return () => {
      receiptTimers.current.forEach(clearTimeout);
    };
  }, []);

  /**
   * Kick off the receipt-printer stage transitions and schedule the
   * redirect home.  Called once after a successful order.
   */
  const startReceiptAnimation = useCallback(() => {
    setReceiptStage('processing');

    // processing → printing after 1.5s
    const t1 = setTimeout(() => setReceiptStage('printing'), 1500);
    // printing → complete after the paper-feed animation (≈1.75s)
    const t2 = setTimeout(() => setReceiptStage('complete'), 3500);
    // No auto-redirect — the user navigates home by clicking "Continue Browsing"

    receiptTimers.current = [t1, t2];
  }, []);

  /** Generate and download a receipt as a PDF file */
  const downloadReceipt = useCallback(() => {
    if (!completedOrder) return;
    generateReceiptPdf(completedOrder, completedPaymentMethod || undefined);
  }, [completedOrder, completedPaymentMethod]);

  useEffect(() => {
    if (!user) {
      setIsLoginModalOpen(true);
      navigate('/');
    }
  }, [user, navigate, setIsLoginModalOpen]);

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!shippingData.firstName) errors.firstName = 'First Name is required';
    else if (!/^[A-Za-z]{2,}$/.test(shippingData.firstName)) errors.firstName = 'Only alphabets, min 2 characters';

    if (!shippingData.lastName) errors.lastName = 'Last Name is required';
    else if (!/^[A-Za-z]{2,}$/.test(shippingData.lastName)) errors.lastName = 'Only alphabets, min 2 characters';

    if (!shippingData.email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) errors.email = 'Valid email is required';

    if (!shippingData.phone) {
      errors.phone = 'Phone number is required';
    } else {
      const isLeadingZero = shippingData.phone.startsWith('0') || (shippingData.phone.startsWith('+91') && shippingData.phone.slice(3).startsWith('0'));
      if (isLeadingZero) {
        errors.phone = '0 cannot be the leading number';
      } else if (shippingData.phone.startsWith('+91')) {
        if (!/^\+91[1-9]\d{9}$/.test(shippingData.phone)) {
          errors.phone = 'Exactly 10 digits required after +91';
        }
      } else {
        if (!/^[1-9]\d{9}$/.test(shippingData.phone)) {
          errors.phone = 'Exactly 10 digits required';
        }
      }
    }

    if (!shippingData.address) errors.address = 'Address is required';
    else if (shippingData.address.length < 10) errors.address = 'Min 10 characters required';

    if (!shippingData.city) errors.city = 'City is required';
    else if (!/^[A-Za-z\s]+$/.test(shippingData.city)) errors.city = 'Only alphabets allowed';

    if (!shippingData.postalCode) errors.postalCode = 'Postal Code is required';
    else if (!/^\d{6}$/.test(shippingData.postalCode)) errors.postalCode = 'Exactly 6 digits required';

    return errors;
  };

  const errors = validateForm();
  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const formatVal = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const subtotal = cartTotal;
  // Keep in sync with the backend's server-side calculation
  // (backend/controllers/orderController.js) — the backend is the source of
  // truth and recomputes this independently, but the two must agree so the
  // amount shown here matches what's actually charged.
  const shipping = subtotal > 999 ? 0 : 49;
  const COD_HANDLING_FEE = 15;

  const [couponInput, setCouponInput] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'checking' | 'applied' | 'error'>('idle');
  const [couponError, setCouponError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponStatus('checking');
    setCouponError('');
    try {
      const { discountAmount } = await discountsApi.preview(couponInput.trim().toUpperCase(), subtotal);
      setAppliedDiscount({ code: couponInput.trim().toUpperCase(), amount: discountAmount });
      setCouponStatus('applied');
    } catch (err: any) {
      setAppliedDiscount(null);
      setCouponStatus('error');
      setCouponError(err?.response?.data?.message || err.message || 'Invalid coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponInput('');
    setCouponStatus('idle');
    setCouponError('');
  };

  const discountAmount = appliedDiscount?.amount || 0;
  const handlingFee = selectedMethod === 'COD' ? COD_HANDLING_FEE : 0;
  const grandTotal = Math.max(0, subtotal + shipping + handlingFee - discountAmount);

  const buildShippingAddress = () => ({
    line1: shippingData.address,
    city: shippingData.city,
    postal_code: shippingData.postalCode,
    country: 'India',
    phone: shippingData.phone,
  });

  const syncCartToBackend = async () => {
    await cartApi.clearCart();
    for (const item of items) {
      await cartApi.addItem(item.id, item.size, item.quantity);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;

    setIsProcessing(true);

    try {
      await syncCartToBackend();
    } catch (err: any) {
      alert('Failed to prepare your cart: ' + (err?.response?.data?.message || err.message));
      setIsProcessing(false);
      return;
    }

    if (selectedMethod === 'RAZORPAY') {
      const scriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);
        return;
      }

      try {
        const orderRes = await ordersApi.create({
          shipping_address: buildShippingAddress(),
          payment_method: 'online',
          discount_code: appliedDiscount?.code,
        });

        if (!orderRes.payment) {
          throw new Error(orderRes.message || 'Payment gateway is not configured on the server.');
        }

        const options = {
          key: orderRes.payment.key_id,
          amount: orderRes.payment.amount,
          currency: orderRes.payment.currency,
          name: "ZEVRAE",
          description: "Luxury Apparel Checkout",
          // Served as a static asset from THIS site's own domain
          // (window.location.origin), so it's always HTTPS in production
          // and never depends on the backend being reachable. Put the
          // actual logo file at frontend/public/logo.png — anything in
          // /public is served as-is from the site root.
          // Pins the checkout branding explicitly so it can never fall
          // back to a stale/local URL saved in the Razorpay Dashboard's
          // Business Settings.
          image: `${window.location.origin}/logo.png`,
          order_id: orderRes.payment.order_id,
          handler: async function (response: any) {
            try {
              await paymentsApi.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              // Snapshot the order + cart before clearing
              setCompletedOrder(orderRes.data);
              setCompletedItems([...items]);
              setCompletedPaymentMethod('PAID ONLINE');
              clearCart();
              setStep(4);
              startReceiptAnimation();
            } catch (err: any) {
              alert('Payment verification failed: ' + (err?.response?.data?.message || err.message));
              setIsProcessing(false);
            }
          },
          prefill: {
            name: `${shippingData.firstName} ${shippingData.lastName}`,
            email: shippingData.email,
            contact: shippingData.phone
          },
          theme: {
            color: "var(--theme-accent)"
          },
          modal: {
            // Fires when the user dismisses the widget WITHOUT paying —
            // clicking the 'X', pressing Escape, or clicking the backdrop.
            // `handler` above only fires on a completed payment, so without
            // this the button gets stuck on "Processing..." forever if the
            // user just backs out.
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          alert(response.error.description);
          setIsProcessing(false);
        });
        rzp.open();
      } catch (err: any) {
        alert(err?.response?.data?.message || err.message || "Failed to initialize payment");
        setIsProcessing(false);
      }

    } else if (selectedMethod === 'COD') {
      try {
        const codRes = await ordersApi.create({
          shipping_address: buildShippingAddress(),
          payment_method: 'cod',
          discount_code: appliedDiscount?.code,
        });

        // Snapshot the order + cart before clearing
        setCompletedOrder(codRes.data);
        setCompletedItems([...items]);
        setCompletedPaymentMethod('CASH ON DELIVERY');
        clearCart();
        setStep(4);
        startReceiptAnimation();
      } catch (err: any) {
        alert('Order failed: ' + (err?.response?.data?.message || err.message));
        setIsProcessing(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      let sanitized = value.replace(/[^\d+]/g, '');
      if (sanitized.indexOf('+') > 0) {
        sanitized = sanitized.slice(0, 1) + sanitized.slice(1).replace(/\+/g, '');
      }
      setShippingData(prev => ({ ...prev, [name]: sanitized }));
      return;
    }
    setShippingData(prev => ({ ...prev, [name]: value }));
  };

  const paymentMethods = [
    {
      id: "RAZORPAY",
      name: "Pay Online",
      options: ["UPI", "Cards", "Netbanking", "Wallets"],
      recommended: true,
      tag: "Fast & Secure",
      icon: <Smartphone size={20} className="text-[var(--theme-text)]" />
    },
    {
      id: "COD",
      name: "Cash on Delivery",
      tag: "Pay at Doorstep",
      icon: <Truck size={20} className="text-[var(--theme-text)]" />
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg)] flex items-center justify-center">
        <div className="text-[var(--theme-accent)] animate-pulse">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans selection:bg-[rgba(var(--theme-accent-rgb),0.3)] pt-[140px] pb-24 relative z-10">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12 flex items-center justify-between">
        <button 
          onClick={() => step > 2 ? setStep((prev) => (prev - 1) as 2 | 3 | 4) : navigate('/')}
          className="flex items-center text-[10px] uppercase font-plex-mono tracking-[0.2em] text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] transition-colors"
        >
          <ChevronLeft size={16} className="mr-2" />
          {step === 4 ? "Back to Home" : "Back"}
        </button>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {step !== 4 && (
        <div className="max-w-[800px] mx-auto mb-16 px-6 relative">
          <div className="flex justify-between items-center relative z-10">
            <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.3)]'}`}>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-[var(--theme-accent)]' : 'bg-[rgba(var(--theme-text-rgb),0.3)]'}`} />
              <span className="text-[10px] uppercase font-plex-mono tracking-[0.2em]">Shipping</span>
            </div>
            <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.3)]'}`}>
              <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-[var(--theme-accent)]' : 'bg-[rgba(var(--theme-text-rgb),0.3)]'}`} />
              <span className="text-[10px] uppercase font-plex-mono tracking-[0.2em]">Payment</span>
            </div>
            <div className={`flex flex-col items-center gap-2 ${step >= 4 ? 'text-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.3)]'}`}>
              <div className={`w-3 h-3 rounded-full ${step >= 4 ? 'bg-[var(--theme-accent)]' : 'bg-[rgba(var(--theme-text-rgb),0.3)]'}`} />
              <span className="text-[10px] uppercase font-plex-mono tracking-[0.2em]">Confirm</span>
            </div>
          </div>
          <div className="absolute top-1.5 left-[10%] right-[10%] h-[1px] bg-[rgba(var(--theme-text-rgb),0.1)] -z-0">
            <motion.div 
              className="h-full bg-[var(--theme-accent)]"
              initial={{ width: '0%' }}
              animate={{ width: step === 2 ? '0%' : step === 3 ? '50%' : '100%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* Left Column: Form/Steps */}
        <div className={step === 4 ? "lg:col-span-12" : "lg:col-span-7"}>
          <AnimatePresence mode="wait">
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-10">
                  <h2 className="text-2xl font-archivo font-bold tracking-[0.1em] text-[var(--theme-accent)] mb-2 uppercase">Shipping Details</h2>
                  <p className="text-[12px] text-[rgba(var(--theme-text-rgb),0.5)] uppercase tracking-[0.1em] font-plex-mono">Enter your delivery address</p>
                </div>

                <form className="space-y-6" onSubmit={(e) => { 
                  e.preventDefault(); 
                  const currentErrors = validateForm();
                  if (Object.keys(currentErrors).length > 0) {
                    const allTouched = Object.keys(shippingData).reduce((acc, key) => ({...acc, [key]: true}), {});
                    setTouched(allTouched);
                    return;
                  }
                  setStep(3); 
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-2">First Name</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={shippingData.firstName} 
                        onChange={handleChange}
                        onBlur={() => handleBlur('firstName')}
                        className={`w-full bg-[rgba(var(--theme-text-rgb),0.02)] border ${touched.firstName && errors.firstName ? 'border-red-500' : 'border-[rgba(var(--theme-text-rgb),0.1)]'} text-[var(--theme-text)] px-4 py-3 text-sm focus:border-[var(--theme-accent)] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-2">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={shippingData.lastName} 
                        onChange={handleChange} 
                        onBlur={() => handleBlur('lastName')}
                        className={`w-full bg-[rgba(var(--theme-text-rgb),0.02)] border ${touched.lastName && errors.lastName ? 'border-red-500' : 'border-[rgba(var(--theme-text-rgb),0.1)]'} text-[var(--theme-text)] px-4 py-3 text-sm focus:border-[var(--theme-accent)] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.lastName && errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-2">Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={shippingData.email} 
                        onChange={handleChange} 
                        onBlur={() => handleBlur('email')}
                        className={`w-full bg-[rgba(var(--theme-text-rgb),0.02)] border ${touched.email && errors.email ? 'border-red-500' : 'border-[rgba(var(--theme-text-rgb),0.1)]'} text-[var(--theme-text)] px-4 py-3 text-sm focus:border-[var(--theme-accent)] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.email && errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-2">Phone Number</label>
                      <div className="relative">
                        <input 
                          type="tel" 
                          name="phone" 
                          placeholder="e.g. +919876543210 or 9876543210"
                          value={shippingData.phone} 
                          onChange={handleChange} 
                          onBlur={() => handleBlur('phone')}
                          maxLength={13}
                          className={`w-full bg-[rgba(var(--theme-text-rgb),0.02)] border ${touched.phone && errors.phone ? 'border-red-500' : 'border-[rgba(var(--theme-text-rgb),0.1)]'} text-[var(--theme-text)] px-4 py-3 text-sm focus:border-[var(--theme-accent)] outline-none transition-colors rounded-sm`} 
                        />
                      </div>
                      
                      {/* Real-time Phone Number Verification Checklist */}
                      {shippingData.phone && (
                        <div className="mt-2.5 p-3 rounded-md bg-[rgba(var(--theme-text-rgb),0.02)] border border-[rgba(var(--theme-text-rgb),0.05)] space-y-2">
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-plex-mono">
                            {(() => {
                              const startsWithPlus91 = shippingData.phone.startsWith('+91');
                              const mainNumber = startsWithPlus91 ? shippingData.phone.slice(3) : shippingData.phone;
                              const isLeadingZero = shippingData.phone.startsWith('0') || mainNumber.startsWith('0');
                              return (
                                <>
                                  <span className={isLeadingZero ? "text-red-500 font-bold" : "text-emerald-500"}>
                                    {isLeadingZero ? "✗" : "✓"}
                                  </span>
                                  <span className={isLeadingZero ? "text-red-500 font-bold" : "text-[rgba(var(--theme-text-rgb),0.6)]"}>
                                    No leading zero
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-plex-mono">
                            {(() => {
                              const startsWithPlus91 = shippingData.phone.startsWith('+91');
                              const targetLength = startsWithPlus91 ? 13 : 10;
                              const currentLength = shippingData.phone.length;
                              const isLengthOk = currentLength === targetLength;
                              const lengthLabel = startsWithPlus91 
                                ? `10 digits after +91 (${Math.max(0, currentLength - 3)}/10)` 
                                : `Exactly 10 digits (${currentLength}/10)`;
                              
                              return (
                                <>
                                  <span className={isLengthOk ? "text-emerald-500" : "text-[rgba(var(--theme-text-rgb),0.4)]"}>
                                    {isLengthOk ? "✓" : "○"}
                                  </span>
                                  <span className={isLengthOk ? "text-[rgba(var(--theme-text-rgb),0.6)]" : "text-[rgba(var(--theme-text-rgb),0.45)]"}>
                                    {lengthLabel}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {touched.phone && errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-2">Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={shippingData.address} 
                      onChange={handleChange} 
                      onBlur={() => handleBlur('address')}
                      className={`w-full bg-[rgba(var(--theme-text-rgb),0.02)] border ${touched.address && errors.address ? 'border-red-500' : 'border-[rgba(var(--theme-text-rgb),0.1)]'} text-[var(--theme-text)] px-4 py-3 text-sm focus:border-[var(--theme-accent)] outline-none transition-colors rounded-sm`} 
                    />
                    {touched.address && errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-2">City</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={shippingData.city} 
                        onChange={handleChange} 
                        onBlur={() => handleBlur('city')}
                        className={`w-full bg-[rgba(var(--theme-text-rgb),0.02)] border ${touched.city && errors.city ? 'border-red-500' : 'border-[rgba(var(--theme-text-rgb),0.1)]'} text-[var(--theme-text)] px-4 py-3 text-sm focus:border-[var(--theme-accent)] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.city && errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-2">Postal Code</label>
                      <input 
                        type="text" 
                        name="postalCode" 
                        value={shippingData.postalCode} 
                        onChange={handleChange} 
                        onBlur={() => handleBlur('postalCode')}
                        className={`w-full bg-[rgba(var(--theme-text-rgb),0.02)] border ${touched.postalCode && errors.postalCode ? 'border-red-500' : 'border-[rgba(var(--theme-text-rgb),0.1)]'} text-[var(--theme-text)] px-4 py-3 text-sm focus:border-[var(--theme-accent)] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.postalCode && errors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={!isFormValid}
                    className={`w-full py-4 mt-8 flex justify-center items-center gap-2 rounded-sm group transition-colors ${
                      isFormValid 
                        ? 'bg-[var(--theme-accent)] hover:brightness-90 text-[var(--theme-bg)] cursor-pointer' 
                        : 'bg-[rgba(var(--theme-text-rgb),0.05)] text-[rgba(var(--theme-text-rgb),0.3)] border border-[rgba(var(--theme-text-rgb),0.1)] cursor-not-allowed'
                    }`}
                  >
                    <span className="text-[12px] uppercase font-bold tracking-[0.2em]">Continue to Payment</span>
                    <ArrowRight size={18} className={isFormValid ? 'group-hover:translate-x-1 transition-transform' : ''} />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-archivo font-bold tracking-[0.1em] text-[var(--theme-accent)] mb-2 uppercase">Secure Checkout</h2>
                  <p className="text-[12px] text-[rgba(var(--theme-text-rgb),0.5)] uppercase tracking-[0.1em] font-plex-mono">Choose Your Payment Method</p>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <div className="space-y-4 mb-10">
                    {paymentMethods.map(method => (
                      <div 
                        key={method.id} 
                        className={`border rounded-sm transition-all duration-300 overflow-hidden cursor-pointer ${selectedMethod === method.id ? 'border-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.05)]' : 'border-[rgba(var(--theme-text-rgb),0.2)] hover:border-[rgba(var(--theme-text-rgb),0.5)] bg-[rgba(var(--theme-text-rgb),0.02)]'}`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center ${selectedMethod === method.id ? 'border-[var(--theme-accent)]' : 'border-[rgba(var(--theme-text-rgb),0.4)]'}`}>
                              {selectedMethod === method.id && <div className="w-2.5 h-2.5 bg-[var(--theme-accent)] rounded-full" />}
                            </div>
                            <div className="flex items-center gap-3">
                              {method.icon}
                              <span className="text-[12px] sm:text-[14px] uppercase tracking-[0.1em] font-plex-mono text-[var(--theme-text)]">{method.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pl-8 sm:pl-0">
                            {method.recommended && (
                              <span className="text-[9px] uppercase tracking-wider font-bold bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] px-2 py-1 rounded-sm border border-[rgba(var(--theme-accent-rgb),0.3)]">Recommended</span>
                            )}
                            {method.tag && !method.recommended && (
                              <span className="text-[9px] uppercase tracking-wider font-mono text-[rgba(var(--theme-text-rgb),0.5)]">{method.tag}</span>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedMethod === method.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-5 pb-5 pt-0 overflow-hidden"
                            >
                              <div className="pt-4 border-t border-[rgba(var(--theme-text-rgb),0.1)]">
                                {method.id === 'RAZORPAY' && (
                                  <div className="space-y-4">
                                    <p className="text-[12px] font-mono text-[rgba(var(--theme-text-rgb),0.7)]">
                                      Pay securely via Cards, UPI, Netbanking, or Wallets using Razorpay.
                                    </p>
                                  </div>
                                )}

                                {method.id === 'COD' && (
                                  <p className="text-[12px] font-mono text-[rgba(var(--theme-text-rgb),0.7)]">
                                    A {formatVal(COD_HANDLING_FEE)} handling charge applies to Cash on Delivery orders.
                                    Pay {formatVal(subtotal + shipping + COD_HANDLING_FEE - discountAmount)} with cash or UPI at the time of delivery.
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="submit" 
                    disabled={!selectedMethod || isProcessing}
                    className={`w-full py-4 mt-4 flex justify-center items-center gap-2 rounded-sm group transition-all duration-300 ${
                      selectedMethod && !isProcessing
                        ? 'bg-[var(--theme-accent)] hover:brightness-90 text-[var(--theme-bg)] shadow-[0_4px_20px_-5px_rgba(var(--theme-accent-rgb),0.4)]' 
                        : 'bg-[rgba(var(--theme-text-rgb),0.05)] text-[rgba(var(--theme-text-rgb),0.3)] cursor-not-allowed border border-[rgba(var(--theme-text-rgb),0.1)]'
                    }`}
                  >
                    <Lock size={16} className={selectedMethod ? '' : 'opacity-50'} />
                    <span className="text-[12px] uppercase font-bold tracking-[0.2em]">
                      {isProcessing ? 'Processing...' : selectedMethod === 'COD' ? 'Place Order' : 'Pay Now'}
                    </span>
                  </button>
                </form>

                <div className="mt-12 flex items-center justify-center gap-8 py-6 border-t border-[rgba(var(--theme-text-rgb),0.1)]">
                  <div className="flex items-center gap-2 text-[rgba(var(--theme-text-rgb),0.4)]">
                    <ShieldCheck size={18} />
                    <span className="text-[9px] uppercase tracking-[0.1em]">100% Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-[rgba(var(--theme-text-rgb),0.4)]">
                    <Lock size={18} />
                    <span className="text-[9px] uppercase tracking-[0.1em]">Encrypted Checkout</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && completedOrder && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                {/* Receipt printer + download button side-by-side */}
                <div className="flex items-start gap-6 justify-center w-full">
                  <ReceiptPrinter.Root stage={receiptStage}>
                    <ReceiptPrinter.Machine>
                      <ReceiptPrinter.Header>
                        <span className="text-[10px] font-plex-mono tracking-[0.2em] uppercase text-grayscale-8 dark:text-grayscale-11 flex items-center gap-1.5">
                          ZEVRAE
                        </span>
                        <button
                          onClick={() => {
                            receiptTimers.current.forEach(clearTimeout);
                            navigate('/');
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-plex-mono tracking-[0.15em] uppercase rounded-md border border-grayscale-12 dark:border-grayscale-1 px-2.5 py-1.5 text-grayscale-8 dark:text-grayscale-11 hover:text-grayscale-12 dark:hover:text-grayscale-1 transition-colors"
                        >
                          <Home size={13} />
                          Home
                        </button>
                      </ReceiptPrinter.Header>

                      <ReceiptPrinter.Screen>
                        <div className="space-y-4 text-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-white">Order #{completedOrder.id.slice(-8).toUpperCase()}</p>
                              <p className="text-[10px] text-white/70 mt-0.5">{completedPaymentMethod}</p>
                            </div>
                            <strong className="text-sm tabular-nums text-white">₹{completedOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </div>
                          <ReceiptPrinter.Status />
                        </div>
                      </ReceiptPrinter.Screen>
                    </ReceiptPrinter.Machine>

                    <ReceiptPrinter.Output>
                      <ReceiptPrinter.Paper>
                        {/* All paper text is forced black for legibility */}
                        {/* Receipt header */}
                        <div className="text-center mb-4 text-black">
                          <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-black">ZEVRAE</h2>
                          <p className="text-[9px] tracking-wider text-black/50 mt-1">LUXURY APPAREL</p>
                        </div>

                        <hr className="border-dashed border-black/20 my-3" />

                        {/* Order ID */}
                        <div className="flex justify-between text-[10px] mb-3 text-black">
                          <span className="text-black/50">ORDER</span>
                          <span className="font-bold text-black">#{completedOrder.id.slice(-8).toUpperCase()}</span>
                        </div>

                        <hr className="border-dashed border-black/20 my-3" />

                        {/* Customer Details */}
                        {(() => {
                          const customerName = typeof completedOrder.user === 'object' && completedOrder.user !== null
                            ? completedOrder.user.name || ''
                            : '';
                          const customerPhone = completedOrder.shipping_address?.phone || '';
                          const addrParts = [
                            completedOrder.shipping_address?.line1,
                            completedOrder.shipping_address?.line2,
                            completedOrder.shipping_address?.city,
                            completedOrder.shipping_address?.state,
                            completedOrder.shipping_address?.postal_code,
                            completedOrder.shipping_address?.country,
                          ].filter(Boolean).join(', ');
                          const hasAnyField = customerName || customerPhone || addrParts;
                          if (!hasAnyField) return null;
                          return (
                            <>
                              <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-black/50 mb-2">Customer Details</p>
                              <div className="space-y-1 text-[10px] text-black">
                                {customerName && (
                                  <div className="flex gap-2">
                                    <span className="text-black/50 shrink-0">NAME</span>
                                    <span className="text-black/20 shrink-0">:</span>
                                    <span className="text-black leading-snug">{customerName}</span>
                                  </div>
                                )}
                                {customerPhone && (
                                  <div className="flex gap-2">
                                    <span className="text-black/50 shrink-0">PHONE</span>
                                    <span className="text-black/20 shrink-0">:</span>
                                    <span className="text-black">{customerPhone}</span>
                                  </div>
                                )}
                                {addrParts && (
                                  <div className="flex gap-2">
                                    <span className="text-black/50 shrink-0">ADDR</span>
                                    <span className="text-black/20 shrink-0">:</span>
                                    <span className="text-black leading-snug break-words">{addrParts}</span>
                                  </div>
                                )}
                              </div>
                              <hr className="border-dashed border-black/20 my-3" />
                            </>
                          );
                        })()}

                        {/* Items */}
                        <div className="space-y-2 mb-3">
                          {completedOrder.items.map((item, idx) => (
                            <div key={idx} className="text-[10px]">
                              <div className="flex justify-between">
                                <span className="flex-1 pr-2 uppercase leading-snug text-black">{item.name}</span>
                                <span className="tabular-nums whitespace-nowrap text-black">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              </div>
                              <div className="text-[9px] mt-0.5 text-black/50">
                                {item.quantity} × ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {item.size ? ` · Size ${formatSoftToySize(item.size)}` : ''}
                              </div>
                            </div>
                          ))}
                        </div>

                        <hr className="border-dashed border-black/20 my-3" />

                        {/* Totals */}
                        <dl className="space-y-1.5 text-[10px] text-black">
                          <div className="flex justify-between">
                            <dt className="text-black/50">SUBTOTAL</dt>
                            <dd className="tabular-nums text-black">₹{completedOrder.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-black/50">SHIPPING</dt>
                            <dd className="tabular-nums text-black">{completedOrder.shipping_fee === 0 ? 'FREE' : `₹${completedOrder.shipping_fee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</dd>
                          </div>
                          {completedOrder.handling_fee > 0 && (
                            <div className="flex justify-between">
                              <dt className="text-black/50">HANDLING (COD)</dt>
                              <dd className="tabular-nums text-black">₹{completedOrder.handling_fee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                          )}
                          {completedOrder.discount_code && completedOrder.discount_amount > 0 && (
                            <div className="flex justify-between">
                              <dt className="text-black/50">DISCOUNT ({completedOrder.discount_code})</dt>
                              <dd className="tabular-nums text-black">−₹{completedOrder.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                            </div>
                          )}
                        </dl>

                        <hr className="border-black/40 my-3" />

                        {/* Grand total */}
                        <div className="flex justify-between text-xs font-bold text-black">
                          <span>TOTAL</span>
                          <span className="tabular-nums">₹{completedOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>

                        <hr className="border-dashed border-black/20 my-3" />

                        {/* Payment method */}
                        <div className="flex justify-between text-[10px] mb-4 text-black">
                          <span className="text-black/50">PAYMENT</span>
                          <span className="font-bold text-black">{completedPaymentMethod}</span>
                        </div>

                        {/* Footer */}
                        <div className="text-center mt-4">
                          <p className="text-[10px] text-black/50">Thank you for shopping with ZEVRAE</p>
                          <p className="text-[9px] text-black/30 mt-1">{new Date(completedOrder.created_at).toLocaleString('en-IN')}</p>
                        </div>
                      </ReceiptPrinter.Paper>
                    </ReceiptPrinter.Output>
                  </ReceiptPrinter.Root>

                  {/* Download button — shown beside the printer once receipt is complete */}
                  {receiptStage === 'complete' && (
                    <motion.button
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      onClick={downloadReceipt}
                      title="Download receipt"
                      className="mt-2 flex flex-col items-center gap-2 px-4 py-5 rounded-lg border border-[rgba(var(--theme-accent-rgb),0.35)] text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.08)] hover:border-[var(--theme-accent)] transition-all duration-300 group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-0.5 transition-transform duration-200">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      <span className="text-[9px] uppercase tracking-[0.15em] font-plex-mono writing-mode-vertical" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Download</span>
                    </motion.button>
                  )}
                </div>

                <button
                  onClick={() => {
                    receiptTimers.current.forEach(clearTimeout);
                    navigate('/');
                  }}
                  className="mt-8 bg-[rgba(var(--theme-text-rgb),0.02)] border border-[rgba(var(--theme-accent-rgb),0.3)] hover:border-[var(--theme-accent)] text-[var(--theme-text)] px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-plex-mono transition-all duration-300"
                >
                  Continue Browsing
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Order Summary */}
        {step !== 4 && (
          <div className="lg:col-span-5">
            <div className="bg-[rgba(var(--theme-text-rgb),0.02)] border border-[rgba(var(--theme-accent-rgb),0.2)] p-8 rounded-sm sticky top-32">
              <h3 className="text-[13px] uppercase tracking-[0.3em] font-plex-mono text-[var(--theme-accent)] mb-8">Order Summary</h3>
              
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                    <div className="w-16 h-20 bg-[var(--theme-bg)] rounded-sm overflow-hidden border border-[rgba(var(--theme-text-rgb),0.05)] relative flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute top-0 right-0 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-[12px] uppercase font-plex-mono tracking-[0.1em] text-[var(--theme-text)] mb-1 line-clamp-1">{item.name}</h4>
                      <div className="text-[10px] uppercase font-mono text-[rgba(var(--theme-text-rgb),0.5)] mb-1">
                        Size: {isSoftToy(item.category) ? formatSoftToySize(item.size, true) : item.size}
                      </div>
                      <div className="text-[12px] font-mono text-[var(--theme-text)]">{formatVal(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                {appliedDiscount ? (
                  <div className="flex items-center justify-between bg-[rgba(var(--theme-accent-rgb),0.1)] border border-[rgba(var(--theme-accent-rgb),0.3)] rounded-sm px-4 py-3">
                    <div className="flex items-center gap-2 text-[11px] font-plex-mono text-[var(--theme-accent)]">
                      <Tag size={13} />
                      <span className="tracking-wider">{appliedDiscount.code} applied</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-text)] transition-colors">
                      <XIcon size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => { setCouponInput(e.target.value.toUpperCase()); if (couponStatus === 'error') setCouponStatus('idle'); }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                        placeholder="Coupon code"
                        className="flex-1 bg-[var(--theme-bg)] border border-[rgba(var(--theme-text-rgb),0.15)] px-4 py-2.5 text-[11px] font-plex-mono tracking-wider text-[var(--theme-text)] placeholder:text-[rgba(var(--theme-text-rgb),0.3)] focus:border-[var(--theme-accent)]/50 focus:outline-none rounded-sm"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim() || couponStatus === 'checking'}
                        className="px-5 py-2.5 border border-[rgba(var(--theme-accent-rgb),0.4)] text-[var(--theme-accent)] text-[10px] uppercase tracking-[0.15em] font-plex-mono rounded-sm hover:bg-[rgba(var(--theme-accent-rgb),0.1)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {couponStatus === 'checking' ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponStatus === 'error' && (
                      <p className="text-[10px] text-red-400 font-sans mt-2">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 border-t border-[rgba(var(--theme-text-rgb),0.1)] pt-6">
                <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">
                  <span>Subtotal</span>
                  <span className="font-mono text-[var(--theme-text)]">{formatVal(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">
                  <span>Shipping</span>
                  <span className="font-mono text-[var(--theme-text)]">{shipping === 0 ? 'Free' : formatVal(shipping)}</span>
                </div>
                {handlingFee > 0 && (
                  <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">
                    <span>Handling Charge (COD)</span>
                    <span className="font-mono text-[var(--theme-text)]">{formatVal(handlingFee)}</span>
                  </div>
                )}
                {appliedDiscount && (
                  <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-plex-mono text-[var(--theme-accent)]">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span className="font-mono">−{formatVal(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[14px] uppercase tracking-[0.2em] font-plex-mono text-[var(--theme-accent)] pt-4 border-t border-[rgba(var(--theme-accent-rgb),0.2)] mt-4">
                  <span>Total</span>
                  <span className="font-mono">{formatVal(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}