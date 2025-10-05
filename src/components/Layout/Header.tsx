"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header>
      <div>
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          AI Mind
        </Link>

        {/* Navigation */}
        <nav>
          <Link href="/upload">Upload</Link>
          <Link href="/crawl">Crawl Website</Link>
          <Link href="/youtube">Youtube</Link>
          <Link href="/chat">Chat</Link>
        </nav>

        {/* Auth */}
        {/* <UserButton /> */}
      </div>
    </header>
  );
}
