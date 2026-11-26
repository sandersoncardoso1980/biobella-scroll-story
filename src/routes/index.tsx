import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const frameModules = import.meta.glob<{ default: { url: string } }>("@/assets/frames/*.asset.json", { eager: true });
const FRAMES = Object.keys(frameModules).sort().map((k) => frameModules[k]!.default.url);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BioBella — Dra. Kênia Silveira | Estética e Saúde" },
      { name: "description", content: "Clínica BioBella: beleza, saúde e confiança em você com a Dra. Kênia Silveira." },
      { property: "og:title", content: "BioBella — Dra. Kênia Silveira" },
      { property: "og:description", content: "Beleza, saúde e confiança em você. Agende sua avaliação na BioBella." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STAGES = [
  { n: "01", word: "Beleza", text: "Realçar o que é seu, com naturalidade e elegância." },
  { n: "02", word: "Saúde", text: "Protocolos seguros, guiados por ciência e cuidado." },
  { n: "03", word: "Confiança", text: "Um atendimento exclusivo, pensado para você." },
];

const TREATMENTS = [
  ["Harmonização Facial", "Equilíbrio e proporção respeitando seus traços."],
  ["Bioestimuladores", "Firmeza e colágeno para uma pele renovada."],
  ["Toxina Botulínica", "Suavização de linhas de expressão com leveza."],
  ["Skincare Avançado", "Tratamentos personalizados para a sua pele."],
];

function ScrollHero() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<HTMLImageElement[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    imgs.current = FRAMES.map((src) => {
      const im = new Image();
      im.decoding = "async";
      im.src = src;
      return im;
    });
    const ready = (im?: HTMLImageElement) => !!im && im.complete && im.naturalWidth > 0;
    const paint = (img: HTMLImageElement, alpha: number) => {
      const s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
    };
    let target = 0, smooth = 0, lastDrawn = -1, raf = 0;
    const measure = () => {
      const el = wrap.current!;
      const total = el.offsetHeight - window.innerHeight;
      target = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      lastDrawn = -1;
    };
    const loop = () => {
      smooth += (target - smooth) * 0.08;
      if (Math.abs(target - smooth) < 0.0002) smooth = target;
      const f = smooth * (FRAMES.length - 1);
      if (Math.abs(f - lastDrawn) > 0.002) {
        const i = Math.floor(f), t = f - i;
        const a = imgs.current[i], b = imgs.current[Math.min(i + 1, FRAMES.length - 1)];
        if (ready(a)) {
          ctx.globalAlpha = 1;
          paint(a!, 1);
          if (t > 0.001 && ready(b)) paint(b!, t);
          ctx.globalAlpha = 1;
          lastDrawn = f;
          setProgress(smooth);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    resize();
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const stage = Math.min(2, Math.floor(progress * 3));

  return (
    <section ref={wrap} className="relative h-[400vh]" id="inicio">
      <div className="sticky top-0 h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 md:left-auto md:w-[52%]">
          <canvas ref={canvas} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent md:bg-gradient-to-r md:from-background md:via-transparent" />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-24 md:w-1/2 md:justify-center md:px-16">
          <p className="mb-6 font-sans text-xs uppercase tracking-luxe text-gold">Clínica BioBella</p>
          <div className="relative h-[9rem] md:h-[11rem]">
            {STAGES.map((s, i) => (
              <div key={s.n} className="absolute inset-0 transition-all duration-700" style={{ opacity: stage === i ? 1 : 0, transform: `translateY(${(i - stage) * 30}px)` }}>
                <span className="font-display text-lg text-gold">{s.n}</span>
                <h1 className="font-display text-6xl font-medium leading-none text-primary md:text-8xl">{s.word}</h1>
                <p className="mt-4 max-w-sm font-sans font-light text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 h-px w-48 bg-border">
            <div className="h-px bg-gold-gradient" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 font-sans text-[10px] uppercase tracking-luxe text-muted-foreground" style={{ opacity: 1 - progress * 4 }}>
          Role para descobrir
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <main className="bg-background font-sans text-foreground">
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background animate-intro-out">
        <div className="text-center animate-logo-in">
          <div className="font-display text-5xl text-gold-gradient md:text-7xl">BioBella</div>
          <div className="mt-3 text-[10px] uppercase tracking-luxe text-primary">Dra. Kênia Silveira</div>
        </div>
      </div>

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 md:px-16">
        <a href="#inicio" className="font-display text-2xl text-primary">Bio<span className="text-gold">Bella</span></a>
        <nav className="hidden gap-10 text-[11px] uppercase tracking-luxe text-foreground/80 md:flex">
          <a href="#sobre" className="hover:text-primary">Sobre</a>
          <a href="#tratamentos" className="hover:text-primary">Tratamentos</a>
          <a href="#contato" className="hover:text-primary">Contato</a>
        </nav>
        <a href="#contato" className="border border-gold px-5 py-2 text-[11px] uppercase tracking-luxe text-primary transition hover:bg-primary hover:text-primary-foreground">Agendar</a>
      </header>

      <ScrollHero />

      <section id="sobre" className="mx-auto grid max-w-6xl gap-16 px-6 py-32 md:grid-cols-2 md:px-16">
        <img src={FRAMES[0]} alt="Dra. Kênia Silveira" className="aspect-[4/5] w-full object-cover object-top shadow-elegant" />
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-luxe text-gold">A doutora</p>
          <h2 className="mt-4 font-display text-5xl text-primary">Dra. Kênia Silveira</h2>
          <div className="my-8 h-px w-20 bg-gold-gradient" />
          <p className="font-light leading-relaxed text-muted-foreground">
            À frente da BioBella, a Dra. Kênia une técnica, sensibilidade e um olhar atento a cada detalhe.
            Cada protocolo é desenhado para valorizar sua beleza natural, com segurança e resultados harmoniosos.
          </p>
          <p className="mt-6 font-display text-2xl italic text-primary">“Beleza, saúde e confiança em você.”</p>
        </div>
      </section>

      <section id="tratamentos" className="bg-secondary px-6 py-32 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs uppercase tracking-luxe text-gold">Tratamentos</p>
          <h2 className="mt-4 text-center font-display text-5xl text-primary">Cuidado sob medida</h2>
          <div className="mt-16 grid gap-px bg-border md:grid-cols-4">
            {TREATMENTS.map(([t, d], i) => (
              <div key={t} className="bg-background p-10 transition hover:bg-card">
                <span className="font-display text-gold">0{i + 1}</span>
                <h3 className="mt-6 font-display text-2xl text-primary">{t}</h3>
                <p className="mt-3 text-sm font-light text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contato" className="bg-wine-deep px-6 py-32 text-center text-primary-foreground md:px-16">
        <p className="text-xs uppercase tracking-luxe text-gold">Agende sua avaliação</p>
        <h2 className="mx-auto mt-6 max-w-2xl font-display text-5xl md:text-6xl">Sua melhor versão começa com uma conversa</h2>
        <a href="#" className="mt-12 inline-block bg-gold-gradient px-10 py-4 text-xs uppercase tracking-luxe text-accent-foreground shadow-elegant">Falar pelo WhatsApp</a>
        <p className="mt-20 font-display text-3xl text-gold-gradient">BioBella</p>
        <p className="mt-2 text-[10px] uppercase tracking-luxe text-primary-foreground/60">© 2026 · Dra. Kênia Silveira</p>
      </section>
    </main>
  );
}
