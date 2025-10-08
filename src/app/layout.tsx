import Header from "@/components/Layout/Header";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "@/components/Layout/Footer";

export const metadata = {
  title: "AI Mind",
  description: "Chat with your documents, websites, and Youtube videos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider signInFallbackRedirectUrl={"/"}>
      <html lang="en">
        <body className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 max-w-6xl mx-auto w-full p-6">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
