
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

const TEXT_END_PROGRESS = 0.86;
const SEEK_THRESHOLD = 0.035;

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
  const wrapRef = React.useRef<HTMLElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const progressBarRef = React.useRef<HTMLDivElement | null>(null);
  const scrollHintRef = React.useRef<HTMLDivElement | null>(null);

  const frameRef = React.useRef<number | null>(null);
  const pendingTimeRef = React.useRef(0);
  const lastRequestedTimeRef = React.useRef(-1);

  const [activeStage, setActiveStage] = React.useState(0);
  const [isTextHidden, setIsTextHidden] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    const section = wrapRef.current;

    if (!video || !section) return;

    let animationFrame: number | null = null;

    // O vídeo não reproduz sozinho.
    video.pause();
    video.muted = true;
    video.playsInline = true;

    // Executa somente o seek mais recente.
    const applyLatestSeek = () => {
      if (
        !Number.isFinite(video.duration) ||
        video.duration <= 0 ||
        video.readyState < 1 ||
        video.seeking
      ) {
        return;
      }

      const target = pendingTimeRef.current;

      // Evita solicitações redundantes.
      if (
        Math.abs(target - video.currentTime) < SEEK_THRESHOLD
      ) {
        return;
      }

      if (
        Math.abs(target - lastRequestedTimeRef.current) <
        SEEK_THRESHOLD
      ) {
        return;
      }

      try {
        lastRequestedTimeRef.current = target;
        video.currentTime = target;
      } catch {
        lastRequestedTimeRef.current = -1;
      }
    };

    // Calcula o progresso da página.
    const update = () => {
      animationFrame = null;

      const rect = section.getBoundingClientRect();

      const scrollDistance =
        section.offsetHeight - window.innerHeight;

      const progress =
        scrollDistance > 0
          ? Math.min(1, Math.max(0, -rect.top / scrollDistance))
          : 0;

      // Calcula o estágio ativo.
      const totalStages = stages.length;

      const textProgress = Math.min(
        1,
        progress / TEXT_END_PROGRESS
      );

      const nextStage =
        totalStages > 0
          ? Math.min(
              totalStages - 1,
              Math.floor(textProgress * totalStages)
            )
          : 0;

      // React só atualiza quando o estágio realmente muda.
      setActiveStage(nextStage);

      // Esconde os textos depois do último estágio.
      const hidden = progress >= TEXT_END_PROGRESS;

      setIsTextHidden(hidden);

      // Atualiza a barra sem renderização React.
      if (progressBarRef.current) {
        progressBarRef.current.style.transform =
          `scaleX(${textProgress})`;
      }

      // Atualiza a indicação de scroll diretamente.
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(
          hidden ? 0 : Math.max(0, 1 - progress * 5)
        );
      }

      // Calcula o instante correspondente do vídeo.
      if (
        Number.isFinite(video.duration) &&
        video.duration > 0
      ) {
        const target = Math.min(
          progress * video.duration,
          Math.max(0, video.duration - 0.04)
        );

        // Guarda sempre a posição mais recente.
        pendingTimeRef.current = target;

        applyLatestSeek();
      }
    };

    // Limita os cálculos a um ciclo por frame.
    const scheduleUpdate = () => {
      if (animationFrame === null) {
        animationFrame = requestAnimationFrame(update);
      }
    };

    // Quando um seek termina, aplica somente o destino mais recente.
    const handleSeeked = () => {
      applyLatestSeek();
    };

    // Eventos da página.
    window.addEventListener("scroll", scheduleUpdate, {
      passive: true,
    });

    window.addEventListener("resize", scheduleUpdate, {
      passive: true,
    });

    // Eventos do vídeo.
    video.addEventListener("loadedmetadata", scheduleUpdate);
    video.addEventListener("loadeddata", scheduleUpdate);
    video.addEventListener("canplay", scheduleUpdate);
    video.addEventListener("seeked", handleSeeked);

    // Sincronização inicial.
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      video.removeEventListener("loadedmetadata", scheduleUpdate);
      video.removeEventListener("loadeddata", scheduleUpdate);
      video.removeEventListener("canplay", scheduleUpdate);
      video.removeEventListener("seeked", handleSeeked);

      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [src, stages.length]);

  const totalStages = stages.length;

  const textProgress = Math.min(
    1,
    Math.max(0, activeStage / Math.max(totalStages, 1))
  );

  return (
    <section
      ref={wrapRef}
      className={cn(
        "relative h-[650vh] md:h-[750vh]",
        className
      )}
      id="inicio"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">

        {/* VÍDEO */}
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

          {/* Gradiente de integração */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              "bg-gradient-to-t from-background via-background/10 to-transparent",
              "transition-opacity duration-300",
              "md:bg-gradient-to-r md:from-background md:via-transparent",
              isTextHidden ? "opacity-0" : "opacity-100"
            )}
          />
        </div>

        {/* CONTEÚDO TEXTUAL */}
        <div
          aria-hidden={isTextHidden || totalStages === 0}
          className={cn(
            "relative z-10 flex h-full flex-col justify-end",
            "px-6 pb-24 transition-opacity duration-300",
            "md:w-1/2 md:justify-center md:px-16",
            isTextHidden
              ? "pointer-events-none invisible -translate-y-4 opacity-0"
              : "pointer-events-auto visible translate-y-0 opacity-100"
          )}
        >
          <p className="mb-6 font-sans text-xs uppercase tracking-luxe text-gold">
            Clínica BioBella
          </p>

          {/* ESTÁGIOS */}
          <div className="relative min-h-[14rem] md:min-h-[16rem]">
            {stages.map((stage, index) => {
              const isActive =
                !isTextHidden && activeStage === index;

              return (
                <div
                  key={stage.n}
                  aria-hidden={!isActive}
                  className={cn(
                    "absolute inset-0 transition-all duration-500",
                    isActive
                      ? "visible pointer-events-auto"
                      : "invisible pointer-events-none"
                  )}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translate3d(0, ${
                      (index - activeStage) * 24
                    }px, 0)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-gold">
                      {stage.n}
                    </span>

                    <span className="h-px w-8 bg-gold/40" />

                    <span className="font-sans text-xs uppercase tracking-luxe text-gold/90">
                      {stage.subtitle}
                    </span>
                  </div>

                  <h1 className="mt-2 font-display text-5xl font-medium leading-none text-primary md:text-7xl">
                    {stage.title}
                  </h1>

                  <p className="mt-4 max-w-md font-sans font-light leading-relaxed text-muted-foreground">
                    {stage.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* BARRA DE PROGRESSO */}
          <div className="mt-10 flex items-center gap-4">
            <div className="h-px w-48 overflow-hidden bg-border">
              <div
                ref={progressBarRef}
                className="h-px w-full origin-left bg-gold-gradient"
                style={{
                  transform: "scaleX(0)",
                }}
              />
            </div>

            <span className="font-sans text-[11px] tracking-luxe text-muted-foreground">
              {String(
                totalStages > 0 ? activeStage + 1 : 0
              ).padStart(2, "0")}
              {" / "}
              {String(totalStages).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* INDICAÇÃO DE SCROLL */}
        <div
          ref={scrollHintRef}
          className={cn(
            "pointer-events-none absolute bottom-6 left-1/2 z-10",
            "-translate-x-1/2 font-sans text-[10px]",
            "uppercase tracking-luxe text-muted-foreground"
          )}
          style={{ opacity: 1 }}
        >
          Role para descobrir
        </div>
      </div>
    </section>
  );
}
