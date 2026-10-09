import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AudioLines, Check, Music2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { groupVersionIds, groupVersions, type GroupVersionId } from "@/data/wfd-group-versions";
import { wfdSongsA } from "@/data/wfd-songs-a";
import { wfdSongsB } from "@/data/wfd-songs-b";
import { wfdSongsC } from "@/data/wfd-songs-c";
import { useCopiedTracker, type CopyCategory } from "@/hooks/use-copied-tracker";

export const Route = createFileRoute("/copiar")({
  head: () => ({
    meta: [
      {
        title: "Copiar Letra e Ritmos — WFD Groups (Suno V5)",
      },
      {
        name: "description",
        content:
          "Página única para copiar letra e ritmos das estruturas musicais Suno V5 dos 58 grupos (tipos A, B e C), com registro no navegador do que já foi usado e destaque do próximo da sequência.",
      },
      {
        property: "og:title",
        content: "Copiar Letra e Ritmos — WFD Groups (Suno V5)",
      },
      {
        property: "og:description",
        content:
          "Página única para copiar letra e ritmos das estruturas musicais Suno V5 dos 58 grupos (tipos A, B e C), com registro no navegador do que já foi usado e destaque do próximo da sequência.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CopiarPage,
});

const songsByType: Record<GroupVersionId, typeof wfdSongsA> = {
  A: wfdSongsA,
  B: wfdSongsB,
  C: wfdSongsC,
};

function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("clipboard unavailable"));
}

type FlashKey = string | null;

function buildLetrasJson(tipos: GroupVersionId[]): string {
  const out: Record<string, Record<string, string>> = {};
  for (const tipo of tipos) {
    const grupos: Record<string, string> = {};
    for (const song of [...songsByType[tipo]].sort((a, b) => a.group - b.group)) {
      grupos[`grupo_${song.group}`] = song.letra;
    }
    out[`tipo_${tipo}`] = grupos;
  }
  return JSON.stringify(out, null, 2);
}

function JsonCopyBar() {
  const [done, setDone] = useState<string | null>(null);
  const copy = (key: string, tipos: GroupVersionId[]) => {
    copyToClipboard(buildLetrasJson(tipos)).then(
      () => {
        setDone(key);
        window.setTimeout(() => setDone((c) => (c === key ? null : c)), 2000);
      },
      () => {},
    );
  };
  return (
    <section
      aria-label="Copiar letras em JSON"
      className="rounded-xl border border-border/50 bg-card/40 p-4 flex flex-wrap items-center gap-3"
    >
      <button
        type="button"
        onClick={() => copy("all", [...groupVersionIds])}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {done === "all" ? <Check className="size-4" /> : <Music2 className="size-4" />}
        {done === "all" ? "JSON copiado!" : "Copiar todas as letras (JSON)"}
      </button>
      <div className="flex items-center gap-2">
        {groupVersionIds.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => copy(id, [id])}
            aria-label={`Copiar letras do tipo ${id} em JSON`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-primary/40"
          >
            {done === id && <Check className="size-3" />}
            {done === id ? "Copiado!" : `JSON tipo ${id}`}
          </button>
        ))}
      </div>
      <p className="basis-full text-[11px] text-muted-foreground">
        Estrutura: tipo_A / grupo_1 … com a letra completa de cada grupo.
      </p>
    </section>
  );
}

function CopiarPage() {
  const { isCopied, markCopied } = useCopiedTracker();
  const [flash, setFlash] = useState<FlashKey>(null);

  const handleCopy = useCallback(
    (tipo: GroupVersionId, grupo: number, categoria: CopyCategory, text: string) => {
      copyToClipboard(text).then(
        () => {
          markCopied(tipo, grupo, categoria);
          const key = `${tipo}-${grupo}-${categoria}`;
          setFlash(key);
          window.setTimeout(() => {
            setFlash((current) => (current === key ? null : current));
          }, 2000);
        },
        () => {},
      );
    },
    [markCopied],
  );

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              search={{ tipo: "A", grupo: 1 }}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Voltar para a página inicial"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold tracking-tight truncate">
                Copiar letra &amp; ritmos
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Tudo em uma página · o navegador guarda o que já foi usado
              </p>
            </div>
          </div>
          <nav
            aria-label="Ir para um tipo"
            className="flex items-center rounded-lg border border-border/50 bg-card/60 p-0.5 gap-0.5 shrink-0"
          >
            {groupVersionIds.map((id) => {
              const version = groupVersions[id];
              return (
                <a
                  key={id}
                  href={`#tipo-${id.toLowerCase()}`}
                  title={`Tipo ${id} — ${version.shortLabel} (${version.groupCount} grupos)`}
                  className="rounded-md px-3 py-1.5 text-xs sm:text-sm text-muted-foreground border border-transparent transition-colors hover:text-foreground hover:border-primary/20"
                >
                  <span className="font-semibold">{id}</span>
                  <span className="ml-1.5 opacity-70 hidden md:inline">
                    {version.groupCount} grupos
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 space-y-12">
        <JsonCopyBar />
        {groupVersionIds.map((id) => (
          <TypeSection key={id} tipo={id} isCopied={isCopied} onCopy={handleCopy} flash={flash} />
        ))}
      </main>

      <footer className="border-t border-border/30 py-4 text-center text-xs text-muted-foreground px-4">
        <p>
          Os dois botões de cada grupo copiam exatamente a mesma letra e os mesmos ritmos dos grupos
          do app principal. O registro de uso fica somente neste navegador.
        </p>
      </footer>
    </div>
  );
}

interface TypeSectionProps {
  tipo: GroupVersionId;
  isCopied: (tipo: GroupVersionId, grupo: number, categoria: CopyCategory) => boolean;
  onCopy: (tipo: GroupVersionId, grupo: number, categoria: CopyCategory, text: string) => void;
  flash: FlashKey;
}

function TypeSection({ tipo, isCopied, onCopy, flash }: TypeSectionProps) {
  const version = groupVersions[tipo];
  const songs = songsByType[tipo];
  const anchor = `tipo-${tipo.toLowerCase()}`;

  const letraDone = countCopiedState(isCopied, tipo, "letra", version.groupCount);
  const ritmosDone = countCopiedState(isCopied, tipo, "ritmos", version.groupCount);
  const nextLetra = findNextGroupState(isCopied, tipo, "letra", version.groupCount);
  const nextRitmos = findNextGroupState(isCopied, tipo, "ritmos", version.groupCount);

  return (
    <section id={anchor} aria-labelledby={`${anchor}-titulo`} className="scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={`${anchor}-titulo`}
            className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight"
          >
            Tipo {tipo}{" "}
            <span className="text-muted-foreground text-base sm:text-lg font-normal">
              {version.shortLabel}
            </span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {version.groupCount} grupos · letra {letraDone}/{version.groupCount} · ritmos{" "}
            {ritmosDone}/{version.groupCount}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={
              nextLetra === null
                ? "border-success/40 text-success bg-success/5"
                : "border-primary/40 text-primary bg-primary/5"
            }
          >
            Próxima letra: {nextLetra === null ? "completo ✓" : `Grupo ${nextLetra}`}
          </Badge>
          <Badge
            variant="outline"
            className={
              nextRitmos === null
                ? "border-success/40 text-success bg-success/5"
                : "border-info/40 text-info bg-info/5"
            }
          >
            Próximos ritmos: {nextRitmos === null ? "completo ✓" : `Grupo ${nextRitmos}`}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {version.groups.map((_, i) => {
          const grupo = i + 1;
          const song = songs.find((s) => s.group === grupo);
          const letraUsed = isCopied(tipo, grupo, "letra");
          const ritmosUsed = isCopied(tipo, grupo, "ritmos");
          const isNextLetra = nextLetra === grupo;
          const isNextRitmos = nextRitmos === grupo;
          const highlight = isNextLetra || isNextRitmos;
          const flashKey = `${tipo}-${grupo}`;

          return (
            <article
              key={`${tipo}-${grupo}`}
              className={
                "relative rounded-xl border p-4 transition-colors " +
                (highlight
                  ? "border-primary/50 bg-primary/[0.05] ring-1 ring-primary/30"
                  : "border-border/50 bg-card/40")
              }
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  Grupo {grupo}
                  {isNextLetra && (
                    <span className="ml-2 align-middle inline-block rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      próxima letra
                    </span>
                  )}
                  {isNextRitmos && (
                    <span className="ml-2 align-middle inline-block rounded-full border border-info/40 bg-info/10 px-2 py-0.5 text-[10px] font-medium text-info">
                      próximos ritmos
                    </span>
                  )}
                </h3>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {version.groups[i]?.length ?? 0} frases
                </span>
              </div>
              <div className="mt-3 grid gap-2">
                <CopyButton
                  label="Copiar letra"
                  usedLabel="Letra copiada"
                  icon="letra"
                  used={letraUsed}
                  flashed={flash === `${flashKey}-letra`}
                  disabled={!song}
                  onClick={() => song && onCopy(tipo, grupo, "letra", song.letra)}
                  ariaLabel={`Copiar letra do grupo ${grupo} do tipo ${tipo}`}
                />
                <CopyButton
                  label="Copiar ritmos"
                  usedLabel="Ritmos copiados"
                  icon="ritmos"
                  used={ritmosUsed}
                  flashed={flash === `${flashKey}-ritmos`}
                  disabled={!song}
                  onClick={() => song && onCopy(tipo, grupo, "ritmos", song.estilo)}
                  ariaLabel={`Copiar ritmos do grupo ${grupo} do tipo ${tipo}`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* Adaptações tipadas: o estado vem do hook via closures de isCopied. */
function countCopiedState(
  isCopied: TypeSectionProps["isCopied"],
  tipo: GroupVersionId,
  categoria: CopyCategory,
  groupCount: number,
): number {
  let total = 0;
  for (let grupo = 1; grupo <= groupCount; grupo += 1) {
    if (isCopied(tipo, grupo, categoria)) total += 1;
  }
  return total;
}

function findNextGroupState(
  isCopied: TypeSectionProps["isCopied"],
  tipo: GroupVersionId,
  categoria: CopyCategory,
  groupCount: number,
): number | null {
  for (let grupo = 1; grupo <= groupCount; grupo += 1) {
    if (!isCopied(tipo, grupo, categoria)) return grupo;
  }
  return null;
}

interface CopyButtonProps {
  label: string;
  usedLabel: string;
  icon: "letra" | "ritmos";
  used: boolean;
  flashed: boolean;
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
}

function CopyButton({
  label,
  usedLabel,
  icon,
  used,
  flashed,
  disabled,
  onClick,
  ariaLabel,
}: CopyButtonProps) {
  const Icon = icon === "letra" ? Music2 : AudioLines;
  const state = flashed ? "flashed" : used ? "used" : "idle";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={used}
      aria-label={ariaLabel}
      className={
        "flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none " +
        (state === "flashed"
          ? "border-success/60 bg-success/20 text-success"
          : state === "used"
            ? "border-success/40 bg-success/10 text-success"
            : "border-primary/40 bg-primary/15 text-primary hover:bg-primary/25")
      }
    >
      {state === "idle" ? <Icon className="size-4" /> : <Check className="size-4" />}
      {state === "flashed" ? "Copiado!" : state === "used" ? usedLabel : label}
    </button>
  );
}
