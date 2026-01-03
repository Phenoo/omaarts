'use client';


const SOCIALS = [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Twitter / X", href: "https://twitter.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "TikTok", href: "https://tiktok.com" },
    { label: "WhatsApp", href: "https://whatsapp.com" },
    { label: "Email", href: "mailto:hello@artsbyoma.com" },
];

export default function Footer() {
    return (
      <footer className="w-full py-16 bg-[#121212] text-[#E0E0E0] border-t border-[#333]">
        <div className="max-w-[90vw] mx-auto flex flex-col gap-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                  <h4 className="font-serif text-3xl mb-2 text-[var(--accent-primary)] [text-shadow:0_0_10px_rgba(0,229,255,0.3)]">Arts by Oma</h4>
                  <p className="font-sans text-sm text-gray-400 max-w-sm">
                      Vibrant narratives from the heart of Awka.
                  </p>
              </div>
              
              <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs uppercase tracking-widest">
                  {SOCIALS.map((social, i) => (
                      <a 
                          key={i} 
                          href={social.href} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--accent-secondary)] transition-colors hover:[text-shadow:0_0_10px_var(--accent-secondary)]"
                      >
                          {social.label}
                      </a>
                  ))}
              </div>
          </div>
  
          <div className="flex flex-col md:flex-row justify-between items-end border-t border-[#333] pt-8 gap-4">
              <span className="font-mono text-[10px] text-gray-500">© {new Date().getFullYear()} ARTS BY OMA. ALL RIGHTS RESERVED.</span>
              <span className="font-mono text-[10px] text-gray-500">
                  DESIGNED BY EZE
              </span>
          </div>
  
        </div>
      </footer>
    );
  }
