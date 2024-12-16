"use client";

import React from 'react';
import { Scanner } from '@/components/Scanner';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Document Scanner
        </h1>
        <div className="bg-white rounded-lg shadow-xl p-6">
          <Scanner />
        </div>
      </div>
    </main>
  );
}
