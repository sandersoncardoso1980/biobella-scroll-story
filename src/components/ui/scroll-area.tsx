import * as React from "react";
import heroVideoSrc from "@/assets/frames/12772a07.mp4";
import { cn } from "@/lib/utils";

interface ScrollStage {
  n: string;
  subtitle: string;
  title: string;
  text: string;
}

const STAGES: ScrollStage[] = [
  {
    n: "01",
    subtitle: "Estética Avançada",
    title: "Beleza",
    text: "Realçar o que é seu, com naturalidade, equilíbrio e elegância em cada detalhe.",
  },
  {
    n: "02",
    subtitle: "Rigor Científico",
    title: "Saúde",
    text: "Protocolos seguros, guiados por ciência, anatomia e cuidado contínuo.",
  },
  {
    n: "03",
    subtitle: "Atendimento Exclusivo",
    title: "Confiança",
    text: "Uma jornada personalizada, pensada para respeitar a sua identidade.",
  },
  {
    n: "04",
    subtitle: "Resultados Duradouros",
    title: "Harmonia",
    text: "Planejamento individualizado que acompanha o tempo com leveza e sofisticação.",
  },
  {
    n: "05",
    subtitle: "Tecnologia & Precisão",
    title: "Excelência",
    text: "Técnicas modernas e produtos de alta performance para a melhor experiência.",
  },
];

interface ScrollHeroProps {
  src?: string;
  className?: string;
  stages?: ScrollStage[];
}

export function ScrollHero({
  src = heroVideoSrc,
  className,
  stages = STAGES,
}: ScrollHeroProps) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const durationRef = React.useRef<number>(0);
  const targetProgressRef = React.useRef<number>(0);
  const smoothProgressRef = React.useRef<number>(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      durationRef.current = Number.isFinite(video.duration) ? video.duration : 0;
      measure();
    };

    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        targetProgressRef.current = 0;
        return;
      }
      const raw = -el.getBoundingClientRect().top / scrollable;
      targetProgressRef.current = Math.min(1, Math.max(0, raw));
    };

    const tick = () => {
      const target = targetProgressRef.current;
      let smooth = smoothProgressRef.current;
      smooth += (target - smooth) * 0.12;
      if (Math.abs(target - smooth) < 0.0005) {
        smooth = target;
      }
      smoothProgressRef.current = smooth;

      const currentVideo = videoRef.current;
      const duration = durationRef.current;
      if (currentVideo && duration > 0 && currentVideo.readyState >= 1) {
        const targetTime = smooth * duration;
        if (Math.abs(currentVideo.currentTime - targetTime) > 0.015) {
          currentVideo.currentTime = targetTime;
        }
      }

      setProgress((prev) =>
        Math.abs(prev - smooth) > 0.002 || smooth === 0 || smooth === 1 ? smooth : prev
      );
      rafRef.current = requestAnimationFrame(tick);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [src]);

  const totalStages = stages.length;
  const activeStage =
    totalStages > 0 ? Math.min(totalStages - 1, Math.floor(progress * totalStages)) : 0;

  return (
    <section ref={wrapRef} className={cn("relative h-[650vh]", className)} id="inicio">
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 md:left-auto md:w-[52%]">
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent md:bg-gradient-to-r md:from-background md:via-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-24 md:w-1/2 md:justify-center md:px-16">
          <p className="mb-6 font-sans text-xs uppercase tracking-luxe text-gold">
            Clínica BioBella
          </p>

          <div className="relative min-h-[14rem] md:min-h-[16rem]">
            {stages.map((s, i) => {
              const isActive = activeStage === i;
              return (
                <div
                  key={s.n}
                  aria-hidden={!isActive}
                  className={cn(
                    "absolute inset-0 transition-all duration-700",
                    isActive ? "pointer-events-auto" : "pointer-events-none"
                  )}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translateY(${(i - activeStage) * 28}px)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-gold">{s.n}</span>
                    <span className="h-px w-8 bg-gold/40" />
                    <span className="font-sans text-xs uppercase tracking-luxe text-gold/90">
                      {s.subtitle}
                    </span>
                  </div>

                  <h1 className="mt-2 font-display text-5xl font-medium leading-none text-primary md:text-7xl">
                    {s.title}
                  </h1>

                  <p className="mt-4 max-w-md font-sans font-light leading-relaxed text-muted-foreground">
                    {s.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="h-px w-48 bg-border">
              <div className="h-px bg-gold-gradient" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="font-sans text-[11px] tracking-luxe text-muted-foreground">
              {String(activeStage + 1).padStart(2, "0")} / {String(totalStages).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 font-sans text-[10px] uppercase tracking-luxe text-muted-foreground"
          style={{ opacity: Math.max(0, 1 - progress * 4) }}
        >
          Role para descobrir
        </div>
      </div>
    </section>
  );
}