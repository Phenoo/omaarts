'use client';

export default function VideoReel() {
  return (
    <section className="w-full bg-black relative overflow-hidden">
        <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-auto max-h-[80vh] object-cover opacity-80"
        >
            <source src="/portfolio.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="font-serif text-6xl md:text-9xl text-white mix-blend-overlay opacity-50 tracking-tighter text-center">
                SHOWREEL<br/>2026
            </h2>
        </div>
    </section>
  );
}
