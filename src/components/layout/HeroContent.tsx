export default function HeroContent() {
  return (
    <div className="h-[50vh] flex flex-col relative z-10 px-6 md:px-8 pt-6 opacity-0 hero-content">
      <div className="grid grid-cols-12 gap-4 flex-1 items-center pb-12">
        <div className="col-span-12 md:col-span-5 flex flex-col justify-center">
          <div className="text-[16px] text-[#FFFCF5]/70 tracking-wide leading-relaxed space-y-3">
            <p>Built on certainty</p>
            <p>Connecting you to your goals</p>
            <p className="font-mono text-[#E1FF00] tracking-widest pt-2">[ TNS ]</p>
          </div>
        </div>
        <div className="col-span-12 md:col-start-7 md:col-span-6 flex flex-col justify-center text-left">
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] mb-5">
            The Nuanced <br /> Studio
          </h1>
          <div className="text-[#FFFCF5]/70 text-[16px] leading-relaxed max-w-md">
            <p>Built from the first principles to operate where conditions</p>
            <p>are complex, constrained and continually changing</p>
          </div>
        </div>
      </div>
    </div>
  );
}