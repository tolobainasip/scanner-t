"use client";

import React from 'react';
import { Scanner } from '@/components/Scanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">Document Scanner</h1>
        <div className="bg-white rounded-lg shadow-xl p-6">
          <Scanner />
        </div>
      </div>
    </main>
  );
}
