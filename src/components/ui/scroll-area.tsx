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

// O vídeo foi codificado com 30 fps e TODOS os frames como keyframe
// (ffmpeg -g 1 -bf 0), então cada seek decodifica apenas 1 frame.
const VIDEO_FPS = 30;

// Velocidade de suavização (maior = mais colado ao scroll, menor = mais "manteiga").
const SMOOTHING = 10;

// Grão de filme (ruído fino em escala de cinza) e vinheta sobre o vídeo.
// Disfarçam a baixa resolução e dão um acabamento mais cinematográfico.
const GRAIN_OPACITY = 0.5; // 0.3 = sutil, 0.7 = bem marcado
const GRAIN_TILE = 240; // tamanho do ladrilho do ruído, em px
const GRAIN_IMAGE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${GRAIN_TILE}' height='${GRAIN_TILE}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
const VIGNETTE_IMAGE = "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.28) 100%)";

interface ScrollHeroProps {
  src?: string;
  className?: string;
  stages?: ScrollStage[];
}

export function ScrollHero({ src = heroVideoSrc, className, stages = STAGES }: ScrollHeroProps) {
  const wrapRef = React.useRef<HTMLElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const progressBarRef = React.useRef<HTMLDivElement | null>(null);
  const scrollHintRef = React.useRef<HTMLDivElement | null>(null);

  const [activeStage, setActiveStage] = React.useState(0);
  const [isTextHidden, setIsTextHidden] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    const section = wrapRef.current;

    if (!video || !section) return;

    let rafId: number | null = null;
    let lastTick = 0;
    let objectUrl: string | null = null;
    let disposed = false;

    // Estado da animação (tudo em segundos de vídeo).
    let targetTime = 0; // para onde o scroll quer ir
    let smoothTime = 0; // posição suavizada (interpolada)
    let shownFrame = -1; // último frame enviado ao decoder
    let hasMetadata = false;

    video.pause();
    video.muted = true;
    video.playsInline = true;

    const lastFrameIndex = () => Math.max(0, Math.floor(video.duration * VIDEO_FPS) - 1);

    // Loop de animação: interpola suavemente até o alvo e troca de frame
    // no máximo uma vez por seek concluído.
    const tick = (now: number) => {
      rafId = null;

      const dt = lastTick ? Math.min(0.1, (now - lastTick) / 1000) : 1 / 60;
      lastTick = now;

      // Interpolação independente da taxa de atualização da tela.
      const k = 1 - Math.exp(-SMOOTHING * dt);
      smoothTime += (targetTime - smoothTime) * k;

      // Encaixa no alvo quando já está a menos de ~1/4 de frame.
      if (Math.abs(targetTime - smoothTime) < 0.25 / VIDEO_FPS) {
        smoothTime = targetTime;
      }

      const wanted = Math.min(lastFrameIndex(), Math.max(0, Math.round(smoothTime * VIDEO_FPS)));

      if (wanted !== shownFrame && !video.seeking) {
        shownFrame = wanted;
        // +0.001 evita cair no frame anterior por arredondamento.
        video.currentTime = wanted / VIDEO_FPS + 0.001;
      }

      // Continua rodando enquanto houver movimento ou seek pendente.
      if (smoothTime !== targetTime || wanted !== shownFrame || video.seeking) {
        rafId = requestAnimationFrame(tick);
      } else {
        lastTick = 0;
      }
    };

    const ensureLoop = () => {
      if (rafId === null && hasMetadata) {
        rafId = requestAnimationFrame(tick);
      }
    };

    // Lê o scroll, atualiza UI leve e define o novo alvo do vídeo.
    const update = () => {
      const rect = section.getBoundingClientRect();
      const scrollDistance = section.offsetHeight - window.innerHeight;

      const progress =
        scrollDistance > 0 ? Math.min(1, Math.max(0, -rect.top / scrollDistance)) : 0;

      const totalStages = stages.length;
      const textProgress = Math.min(1, progress / TEXT_END_PROGRESS);

      const nextStage =
        totalStages > 0 ? Math.min(totalStages - 1, Math.floor(textProgress * totalStages)) : 0;

      setActiveStage(nextStage);

      const hidden = progress >= TEXT_END_PROGRESS;
      setIsTextHidden(hidden);

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${textProgress})`;
      }

      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(hidden ? 0 : Math.max(0, 1 - progress * 5));
      }

      if (hasMetadata && Number.isFinite(video.duration) && video.duration > 0) {
        targetTime = (lastFrameIndex() / VIDEO_FPS) * progress;
        ensureLoop();
      }
    };

    const handleMetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      hasMetadata = true;
      update();
    };

    const handleSeeked = () => {
      // Se o scroll andou durante o seek, envia o frame mais recente já.
      ensureLoop();
    };

    // Baixa o vídeo inteiro para memória: seeks passam a ser instantâneos,
    // sem depender de requisições de rede (range requests) durante o scroll.
    const loadVideo = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (disposed) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
      } catch {
        if (!disposed) video.src = src; // fallback: carregamento normal
      }
      video.load();
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    video.addEventListener("loadedmetadata", handleMetadata);
    video.addEventListener("seeked", handleSeeked);

    void loadVideo();
    update();

    return () => {
      disposed = true;

      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);

      video.removeEventListener("loadedmetadata", handleMetadata);
      video.removeEventListener("seeked", handleSeeked);

      if (rafId !== null) cancelAnimationFrame(rafId);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, stages.length]);

  const totalStages = stages.length;

  return (
    <section ref={wrapRef} className={cn("relative h-[650vh] md:h-[750vh]", className)} id="inicio">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background">
        {/* VÍDEO */}
        <div className="absolute inset-0 md:left-auto md:w-[52%]">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            controls={false}
            className="h-full w-full transform-gpu object-cover"
          />

          {/* Grão de filme + vinheta (disfarça a baixa resolução) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
            style={{
              backgroundImage: GRAIN_IMAGE,
              backgroundSize: `${GRAIN_TILE}px ${GRAIN_TILE}px`,
              opacity: GRAIN_OPACITY,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: VIGNETTE_IMAGE }}
          />

          {/* Gradiente de integração */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              "bg-gradient-to-t from-background via-background/10 to-transparent",
              "transition-opacity duration-300",
              "md:bg-gradient-to-r md:from-background md:via-transparent",
              isTextHidden ? "opacity-0" : "opacity-100",
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
              : "pointer-events-auto visible translate-y-0 opacity-100",
          )}
        >
          <p className="mb-6 font-sans text-xs uppercase tracking-luxe text-gold">
            Clínica BioBella
          </p>

          {/* ESTÁGIOS */}
          <div className="relative min-h-[14rem] md:min-h-[16rem]">
            {stages.map((stage, index) => {
              const isActive = !isTextHidden && activeStage === index;

              return (
                <div
                  key={stage.n}
                  aria-hidden={!isActive}
                  className={cn(
                    "absolute inset-0 transition-all duration-500",
                    isActive ? "visible pointer-events-auto" : "invisible pointer-events-none",
                  )}
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: `translate3d(0, ${(index - activeStage) * 24}px, 0)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg text-gold">{stage.n}</span>

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
              {String(totalStages > 0 ? activeStage + 1 : 0).padStart(2, "0")}
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
            "uppercase tracking-luxe text-muted-foreground",
          )}
          style={{ opacity: 1 }}
        >
          Role para descobrir
        </div>
      </div>
    </section>
  );
}
