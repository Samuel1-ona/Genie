function getYear(): number {
  return new Date().getFullYear();
}

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950/50 mt-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="text-gray-400 text-sm">
            © {getYear()} Genie-Proposal-Summarizer
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-500">Docs (soon)</span>
            <span className="text-gray-500">Twitter (soon)</span>
            <a
              href="mailto:hello@genie.app"
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              Contact (hello@genie.app)
            </a>
          </div>
        </div>

        {/* Timezone note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            Time zone defaults to Africa/Lagos for deadlines in-app.
          </p>
        </div>
      </div>
    </footer>
  );
}
