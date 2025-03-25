// components/Footer.tsx

export default function Footer() {
    return (
      <footer className="mt-20 px-4 py-6 border-t text-sm text-gray-600 font-light">
        <div className="max-w-screen-md mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
          <span className="tracking-wide">BSML Model Checker</span>
          <div className="space-x-4">
            <a
              href="https://github.com/CalebChen768/BSML-checker-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-black transition-colors"
            >
              Frontend Repo
            </a>
            <a
              href="https://github.com/Zero3River/BSMLMC"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-black transition-colors"
            >
              Backend Repo
            </a>
          </div>
        </div>
      </footer>
    )
  }