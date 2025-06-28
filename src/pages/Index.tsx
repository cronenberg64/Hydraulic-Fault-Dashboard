
import { useState, useEffect } from 'react';
import { HydraulicDashboard } from '@/components/HydraulicDashboard';
import { Header } from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <HydraulicDashboard />
      </main>
    </div>
  );
};

export default Index;
