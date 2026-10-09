import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface LogModalProps {
  type: 'design' | 'dev' | null;
  onClose: () => void;
}

export default function LogModal({ type, onClose }: LogModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'TNS_OS v2.0_REBUILD [TELEMETRY CONSOLE]',
    'Type "help" for available commands.',
  ]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto-focus input on open
  useEffect(() => {
    if (type === 'dev') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [type]);

  // GSAP slide and fade entrance
  useEffect(() => {
    if (!modalRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
      );
    });
    return () => ctx.revert();
  }, [type]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newHistory = [...terminalHistory, `> ${terminalInput}`];

    switch (cmd) {
      case 'help':
        newHistory.push(
          'Available commands:',
          '  status    - View current rebuild status',
          '  hire      - Direct link to hire on Contra',
          '  origin    - Studio coordinates and location',
          '  clear     - Clear console output',
          '  exit      - Close developer log'
        );
        break;
      case 'status':
        newHistory.push('STATUS: awaiting the bad ass product designer');
        break;
      case 'hire':
        newHistory.push('CONTRACT: Available for commissions via Contra -> https://contra.com/WorkWithSokio');
        break;
      case 'origin':
        newHistory.push('NODE: Lagos, Nigeria // 6.5244° N, 3.3792° E // WAT (UTC+1)');
        break;
      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;
      case 'exit':
        onClose();
        return;
      default:
        newHistory.push(`Command not recognized: "${cmd}". Type "help" for available options.`);
    }

    setTerminalHistory(newHistory);
    setTerminalInput('');
  };

  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#010101]/85 backdrop-blur-md select-none"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#080808] border border-[#FFFCF5]/20 rounded-sm shadow-[0_24px_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#FFFCF5]/15 bg-[#0e0e0e] font-mono text-xs tracking-widest uppercase text-[#FFFCF5]/80">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#E1FF00] shadow-[0_0_8px_#E1FF00]" />
            <span>[ {type === 'design' ? 'TNS_DESIGN_LOG' : 'TNS_DEV_LOG'} // V2.0 ]</span>
          </div>

          <button
            onClick={onClose}
            data-cursor="invert"
            className="hover:text-[#E1FF00] transition-colors cursor-pointer text-[#FFFCF5]/50 focus-visible:outline-none"
            aria-label="Close log"
          >
            [ ESC TO CLOSE ]
          </button>
        </div>

        {/* LOG CONTENT BODY */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-mono text-xs sm:text-[13px] leading-relaxed text-[#FFFCF5]/80 space-y-6">
          {type === 'design' ? (
            /* DESIGN LOG */
            <>
              <div className="border-b border-[#FFFCF5]/10 pb-4">
                <span className="text-[#E1FF00] font-bold block mb-1">01 // DIRECTIVE: ARCHITECTURAL REDUCTION</span>
                <p className="text-[#FFFCF5]/70">
                  Stripping away surface decoration to focus on pure spatial mass, structural contrast, and deliberate negative space. The screen is approached as a physical architectural poster rather than a standard web container.
                </p>
              </div>

              <div className="border-b border-[#FFFCF5]/10 pb-4">
                <span className="text-[#E1FF00] font-bold block mb-1">02 // TYPOGRAPHY: CLASH GROTESK</span>
                <p className="text-[#FFFCF5]/70">
                  Monumental, confident grotesque display typography. Tight optical kerning and deliberate leading create monolithic letterforms that function as architectural anchors across the viewport.
                </p>
              </div>

              <div className="border-b border-[#FFFCF5]/10 pb-4">
                <span className="text-[#E1FF00] font-bold block mb-1">03 // CHROMATIC ISOLATION</span>
                <p className="text-[#FFFCF5]/70">
                  TNS Void Black (#010101) with warm archival ivory (#FFFCF5). High-voltage chartreuse (#E1FF00) is strictly reserved for the studio emblem and the custom crosshair cursor.
                </p>
              </div>

              <div>
                <span className="text-[#E1FF00] font-bold block mb-1">04 // PROVENANCE: LAGOS, NIGERIA</span>
                <p className="text-[#FFFCF5]/70">
                  Rooted in first principles. Built to operate with precision where conditions are complex, constrained, and continually evolving.
                </p>
              </div>
            </>
          ) : (
            /* DEV LOG / INTERACTIVE TERMINAL */
            <div className="space-y-4">
              {/* Telemetry metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-[#FFFCF5]/10 text-[11px] text-[#FFFCF5]/50 uppercase">
                <div>NODE: <span className="text-[#FFFCF5]">LAGOS_01</span></div>
                <div>LATENCY: <span className="text-[#FFFCF5]">14ms</span></div>
                <div>STATUS: <span className="text-[#E1FF00] font-semibold">awaiting the bad ass product designer</span></div>
              </div>

              {/* Terminal message stream */}
              <div className="space-y-1.5 min-h-[160px] max-h-[260px] overflow-y-auto">
                {terminalHistory.map((line, i) => (
                  <div key={i} className={line.startsWith('>') ? 'text-[#E1FF00]' : 'text-[#FFFCF5]/75'}>
                    {line}
                  </div>
                ))}
              </div>

              {/* Interactive command prompt */}
              <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2 border-t border-[#FFFCF5]/10">
                <span className="text-[#E1FF00]">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="type command (e.g. status, hire, help)..."
                  className="w-full bg-transparent border-none text-[#FFFCF5] focus:outline-none placeholder:text-[#FFFCF5]/30 font-mono text-xs sm:text-[13px]"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
