import GlowButton from './GlowButton';
import primaryLogo2 from './assets/primaryLogo2.png';

const NavLink = ({ title, onClick }: { title: string; onClick: () => void }) => {
  return (
    <button
      data-cursor="link"
      onClick={onClick}
      className="relative group text-[#FFFCF5]/60 hover:text-[#E1FF00] transition-colors duration-300 py-1"
    >
      <span className="relative z-10">{title}</span>
      <svg
        className="absolute left-0 -bottom-1.5 w-full h-[8px] pointer-events-none opacity-80"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
      >
        <path
          d="M 2 7 Q 25 2 50 6 T 98 4"
          fill="transparent"
          vectorEffect="non-scaling-stroke"
          pathLength="100"
          className="stroke-current stroke-[2px] stroke-linecap-round [stroke-dasharray:100] [stroke-dashoffset:100] group-hover:[stroke-dashoffset:0] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </svg>
    </button>
  );
};

interface NavbarProps {
  openWindow: (pageKey: string) => void;
}

export default function Navbar({ openWindow }: NavbarProps) {
  return (
    <nav className="grid grid-cols-12 gap-4 w-full items-center">
      {/* Logo */}
      <div className="col-span-4 md:col-span-6 flex justify-start">
        <div className="font-bold text-[16px] tracking-tighter leading-none h-6">
          <img src={primaryLogo2} alt="The Nuanced Studio logo" className="h-full w-auto object-contain" />
        </div>
      </div>

      {/* Links */}
      <div className="hidden md:flex col-span-4 md:col-start-7 md:col-span-4 justify-start items-center text-[12px] tracking-[0.15em] uppercase text-[#FFFCF5]/60 pt-2">
        <NavLink title="SOLUTIONS +" onClick={() => openWindow('solutions')} />
        <span className="mx-2 text-[#FFFCF5]/40">//</span>
        <NavLink title="PLATFORM" onClick={() => openWindow('platform')} />
        <span className="mx-2 text-[#FFFCF5]/40">//</span>
        <NavLink title="CONTACT" onClick={() => openWindow('contact')} />
      </div>

      {/* CTA Button */}
      <div className="col-span-8 md:col-start-11 md:col-span-2 flex justify-end">
        <GlowButton
          edgeSensitivity={4}
          glowColor="40 80 80"
          backgroundColor="#010101"
          borderRadius={5}
          glowRadius={10}
          glowIntensity={0.1}
          coneSpread={5}
          animated
          colors={['#E1FF00', '#F4FF81', '#C6FF00']}
          text="REQUEST A DEMO"
          onClick={() => openWindow('contact')}
        />
      </div>
    </nav>
  );
}