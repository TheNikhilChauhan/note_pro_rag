export default function Footer() {
  return (
    <footer>
      <div>
        <p>@copy; {new Date().getFullYear()} AI Mind. All rights reserved.</p>
        <p>Built using Next.js, Qdrant and OpenAI</p>
      </div>
    </footer>
  );
}
