import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function ContactContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transmitStatus, setTransmitStatus] = useState<"IDLE" | "TRANSMITTING" | "DELIVERED">("IDLE");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Snap the elements in exactly like the Solutions grid
      gsap.fromTo(
        ".contact-item",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.5, // Wait for the 500ms parent window animation
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transmitStatus !== "IDLE") return;
    
    setTransmitStatus("TRANSMITTING");
    
    // Simulate a network request delay for the hardware feel
    setTimeout(() => {
      setTransmitStatus("DELIVERED");
      
      // Reset back to idle after a few seconds
      setTimeout(() => setTransmitStatus("IDLE"), 4000);
    }, 1500);
  };

    // Simulated latency for the system hash info
    const [latency, setLatency]  = useState(12); // Initial latency value in ms

useEffect(() => {
    const pingInterval = setInterval(() => {
        const baseLatency  = 10; // Base latency in ms
        const randomFactor = Math.random() * 20; // Random jitter between 0-20ms
        setLatency(Math.floor(baseLatency + randomFactor));
    }, 500);

    return () => clearInterval(pingInterval);
}, []);

  return (
    <div
      ref={containerRef}
      className="p-8 flex flex-col bg-[#010101] text-[#FFFCF5] w-[90vw] max-w-[750px] min-h-[500px]"
    >
      {/* Window Header */}
      <div className="contact-item mb-8 border-b border-[#FFFCF5]/20 pb-4">
        <h2 className="text-3xl font-sans font-semibold tracking-tight uppercase">
          Comm_Link
        </h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="w-2 h-2 rounded-full bg-[#e1ff00] animate-pulse"></span>
          <p className="font-mono text-sm text-[#e1ff00]">
            [ SECURE UPLINK ESTABLISHED ]
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-grow">
        
        {/* Left Column: Coordinates & Intel */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="contact-item">
              <div className="font-mono text-xs text-[#FFFCF5]/40 mb-1">TARGET //</div>
              <div className="text-lg font-sans">The Nuanced Studio</div>
            </div>
            
            <div className="contact-item">
              <div className="font-mono text-xs text-[#FFFCF5]/40 mb-1">DIRECTIVE //</div>
              <div className="text-sm text-[#FFFCF5]/60 font-sans leading-relaxed">
                Secure a partnership. Request a demo to visualize our capabilities. Built for complex conditions.
              </div>
            </div>

            <div className="contact-item">
              <div className="font-mono text-xs text-[#FFFCF5]/40 mb-1">NODE //</div>
              <a 
                href="mailto:hello@tns.com" 
                className="text-[#e1ff00] font-mono hover:underline decoration-[#e1ff00]/50 underline-offset-4 transition-all"
              >
                HELLO@TNS.COM
              </a>
            </div>
          </div>

          <div className="contact-item mt-8 md:mt-0 font-mono text-[10px] text-[#FFFCF5]/60 uppercase tracking-widest break-words">
            SYS_HASH: 0x8F92A1B <br />
            LATENCY: {latency !== null ? `${latency}ms` : "N/A"}
          </div>
        </div>

        {/* Right Column: The Transmission Form */}
        <div className="md:col-span-7 contact-item">
          <form onSubmit={handleTransmit} className="flex flex-col h-full space-y-6 bg-[#FFFCF5]/5 border border-[#FFFCF5]/10 p-6">
            
            {/* Standard Input */}
            <div className="flex flex-col relative group">
              <label className="font-mono text-[10px] text-[#FFFCF5]/50 mb-2 uppercase tracking-widest group-focus-within:text-[#e1ff00] transition-colors">
                Origin_ID (Name)
              </label>
              <input 
                type="text" 
                required
                className="bg-transparent border-b border-[#FFFCF5]/20 pb-2 text-sm font-sans focus:outline-none focus:border-[#e1ff00] transition-colors placeholder:text-[#FFFCF5]/20 rounded-none"
                placeholder="Enter designation..."
              />
            </div>

            {/* Standard Input */}
            <div className="flex flex-col relative group">
              <label className="font-mono text-[10px] text-[#FFFCF5]/50 mb-2 uppercase tracking-widest group-focus-within:text-[#e1ff00] transition-colors">
                Return_Vector (Email)
              </label>
              <input 
                type="email" 
                required
                className="bg-transparent border-b border-[#FFFCF5]/20 pb-2 text-sm font-sans focus:outline-none focus:border-[#e1ff00] transition-colors placeholder:text-[#FFFCF5]/20 rounded-none"
                placeholder="system@domain.com"
              />
            </div>

            {/* Textarea */}
            <div className="flex flex-col relative group flex-grow">
              <label className="font-mono text-[10px] text-[#FFFCF5]/50 mb-2 uppercase tracking-widest group-focus-within:text-[#e1ff00] transition-colors">
                Payload (Message)
              </label>
              <textarea 
                required
                className="bg-transparent border border-[#FFFCF5]/20 p-3 text-sm font-mono focus:outline-none focus:border-[#e1ff00] transition-colors placeholder:text-[#FFFCF5]/20 flex-grow resize-none rounded-none min-h-[100px]"
                placeholder="> Enter transmission data here..."
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={transmitStatus !== "IDLE"}
              className={`font-mono text-sm uppercase tracking-widest py-3 border transition-all duration-300 ${
                transmitStatus === "IDLE" 
                  ? "border-[#e1ff00] text-[#010101] bg-[#e1ff00] hover:bg-transparent hover:text-[#e1ff00]" 
                  : transmitStatus === "TRANSMITTING"
                  ? "border-[#FFFCF5]/30 text-[#FFFCF5]/50 bg-transparent cursor-not-allowed"
                  : "border-[#e1ff00] text-[#e1ff00] bg-[#e1ff00]/10"
              }`}
            >
              {transmitStatus === "IDLE" && "Initiate_Transmission"}
              {transmitStatus === "TRANSMITTING" && "Encrypting & Sending..."}
              {transmitStatus === "DELIVERED" && "Payload_Delivered"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}