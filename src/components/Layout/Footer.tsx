export default function Footer() {
  return (
    <footer className="bg-gray-800 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 text-white font-semibold text-sm">
        <p>&@copy; {new Date().getFullYear()} AI Mind. All rights reserved.</p>
        <p>Built using Next.js, Qdrant and OpenAI</p>
      </div>
    </footer>
  );
}
