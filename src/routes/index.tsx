import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AudioLines,
  Check,
  ClipboardList,
  Copy,
  FileJson,
  FileText,
  ListMusic,
  Music2,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SentenceList } from "@/components/sentence-list";
import { useWfdSettings } from "@/hooks/use-wfd-settings";
import { groupVersionIds, groupVersions, type GroupVersionId } from "@/data/wfd-group-versions";
import { wfdSongsA } from "@/data/wfd-songs-a";
import { wfdSongsB } from "@/data/wfd-songs-b";
import { wfdSongsC } from "@/data/wfd-songs-c";

type HomeSearch = { tipo: GroupVersionId; grupo: number };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    const rawTipo = String(search["tipo"] ?? "A").toUpperCase();
    const tipo: GroupVersionId =
      rawTipo === "A" || rawTipo === "B" || rawTipo === "C" ? rawTipo : "A";
    const maxGroup = groupVersions[tipo].groupCount;
    const raw = Number(search["grupo"] ?? 1);
    const grupo = Number.isInteger(raw) && raw >= 1 && raw <= maxGroup ? raw : 1;
    return { tipo, grupo };
  },
  head: () => ({
    meta: [
      { title: "WFD Groups — 3 versões de grupos de frases PTE + Suno V5" },
      {
        name: "description",
        content:
          "Visualize e copie grupo por grupo as 301 frases Write From Dictation do PTE Academic em 3 versões de separação (A 10 em 10, B 20 em 20, C 30 em 30), em texto ou JSON. Em todos os tipos, copie também a estrutura musical Suno V5 de cada grupo: letra completa e elementos de estilo.",
      },
      { property: "og:title", content: "WFD Groups — 3 versões de grupos de frases PTE + Suno V5" },
      {
        property: "og:description",
        content:
          "Visualize e copie grupo por grupo as 301 frases Write From Dictation do PTE Academic em 3 versões de separação (A 10 em 10, B 20 em 20, C 30 em 30), em texto ou JSON. Em todos os tipos, copie também a estrutura musical Suno V5 de cada grupo: letra completa e elementos de estilo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

type CopyTarget = "text" | "json" | "all" | "letra" | "ritmos";

function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error("clipboard unavailable"));
}

function HomePage() {
  const { tipo, grupo } = Route.useSearch();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [settings] = useWfdSettings();

  const version = groupVersions[tipo];
  const groupIndex = grupo - 1;
  const sentences = version.groups[groupIndex] ?? [];
  const song =
    tipo === "A"
      ? wfdSongsA.find((s) => s.group === grupo)
      : tipo === "B"
        ? wfdSongsB.find((s) => s.group === grupo)
        : wfdSongsC.find((s) => s.group === grupo);

  const navigateTo = (nextTipo: GroupVersionId, nextGrupo: number) => {
    const maxGroup = groupVersions[nextTipo].groupCount;
    void navigate({
      to: "/",
      search: { tipo: nextTipo, grupo: Math.min(nextGrupo, maxGroup) },
    });
  };

  const selectGroup = (n: number) => navigateTo(tipo, n);
  const selectTipo = (next: GroupVersionId) => navigateTo(next, grupo);

  const flash = (target: CopyTarget) => {
    setCopied(target);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const copyText = () => {
    copyToClipboard(sentences.join(",\n")).then(
      () => flash("text"),
      () => {},
    );
  };

  const copyJson = () => {
    copyToClipboard(JSON.stringify(sentences, null, 2)).then(
      () => flash("json"),
      () => {},
    );
  };

  const copyAllJson = () => {
    copyToClipboard(JSON.stringify(version.groups, null, 2)).then(
      () => flash("all"),
      () => {},
    );
  };

  const copyLetra = () => {
    if (!song) return;
    copyToClipboard(song.letra).then(
      () => flash("letra"),
      () => {},
    );
  };

  const copyRitmos = () => {
    if (!song) return;
    copyToClipboard(song.estilo).then(
      () => flash("ritmos"),
      () => {},
    );
  };

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
              <ListMusic className="size-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight hidden sm:inline">
              WFD Groups
            </span>
            <Badge
              variant="outline"
              className="border-primary/30 text-primary bg-primary/5 text-xs font-normal hidden md:inline-flex"
            >
              {version.groupCount} grupos · {version.sentenceCount} frases
            </Badge>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/copiar"
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <ClipboardList className="size-4" />
              <span className="hidden sm:inline">Copiar letra &amp; ritmos</span>
              <span className="sm:hidden">Copiar</span>
            </Link>
            <Link
              to="/settings"
              aria-label="Configurações"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/60 px-3 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-primary/30"
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline">Config.</span>
            </Link>
            <div
              role="radiogroup"
              aria-label="Versão de separação dos grupos"
              className="flex items-center rounded-lg border border-border/50 bg-card/60 p-0.5 gap-0.5"
            >
              {groupVersionIds.map((id) => {
                const v = groupVersions[id];
                const active = id === tipo;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    title={`Tipo ${id} — ${v.shortLabel} (${v.groupCount} grupos)`}
                    onClick={() => selectTipo(id)}
                    className={
                      "rounded-md px-3 py-1.5 text-xs sm:text-sm transition-colors " +
                      (active
                        ? "bg-primary/15 text-primary font-semibold border border-primary/40"
                        : "text-muted-foreground border border-transparent hover:text-foreground hover:border-primary/20")
                    }
                  >
                    <span className="font-semibold">{id}</span>
                    <span className="ml-1.5 opacity-70 hidden sm:inline">{v.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 grid gap-6 md:grid-cols-[220px_1fr]">
        {/* Navegação de grupos */}
        <nav aria-label="Grupos" className="md:h-[calc(100dvh-8rem)]">
          <ScrollArea className="h-full md:pr-3">
            <div className="grid grid-cols-4 md:grid-cols-1 gap-1.5">
              {version.groups.map((sentences, i) => {
                const n = i + 1;
                const active = n === grupo;
                return (
                  <button
                    key={`${tipo}-${n}`}
                    type="button"
                    onClick={() => selectGroup(n)}
                    aria-current={active ? "true" : undefined}
                    className={
                      "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors " +
                      (active
                        ? "border-primary/40 bg-primary/10 text-primary font-medium"
                        : "border-border/50 bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground")
                    }
                  >
                    <span>Grupo {n}</span>
                    <span className="text-xs opacity-70">{sentences.length}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </nav>

        {/* Painel do grupo */}
        <section className="min-w-0">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="p-5 pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-lg font-semibold">
                    Grupo {grupo}{" "}
                    <span className="text-muted-foreground font-normal">· Tipo {tipo}</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {sentences.length} frases · {version.chunkDescription} · ordem do dataset
                    original
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="default" onClick={copyText}>
                    {copied === "text" ? (
                      <Check className="size-4" />
                    ) : (
                      <FileText className="size-4" />
                    )}
                    {copied === "text" ? "Copiado!" : "Copiar texto"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyJson}>
                    {copied === "json" ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied === "json" ? "Copiado!" : "Copiar JSON"}
                  </Button>
                  {song && (
                    <>
                      <Button size="sm" variant="outline" onClick={copyLetra}>
                        {copied === "letra" ? (
                          <Check className="size-4" />
                        ) : (
                          <Music2 className="size-4" />
                        )}
                        {copied === "letra" ? "Copiado!" : "Copiar letra"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={copyRitmos}>
                        {copied === "ritmos" ? (
                          <Check className="size-4" />
                        ) : (
                          <AudioLines className="size-4" />
                        )}
                        {copied === "ritmos" ? "Copiado!" : "Copiar ritmos"}
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" onClick={copyAllJson}>
                    {copied === "all" ? (
                      <Check className="size-4" />
                    ) : (
                      <FileJson className="size-4" />
                    )}
                    {copied === "all" ? "Copiado!" : `JSON (${version.groupCount} grupos)`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Separator className="opacity-40" />
            <CardContent className="p-5 pt-4">
              <SentenceList sentences={sentences} settings={settings} />
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/30 py-4 text-center text-xs text-muted-foreground">
        <p>
          Tipo A: 10 em 10 (31 grupos) · Tipo B: 20 em 20 (16 grupos) · Tipo C: 30 em 30 (11 grupos)
          — 301 frases. Texto copiado: frases separadas por vírgula + parágrafo. JSON: array de
          strings. Todos os tipos: estruturas musicais Suno V5 com botões de copiar letra e ritmos.
        </p>
      </footer>
    </div>
  );
}
