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
  {
    n: "06",
    subtitle: "Escuta Atenta",
    title: "Acolhimento",
    text: "Cada consulta começa ouvindo seus objetivos, expectativas e ritmo.",
  },
  {
    n: "07",
    subtitle: "Proporção & Leveza",
    title: "Naturalidade",
    text: "Traços preservados sem excessos, valorizando a expressão autêntica do seu rosto.",
  },
  {
    n: "08",
    subtitle: "Acompanhamento Próximo",
    title: "Cuidado",
    text: "Orientação clara antes, durante e após cada procedimento para sua tranquilidade.",
  },
];

// A lista encerra antes do fim total do scroll para liberar o último frame sem texto.
const TEXT_END_PROGRESS = 0.86;

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
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const video = videoRef.current;
    const section = wrapRef.current;

    if (!video || !section) return;

    let frameId: number | null = null;
    let previousProgress = -1;
    let previousTime = -1;

    // O vídeo será controlado exclusivamente pelo scroll.
    video.pause();
    video.muted = true;
    video.playsInline = true;

    const update = () => {
      frameId = null;

      const rect = section.getBoundingClientRect();
      const totalDistance = section.offsetHeight - window.innerHeight;

      const nextProgress =
        totalDistance > 0
          ? Math.min(1, Math.max(0, -rect.top / totalDistance))
          : 0;

      // 1. Atualização dos textos
      if (Math.abs(nextProgress - previousProgress) >= 0.0005) {
        previousProgress = nextProgress;
        setProgress(nextProgress);
      }

      // 2. Atualização do vídeo
      if (video.readyState >= 1 && video.duration > 0) {
        const target = nextProgress * video.duration;

        if (Math.abs(target - previousTime) >= 0.04) {
          previousTime = target;

          video.currentTime = Math.min(
            target,
            Math.max(0, video.duration - 0.01)
          );
        }
      }
    };

    const onScroll = () => {
      if (frameId === null) {
        frameId = requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    video.addEventListener("loadedmetadata", onScroll);
    video.addEventListener("loadeddata", onScroll);
    video.addEventListener("canplay", onScroll);

    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      video.removeEventListener("loadedmetadata", onScroll);
      video.removeEventListener("loadeddata", onScroll);
      video.removeEventListener("canplay", onScroll);

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [src]);

  const totalStages = stages.length;
  const textProgress = Math.min(1, Math.max(0, progress / TEXT_END_PROGRESS));
  const isTextHidden = progress >= TEXT_END_PROGRESS;
  const activeStage =
    totalStages > 0 ? Math.min(totalStages - 1, Math.floor(textProgress * totalStages)) : 0;

  return (
    <section
      ref={wrapRef}
      className={cn("relative h-[650vh] md:h-[750vh]", className)}
      id="inicio"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 md:left-auto md:w-[52%]">
          <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            controls={false}
            className="h-full w-full object-cover"
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent transition-opacity duration-300 md:bg-gradient-to-r md:from-background md:via-transparent",
              isTextHidden ? "opacity-0" : "opacity-100"
            )}
          />
        </div>

        <div
          aria-hidden={isTextHidden}
          className={cn(
            "relative z-10 flex h-full flex-col justify-end px-6 pb-24 transition-all duration-300 md:w-1/2 md:justify-center md:px-16",
            isTextHidden
              ? "pointer-events-none invisible -translate-y-4 opacity-0"
              : "pointer-events-auto visible translate-y-0 opacity-100"
          )}
        >
          <p className="mb-6 font-sans text-xs uppercase tracking-luxe text-gold">
            Clínica BioBella
          </p>

          <div className="relative min-h-[14rem] md:min-h-[16rem]">
            {stages.map((s, i) => {
              const isActive = !isTextHidden && activeStage === i;
              return (
                <div
                  key={s.n}
                  aria-hidden={!isActive}
                  className={cn(
                    "absolute inset-0 transition-all duration-500",
                    isActive ? "visible pointer-events-auto" : "invisible pointer-events-none"
                  )}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translateY(${(i - activeStage) * 24}px)`,
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
              <div
                className="h-px bg-gold-gradient"
                style={{ width: `${textProgress * 100}%` }}
              />
            </div>
            <span className="font-sans text-[11px] tracking-luxe text-muted-foreground">
              {String(activeStage + 1).padStart(2, "0")} / {String(totalStages).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 font-sans text-[10px] uppercase tracking-luxe text-muted-foreground"
          style={{ opacity: isTextHidden ? 0 : Math.max(0, 1 - progress * 5) }}
        >
          Role para descobrir
        </div>
      </div>
    </section>
  );
}