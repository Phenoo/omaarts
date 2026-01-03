'use client';

export default function ContactPage() {
  return (
    <main className="pt-32 min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-[90vw] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
        
        {/* Left: Info */}
        <div className="flex flex-col justify-between h-full">
            <div>
                <h1 className="font-serif text-8xl md:text-9xl mb-12 text-[var(--accent-purple)] tracking-tighter leading-[0.8]">
                    LET&apos;S<br/>TALK
                </h1>
                <p className="font-sans text-xl opacity-80 max-w-md leading-relaxed">
                    Interested in a commission or just want to say hello? 
                    <br/><br/>
                    Oma is currently accepting projects for late 2026.
                </p>
            </div>
            
            <div className="mt-16 md:mt-0 space-y-8 font-mono text-sm tracking-widest uppercase">
                <div>
                    <span className="block opacity-50 mb-2">Email</span>
                    <a href="mailto:hello@omaachebe.com" className="hover:text-[var(--accent-orange)] transition-colors">hello@omaachebe.com</a>
                </div>
                <div>
                    <span className="block opacity-50 mb-2">Studio</span>
                    <p>Lagos, Nigeria</p>
                </div>
            </div>
        </div>

        {/* Right: Form */}
        <form className="flex flex-col gap-8 md:pt-12">
            <div className="group">
                <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2 group-focus-within:text-[var(--accent-purple)] transition-colors">Name</label>
                <input type="text" className="w-full bg-transparent border-b border-[#333] py-4 text-xl focus:outline-none focus:border-[var(--accent-purple)] transition-colors" placeholder="Your name" />
            </div>
            <div className="group">
                <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2 group-focus-within:text-[var(--accent-purple)] transition-colors">Email</label>
                <input type="email" className="w-full bg-transparent border-b border-[#333] py-4 text-xl focus:outline-none focus:border-[var(--accent-purple)] transition-colors" placeholder="email@address.com" />
            </div>
            <div className="group">
                <label className="block font-mono text-xs uppercase tracking-widest opacity-50 mb-2 group-focus-within:text-[var(--accent-purple)] transition-colors">Message</label>
                <textarea rows={4} className="w-full bg-transparent border-b border-[#333] py-4 text-xl focus:outline-none focus:border-[var(--accent-purple)] transition-colors resize-none" placeholder="Tell me about your project..." />
            </div>
            
            <button type="submit" className="self-start mt-8 px-12 py-4 bg-[var(--accent-purple)] text-white font-mono text-sm uppercase tracking-widest hover:bg-white hover:text-[var(--accent-purple)] transition-colors rounded-full">
                Send Message
            </button>
        </form>

      </div>
    </main>
  );
}
