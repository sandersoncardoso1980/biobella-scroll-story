import { createFileRoute } from "@tanstack/react-router";
import sobreImg from "@/assets/frames/19.png";
import { ScrollHero } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BioBella — Dra. Kênia Silveira | Estética e Saúde" },
      {
        name: "description",
        content: "Clínica BioBella: beleza, saúde e confiança em você com a Dra. Kênia Silveira.",
      },
      { property: "og:title", content: "BioBella — Dra. Kênia Silveira" },
      {
        property: "og:description",
        content: "Beleza, saúde e confiança em você. Agende sua avaliação na BioBella.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TREATMENTS = [
  ["Harmonização Facial", "Equilíbrio e proporção respeitando seus traços."],
  ["Bioestimuladores", "Firmeza e colágeno para uma pele renovada."],
  ["Toxina Botulínica", "Suavização de linhas de expressão com leveza."],
  ["Skincare Avançado", "Tratamentos personalizados para a sua pele."],
];

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
        <a href="#inicio" className="font-display text-2xl text-primary">
          Bio<span className="text-gold">Bella</span>
        </a>
        <nav className="hidden gap-10 text-[11px] uppercase tracking-luxe text-foreground/80 md:flex">
          <a href="#sobre" className="hover:text-primary">
            Sobre
          </a>
          <a href="#tratamentos" className="hover:text-primary">
            Tratamentos
          </a>
          <a href="#contato" className="hover:text-primary">
            Contato
          </a>
        </nav>
        <a
          href="#contato"
          className="border border-gold px-5 py-2 text-[11px] uppercase tracking-luxe text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          Agendar
        </a>
      </header>

      <ScrollHero />

      <section id="sobre" className="mx-auto grid max-w-6xl gap-16 px-6 py-32 md:grid-cols-2 md:px-16">
        <img
          src={sobreImg}
          alt="Dra. Kênia Silveira"
          className="aspect-[4/5] w-full object-cover object-top shadow-elegant"
        />
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
        <h2 className="mx-auto mt-6 max-w-2xl font-display text-5xl md:text-6xl">
          Sua melhor versão começa com uma conversa
        </h2>
        <a
          href="#"
          className="mt-12 inline-block bg-gold-gradient px-10 py-4 text-xs uppercase tracking-luxe text-accent-foreground shadow-elegant"
        >
          Falar pelo WhatsApp
        </a>
        <p className="mt-20 font-display text-3xl text-gold-gradient">BioBella</p>
        <p className="mt-2 text-[10px] uppercase tracking-luxe text-primary-foreground/60">
          © 2026 · Dra. Kênia Silveira
        </p>
      </section>
    </main>
  );
}