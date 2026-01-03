'use client';


export default function Footer() {
  return (
    <footer className="w-full py-16 bg-[#121212] text-[#E0E0E0] border-t border-[#333]">
      <div className="max-w-[90vw] mx-auto flex flex-col gap-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
                <h4 className="font-serif text-3xl mb-2 text-[var(--accent-purple)]">Arts by Oma</h4>
                <p className="font-mono text-xs text-gray-400 max-w-sm">
                    Vibrant narratives from the heart of Lagos.
                </p>
            </div>
            
            <div className="flex gap-6 font-mono text-xs uppercase tracking-widest">
                <a href="#" className="hover:text-[var(--accent-purple)] transition-colors">Instagram</a>
                <a href="#" className="hover:text-[var(--accent-purple)] transition-colors">Twitter</a>
                <a href="#" className="hover:text-[var(--accent-purple)] transition-colors">Email</a>
            </div>
        </div>

        <div className="flex justify-between items-end border-t border-[#333] pt-8">
            <span className="font-mono text-[10px] text-gray-500">© 2026 ARTS BY OMA. ALL RIGHTS RESERVED.</span>
            <span className="font-mono text-[10px] text-gray-500">DESIGNED BY EZE</span>
        </div>

      </div>
    </footer>
  );
}
