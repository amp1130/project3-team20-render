// app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf9f5] relative overflow-hidden">
      {/* Background logo grid */}
      <div className="absolute inset-0 z-0 opacity-10">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${Math.floor(i / 4) * 25}%`,
              left: `${(i % 4) * 25}%`,
              width: '25%',
              height: '25%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div className="relative w-24 h-24">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center gap-12">
        <h1 className="text-4xl font-bold text-[#b79c85]">BobaBoba</h1>
        <div className="flex flex-col sm:flex-row gap-6">
          <Link href="/menu-board">
            <button className="px-8 py-4 bg-[#b79c85] text-white text-xl font-semibold rounded-xl shadow hover:bg-[#8c6540] transition">
              Menu Board
            </button>
          </Link>
          <Link href="/customers">
            <button className="px-8 py-4 bg-[#b79c85] text-white text-xl font-semibold rounded-xl shadow hover:bg-[#8c6540] transition">
              Customers
            </button>
          </Link>
          <Link href="/Order">
            <button className="px-8 py-4 bg-[#b79c85] text-white text-xl font-semibold rounded-xl shadow hover:bg-[#8c6540] transition">
              Employees
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

