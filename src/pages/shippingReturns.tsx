import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { shippingReturnPolicyHtml } from '../content/shippingReturnPolicy';
import './PolicyPage.css';

export default function ShippingReturns() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-container min-h-screen bg-[#0a0a0a] pt-32 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="policy-content"
        dangerouslySetInnerHTML={{ __html: shippingReturnPolicyHtml }}
      />
    </div>
  );
}
