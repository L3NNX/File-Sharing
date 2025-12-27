import { Zap } from "lucide-react";
import { Link } from "react-router-dom";
export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-100 border-b border-white/10 bg-background backdrop-blur-md">
      <div className="max-w-6xl mx-auto py-4 md:py-6 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Zap className="w-4 h-4 text-white" />
          <span className="font-semibold mono tracking-wide text-sm uppercase">
            Flash
          </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
            <Link
            to="/about"
            className="text-sm text-foreground hover:text-white transition-colors"
          >
            About
          </Link>
               <Link
            to="/about"
            className="text-sm text-foreground hover:text-white transition-colors"
          >
            Contact
          </Link>
          
          <button className="h-8 px-4 bg-white text-black hover:bg-zinc-200 rounded-full text-sm font-medium">
            Try Pro
          </button>
        </div>
      </div>
    </nav>
  );
}
