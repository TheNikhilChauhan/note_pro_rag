"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-gray-900 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          AI Mind
        </Link>

        {/* Auth */}
        <div>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
        {/* <UserButton /> */}
      </div>
    </header>
  );
}
