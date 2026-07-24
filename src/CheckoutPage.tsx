import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { useAuth } from './hooks/UseAuth';
import { cartApi } from './api/cart';
import { ordersApi } from './api/orders';
import { paymentsApi } from './api/payments';
import { ChevronLeft, ShieldCheck, Lock, Truck, CreditCard, Wallet, ArrowRight, CheckCircle2, Smartphone } from 'lucide-react';

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

    if (!shippingData.phone) errors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(shippingData.phone)) errors.phone = 'Exactly 10 digits required';

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
  const shipping = subtotal > 1000 ? 0 : 19; // 19 INR shipping, free over 1000
  const grandTotal = subtotal + shipping;

  const buildShippingAddress = () => ({
    line1: shippingData.address,
    city: shippingData.city,
    postal_code: shippingData.postalCode,
    country: 'India',
  });

  // The backend's POST /orders reads from the user's server-side cart, not
  // from the request body, so the client-side cart has to be pushed up
  // before checkout can create an order.
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
        // Order (and its Razorpay counterpart) is created server-side, from
        // the cart we just synced — the client never dictates the amount.
        const orderRes = await ordersApi.create({
          shipping_address: buildShippingAddress(),
          payment_method: 'online',
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
          order_id: orderRes.payment.order_id,
          handler: async function (response: any) {
            try {
              // Signature is verified server-side — the client can never
              // mark an order as paid on its own.
              await paymentsApi.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              clearCart();
              setStep(4);
              setTimeout(() => {
                navigate("/");
              }, 2000);
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
            color: "#C5A059"
          }
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
        await ordersApi.create({
          shipping_address: buildShippingAddress(),
          payment_method: 'cod',
        });

        clearCart();
        setStep(4);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err: any) {
        alert('Order failed: ' + (err?.response?.data?.message || err.message));
        setIsProcessing(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
  };

  const paymentMethods = [
    {
      id: "RAZORPAY",
      name: "Pay Online",
      options: ["UPI", "Cards", "Netbanking", "Wallets"],
      recommended: true,
      tag: "Fast & Secure",
      icon: <Smartphone size={20} className="text-[#EAE6E1]" />
    },
    {
      id: "COD",
      name: "Cash on Delivery",
      tag: "Pay at Doorstep",
      icon: <Truck size={20} className="text-[#EAE6E1]" />
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#12100C] flex items-center justify-center">
        <div className="text-[#C5A059] animate-pulse">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#12100C] text-[#EAE6E1] font-sans selection:bg-[#C5A059]/30 pt-[100px] pb-24 relative z-10">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto px-6 mb-12 flex items-center justify-between">
        <button 
          onClick={() => step > 2 ? setStep((prev) => (prev - 1) as 2 | 3 | 4) : navigate('/')}
          className="flex items-center text-[10px] uppercase font-plex-mono tracking-[0.2em] text-[#EAE6E1]/50 hover:text-[#C5A059] transition-colors"
        >
          <ChevronLeft size={16} className="mr-2" />
          {step === 4 ? "Back to Home" : "Back"}
        </button>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {step !== 4 && (
        <div className="max-w-[800px] mx-auto mb-16 px-6 relative">
          <div className="flex justify-between items-center relative z-10">
            <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-[#C5A059]' : 'text-[#EAE6E1]/30'}`}>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-[#C5A059]' : 'bg-[#EAE6E1]/30'}`} />
              <span className="text-[10px] uppercase font-plex-mono tracking-[0.2em]">Shipping</span>
            </div>
            <div className={`flex flex-col items-center gap-2 ${step >= 3 ? 'text-[#C5A059]' : 'text-[#EAE6E1]/30'}`}>
              <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-[#C5A059]' : 'bg-[#EAE6E1]/30'}`} />
              <span className="text-[10px] uppercase font-plex-mono tracking-[0.2em]">Payment</span>
            </div>
            <div className={`flex flex-col items-center gap-2 ${step >= 4 ? 'text-[#C5A059]' : 'text-[#EAE6E1]/30'}`}>
              <div className={`w-3 h-3 rounded-full ${step >= 4 ? 'bg-[#C5A059]' : 'bg-[#EAE6E1]/30'}`} />
              <span className="text-[10px] uppercase font-plex-mono tracking-[0.2em]">Confirm</span>
            </div>
          </div>
          <div className="absolute top-1.5 left-[10%] right-[10%] h-[1px] bg-[#EAE6E1]/10 -z-0">
            <motion.div 
              className="h-full bg-[#C5A059]"
              initial={{ width: '0%' }}
              animate={{ width: step === 2 ? '0%' : step === 3 ? '50%' : '100%' }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        
        {/* Left Column: Form/Steps */}
        <div className="lg:col-span-7">
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
                  <h2 className="text-2xl font-archivo font-bold tracking-[0.1em] text-[#C5A059] mb-2 uppercase">Shipping Details</h2>
                  <p className="text-[12px] text-[#EAE6E1]/50 uppercase tracking-[0.1em] font-plex-mono">Enter your delivery address</p>
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
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[#EAE6E1]/70 mb-2">First Name</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={shippingData.firstName} 
                        onChange={handleChange}
                        onBlur={() => handleBlur('firstName')}
                        className={`w-full bg-[#111] border ${touched.firstName && errors.firstName ? 'border-red-500' : 'border-[#EAE6E1]/10'} text-[#EAE6E1] px-4 py-3 text-sm focus:border-[#C5A059] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[#EAE6E1]/70 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={shippingData.lastName} 
                        onChange={handleChange} 
                        onBlur={() => handleBlur('lastName')}
                        className={`w-full bg-[#111] border ${touched.lastName && errors.lastName ? 'border-red-500' : 'border-[#EAE6E1]/10'} text-[#EAE6E1] px-4 py-3 text-sm focus:border-[#C5A059] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.lastName && errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[#EAE6E1]/70 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={shippingData.email} 
                        onChange={handleChange} 
                        onBlur={() => handleBlur('email')}
                        className={`w-full bg-[#111] border ${touched.email && errors.email ? 'border-red-500' : 'border-[#EAE6E1]/10'} text-[#EAE6E1] px-4 py-3 text-sm focus:border-[#C5A059] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.email && errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[#EAE6E1]/70 mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={shippingData.phone} 
                        onChange={handleChange} 
                        onBlur={() => handleBlur('phone')}
                        className={`w-full bg-[#111] border ${touched.phone && errors.phone ? 'border-red-500' : 'border-[#EAE6E1]/10'} text-[#EAE6E1] px-4 py-3 text-sm focus:border-[#C5A059] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.phone && errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[#EAE6E1]/70 mb-2">Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={shippingData.address} 
                      onChange={handleChange} 
                      onBlur={() => handleBlur('address')}
                      className={`w-full bg-[#111] border ${touched.address && errors.address ? 'border-red-500' : 'border-[#EAE6E1]/10'} text-[#EAE6E1] px-4 py-3 text-sm focus:border-[#C5A059] outline-none transition-colors rounded-sm`} 
                    />
                    {touched.address && errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[#EAE6E1]/70 mb-2">City</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={shippingData.city} 
                        onChange={handleChange} 
                        onBlur={() => handleBlur('city')}
                        className={`w-full bg-[#111] border ${touched.city && errors.city ? 'border-red-500' : 'border-[#EAE6E1]/10'} text-[#EAE6E1] px-4 py-3 text-sm focus:border-[#C5A059] outline-none transition-colors rounded-sm`} 
                      />
                      {touched.city && errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] font-plex-mono text-[#EAE6E1]/70 mb-2">Postal Code</label>
                      <input 
                        type="text" 
                        name="postalCode" 
                        value={shippingData.postalCode} 
                        onChange={handleChange} 
                        onBlur={() => handleBlur('postalCode')}
                        className={`w-full bg-[#111] border ${touched.postalCode && errors.postalCode ? 'border-red-500' : 'border-[#EAE6E1]/10'} text-[#EAE6E1] px-4 py-3 text-sm focus:border-[#C5A059] outline-none transition-colors rounded-sm`} 
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
                        ? 'bg-[#C5A059] hover:bg-[#b08d4b] text-black cursor-pointer' 
                        : 'bg-[#111] text-[#EAE6E1]/30 border border-[#EAE6E1]/10 cursor-not-allowed'
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
                  <h2 className="text-3xl font-archivo font-bold tracking-[0.1em] text-[#C5A059] mb-2 uppercase">Secure Checkout</h2>
                  <p className="text-[12px] text-[#EAE6E1]/50 uppercase tracking-[0.1em] font-plex-mono">Choose Your Payment Method</p>
                </div>

                <form onSubmit={handlePaymentSubmit}>
                  <div className="space-y-4 mb-10">
                    {paymentMethods.map(method => (
                      <div 
                        key={method.id} 
                        className={`border rounded-sm transition-all duration-300 overflow-hidden cursor-pointer ${selectedMethod === method.id ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-[#EAE6E1]/20 hover:border-[#EAE6E1]/50 bg-[#111]'}`}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className={`w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center ${selectedMethod === method.id ? 'border-[#C5A059]' : 'border-[#EAE6E1]/40'}`}>
                              {selectedMethod === method.id && <div className="w-2.5 h-2.5 bg-[#C5A059] rounded-full" />}
                            </div>
                            <div className="flex items-center gap-3">
                              {method.icon}
                              <span className="text-[12px] sm:text-[14px] uppercase tracking-[0.1em] font-plex-mono text-[#EAE6E1]">{method.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pl-8 sm:pl-0">
                            {method.recommended && (
                              <span className="text-[9px] uppercase tracking-wider font-bold bg-[#C5A059]/20 text-[#C5A059] px-2 py-1 rounded-sm border border-[#C5A059]/30">Recommended</span>
                            )}
                            {method.tag && !method.recommended && (
                              <span className="text-[9px] uppercase tracking-wider font-mono text-[#EAE6E1]/50">{method.tag}</span>
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
                              <div className="pt-4 border-t border-[#EAE6E1]/10">
                                {method.id === 'RAZORPAY' && (
                                  <div className="space-y-4">
                                    <p className="text-[12px] font-mono text-[#EAE6E1]/70">
                                      Pay securely via Cards, UPI, Netbanking, or Wallets using Razorpay.
                                    </p>
                                  </div>
                                )}

                                {method.id === 'COD' && (
                                  <p className="text-[12px] font-mono text-[#EAE6E1]/70">
                                    Pay {formatVal(grandTotal)} with cash or UPI at the time of delivery.
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
                        ? 'bg-[#C5A059] hover:bg-[#b08d4b] text-[#12100C] shadow-[0_4px_20px_-5px_rgba(197,160,89,0.4)]' 
                        : 'bg-[#111] text-[#EAE6E1]/30 cursor-not-allowed border border-[#EAE6E1]/10'
                    }`}
                  >
                    <Lock size={16} className={selectedMethod ? '' : 'opacity-50'} />
                    <span className="text-[12px] uppercase font-bold tracking-[0.2em]">
                      {isProcessing ? 'Processing...' : selectedMethod === 'COD' ? 'Place Order' : 'Pay Now'}
                    </span>
                  </button>
                </form>

                <div className="mt-12 flex items-center justify-center gap-8 py-6 border-t border-[#EAE6E1]/10">
                  <div className="flex items-center gap-2 text-[#EAE6E1]/40">
                    <ShieldCheck size={18} />
                    <span className="text-[9px] uppercase tracking-[0.1em]">100% Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#EAE6E1]/40">
                    <Lock size={18} />
                    <span className="text-[9px] uppercase tracking-[0.1em]">Encrypted Checkout</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-20"
              >
                <div className="w-24 h-24 rounded-full border border-[#C5A059] flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-[#C5A059]/10 rounded-full animate-pulse" />
                  <CheckCircle2 size={40} className="text-[#C5A059]" />
                </div>
                <h2 className="text-3xl md:text-4xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] mb-4 uppercase">
                  Your Order Has Been Placed Successfully
                </h2>
                <p className="text-[14px] text-[#C5A059] uppercase tracking-[0.2em] font-plex-mono mb-12">
                  Thank you for shopping with ZEVRAE
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-[#111] border border-[#C5A059]/30 hover:border-[#C5A059] text-[#EAE6E1] px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-plex-mono transition-all duration-300"
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
            <div className="bg-[#111] border border-[#C5A059]/20 p-8 rounded-sm sticky top-32">
              <h3 className="text-[13px] uppercase tracking-[0.3em] font-plex-mono text-[#C5A059] mb-8">Order Summary</h3>
              
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                    <div className="w-16 h-20 bg-[#12100C] rounded-sm overflow-hidden border border-[#EAE6E1]/5 relative flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute top-0 right-0 bg-[#C5A059] text-black text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-[12px] uppercase font-plex-mono tracking-[0.1em] text-[#EAE6E1] mb-1 line-clamp-1">{item.name}</h4>
                      <div className="text-[10px] uppercase font-mono text-[#EAE6E1]/50 mb-1">Size: {item.size}</div>
                      <div className="text-[12px] font-mono text-[#EAE6E1]">{formatVal(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-[#EAE6E1]/10 pt-6">
                <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-plex-mono text-[#EAE6E1]/70">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#EAE6E1]">{formatVal(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] uppercase tracking-wider font-plex-mono text-[#EAE6E1]/70">
                  <span>Shipping</span>
                  <span className="font-mono text-[#EAE6E1]">{shipping === 0 ? 'Free' : formatVal(shipping)}</span>
                </div>
                <div className="flex justify-between items-center text-[14px] uppercase tracking-[0.2em] font-plex-mono text-[#C5A059] pt-4 border-t border-[#C5A059]/20 mt-4">
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