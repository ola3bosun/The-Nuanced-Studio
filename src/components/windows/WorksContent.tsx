import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Register both plugins so GSAP knows how to parse them
gsap.registerPlugin(SplitText, ScrambleTextPlugin);

export default function WorksContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Prepare the text splits
      const titleSplit = new SplitText(".error-title", { type: "chars" });
      const bodySplit = new SplitText(".error-body", { type: "lines" });

      const tl = gsap.timeline({ delay: 0.5 }); // Wait for the OS window to open

      // The Title: Harsh, randomized character drop
      tl.from(titleSplit.chars, {
        duration: 0.05,
        opacity: 0,
        y: 10,
        color: "#FF003C", // Brutalist System Red
        stagger: { each: 0.03, from: "random" },
        ease: "steps(1)", // Keeps it feeling choppy and digital
      });

      // The Body Lines: Snap in one by one
      tl.from(bodySplit.lines, {
        opacity: 0,
        x: -15,
        duration: 0.4,
        stagger: 0.25,
        ease: "power4.out",
      }, "+=0.5");

      // The Killer Glitch
      tl.to(".scramble-target", {
        duration: 1.5,
        scrambleText: {
          text: "&gt; [ ARCHIVE_CORRUPTED: Physical reconstruction required at Sector D19. ]",
          chars: "01X*&#>!%_?$[]",
          revealDelay: 0.5,
          speed: 0.6,
        },
        color: "#e1ff00", // Resolves to The Nuanced Studio Chartreuse
        ease: "none",
      }, "-=0.2");

      // Continuous Subsystem Failure (Flickering the tag)
      gsap.to(".flicker", {
        opacity: 0,
        duration: 0.05,
        repeat: -1,
        yoyo: true,
        repeatDelay: 3,
        ease: "steps(1)",
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="p-8 flex flex-col justify-center items-center bg-[#010101] text-[#FFFCF5] w-[90vw] max-w-[600px] min-h-[450px] relative overflow-hidden"
    >
      <div className="text-center z-10 w-full">
        {/* Terminal Header */}
        <div className="mb-6 border-b border-[#FF003C]/30 pb-4">
          <h2 className="error-title text-4xl font-sans font-bold tracking-widest uppercase text-[#FF003C]">
           Critical System Error
          </h2>
          <p className="font-mono text-sm text-[#FFFCF5]/50 mt-2 flicker">
            [ FATAL_EXCEPTION ]
          </p>
        </div>

        {/* Terminal Body */}
        <div className="font-mono text-sm text-[#FFFCF5]/60 leading-loose max-w-sm mx-auto text-left">
          <p className="error-body mb-4">
            &gt; Directory architecture under construction
          </p>
          <p className="error-body mb-4">
            &gt;  Attempting secure bypass...
          </p>
          <p className="error-body mb-4 text-[#FF003C]">
            &gt; Bypass failed.
          </p>
          {/* The ScrambleText plugin will overwrite this placeholder string with the real text */}
          <p className="scramble-target text-[#e1ff00] font-bold">
            &gt; You shouldn't be here...
          </p>
        </div>
      </div>

      {/* Decorative CSS Scanline */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]"></div>
    </div>
  );
}