// components/CompetitionDetails.tsx
import { useEffect, useMemo, useRef, useState } from "react";

// Type definitions
interface CompetitionSection {
  id: string | number;
  title: string;
  content: string;
}

interface Competition {
  id: number;
  title: string;
  icon: string;
  deadline: string;
  sections: CompetitionSection[];
}

interface CompetitionDetailsProps {
  competition: Competition;
}

const CompetitionDetails: React.FC<CompetitionDetailsProps> = ({ competition }) => {
  const [active, setActive] = useState<number>(0);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number | null>(null);
  const [slideH, setSlideH] = useState<number>(0);

  // Compute slide height so each slide fills exactly the viewport below the header
  const recalc = (): void => {
    const headerH = headerRef.current?.offsetHeight ?? 0;
    const vh = window.innerHeight;
    // Add a small buffer to account for borders / shadows so the slide doesn't overflow
    setSlideH(Math.max(240, vh - headerH - 24));
  };

  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, competition.sections.length]);

  const next = (): void => setActive((i) => (i + 1) % competition.sections.length);
  const prev = (): void =>
    setActive((i) => (i - 1 + competition.sections.length) % competition.sections.length);

  const setIndex = (i: number): void => setActive(i);

  // Touch/Pointer swipe handlers
  const onPointerDown = (e: React.MouseEvent | React.TouchEvent): void => {
    const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX ?? 0;
    startXRef.current = clientX;
  };

  const onPointerUp = (e: React.MouseEvent | React.TouchEvent): void => {
    const clientX = 'clientX' in e ? e.clientX : e.changedTouches?.[0]?.clientX ?? 0;
    if (startXRef.current == null) return;
    const dx = clientX - startXRef.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    startXRef.current = null;
  };

  const slideStyle = useMemo(
    () => ({ height: `${slideH}px` }),
    [slideH]
  );

  // Process content function with proper typing
  const processContent = (content: string, index: number) => {
    return content.split("\n").map((paragraph: string, idx: number) => {
      // bullets
      if (paragraph.trim().startsWith("•")) {
        return (
          <div key={idx} className="flex items-start my-2">
        <div className="flex-shrink-0 mt-1.5 mr-3">
          <div className="w-1.5 h-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full" />
        </div>
        <p className="font-inter text-gray-700 leading-relaxed text-sm">
          {paragraph.trim().substring(1).trim().replace(/₹1,00,000/g, '').replace(/₹51,000/g, '').replace(/₹25,000/g, '')}
          {paragraph.includes('₹1,00,000') && (
            <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600 bg-clip-text text-transparent font-bold text-base">
          ₹37,500
            </span>
          )}
          {paragraph.includes('₹51,000') && (
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent font-bold text-base">
          ₹22,500
            </span>
          )}
          {paragraph.includes('₹25,000') && (
            <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 bg-clip-text text-transparent font-bold text-base">
          ₹15,000
            </span>
          )}
        </p>
          </div>
        );
      }

      // bold spans using **...**
      if (paragraph.includes("**")) {
        const parts = paragraph.split("**");
        return (
          <p key={idx} className="font-inter text-gray-700 leading-relaxed mb-3 text-sm">
            {parts.map((part: string, partIdx: number) =>
              partIdx % 2 === 1 ? (
                <span key={partIdx} className="font-playfair font-semibold text-base text-orange-800">
                  {part.replace(/1,00,000/g, '')}
                  {part.includes('1,00,000') && (
                    <span className="text-red-600 font-bold">₹1,00,000</span>
                  )}
                </span>
              ) : (
                <span key={partIdx}>
                  {part.replace(/1,00,000/g, '')}
                  {part.includes('1,00,000') && (
                    <span className="text-red-600 font-bold">₹1,00,000</span>
                  )}
                </span>
              )
            )}
          </p>
        );
      }

      if (paragraph.trim()) {
        return (
          <p key={idx} className="font-inter text-gray-700 leading-relaxed mb-3 text-sm">
            {paragraph.replace(/1,00,000/g, '')}
            {paragraph.includes('1,00,000') && (
              <span className="text-red-600 font-bold">₹1,00,000</span>
            )}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <div className="lg:col-span-1">
      <div className="space-y-4">
        {/* Compact Header */}
        <div
          ref={headerRef}
          className="relative bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg p-3 sm:p-4 sm:ml-8 sm:mr-4 text-white shadow-md"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-lg sm:text-2xl flex-shrink-0">{competition.icon}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-xl md:text-3xl font-bold text-white truncate">
                {competition.title}
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 rounded text-xs font-medium bg-white/20 text-white/90 mt-0.5 sm:mt-1">
                Competition #{competition.id}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="font-inter text-xs text-white/70 block hidden sm:block">Deadline</span>
              <span className="font-inter font-semibold text-xs sm:text-sm">{competition.deadline}</span>
            </div>
          </div>
        </div>

        {/* FULL-VIEW CAROUSEL */}
        <div
          ref={containerRef}
          className="relative select-none"
          onMouseDown={onPointerDown}
          onMouseUp={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchEnd={onPointerUp}
        >
          {/* Slides track */}
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={slideStyle}
          >
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${active * 100}%)` }}
            >
              {competition.sections.map((section: CompetitionSection, index: number) => (
                <div
                  key={section.id}
                  className="min-w-full h-[75vh] sm:p-4 sm:pl-8"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${competition.sections.length}`}
                >
                  <article
                    className="group relative bg-white/95 backdrop-blur-sm rounded-xl border border-orange-100/50 shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col"
                  >
                    {/* Subtle hover gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-transparent to-amber-50/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 p-6 flex-1 overflow-y-auto">
                      {/* Section header */}
                      <div className="flex items-start mb-4">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200 rounded-lg flex items-center justify-center shadow-sm">
                            <span className="section-number font-playfair font-bold text-sm text-black">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="font-playfair text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                            {section.title}
                          </h2>
                          <div className="flex items-center gap-2">
                            <div className="h-0.5 w-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                            <div className="h-0.5 w-6 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full opacity-60" />
                            <div className="h-0.5 w-3 bg-orange-200 rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* Section content */}
                      <div className="compact-prose">
                        {processContent(section.content, index)}
                      </div>
                    </div>

                    {/* Slide footer: progress */}
                    <div className="px-6 py-3 border-t border-orange-100">
                      <div className="flex items-center justify-between">
                        <span className="font-inter text-xs font-medium text-orange-600">
                          Section {index + 1} of {competition.sections.length}
                        </span>
                        <div className="flex items-center space-x-1">
                          {competition.sections.map((_, idx: number) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                idx <= index
                                  ? "bg-gradient-to-br from-orange-500 to-amber-500"
                                  : "bg-orange-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          {/* Nav buttons */}
          <div className="pointer-events-none">
            <button
              type="button"
              aria-label="Previous"
              onClick={prev}
              className="pointer-events-auto absolute -left-4 sm:left-1 cursor-pointer top-2/5 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/80 text-black hover:bg-white shadow-md border border-black flex items-center justify-center backdrop-blur-sm transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={next}
              className="pointer-events-auto absolute -right-4 top-2/5 cursor-pointer -translate-y-1/2 w-10 h-10 rounded-xl bg-white/80 text-black hover:bg-white shadow-md border border-black flex items-center justify-center backdrop-blur-sm transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetails;