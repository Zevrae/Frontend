'use client';

import React, { useState, useEffect } from 'react';
import { StorefrontHero } from '@/components/StorefrontHero';
import { CollectionScroller } from '@/components/CollectionScroller';
import { BestSellers } from '@/components/BestSellers';
import { TrustSection } from '@/components/TrustSection';
import ProductGrid from '@/ProductGrid';
import { useAuth } from '@/hooks/UseAuth';
import { LAUNCH_CONFIG, COUNTDOWN_START_TIMESTAMP } from '@/config/launch';

export function HomePageClient() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [isLiveMode, setIsLiveMode] = useState(() => {
    const now = Date.now();
    const start = COUNTDOWN_START_TIMESTAMP.getTime();
    const end = LAUNCH_CONFIG.brandLaunch.getTime();
    return isAdmin || now < start || now >= end;
  });

  useEffect(() => {
    if (isAdmin) setIsLiveMode(true);
  }, [isAdmin]);

  return (
    <>
      <StorefrontHero isLiveMode={isLiveMode} setIsLiveMode={setIsLiveMode} />
      {isLiveMode && (
        <>
          <CollectionScroller />
          <BestSellers />
          <TrustSection />
        </>
      )}
      <ProductGrid categoryFilter="all" />
    </>
  );
}
