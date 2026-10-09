import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  AudioLines,
  Bot,
  Languages,
  Mic,
  MessageSquareQuote,
  Settings2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useWfdSettings, type PlaybackSpeed } from "@/hooks/use-wfd-settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — WFD Groups" },
      {
        name: "description",
        content:
          "Ative ou desative tradução palavra por palavra, tradução de frases, áudio com pronúncia australiana, voz masculina ou feminina e velocidade de reprodução no WFD Groups.",
      },
      { property: "og:title", content: "Configurações — WFD Groups" },
      {
        property: "og:description",
        content:
          "Ative ou desative tradução palavra por palavra, tradução de frases, áudio com pronúncia australiana, voz masculina ou feminina e velocidade de reprodução no WFD Groups.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function ToggleRow(props: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/40 bg-background/40 px-4 py-3.5">
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 text-muted-foreground">{props.icon}</div>
        <div className="min-w-0">
          <Label htmlFor={props.id} className="text-sm font-medium cursor-pointer">
            {props.title}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {props.description}
          </p>
        </div>
      </div>
      <Switch
        id={props.id}
        checked={props.checked}
        onCheckedChange={props.onCheckedChange}
        aria-label={props.title}
        className="shrink-0"
      />
    </div>
  );
}

function RadioRow(props: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/40 px-4 py-3.5">
      <p className="text-sm font-medium">{props.label}</p>
      <RadioGroup
        value={props.value}
        onValueChange={props.onValueChange}
        className="mt-2.5 flex flex-wrap gap-2"
      >
        {props.options.map((option) => (
          <Label
            key={option.value}
            htmlFor={`${props.label}-${option.value}`}
            className={
              "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs sm:text-sm transition-colors " +
              (props.value === option.value
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground")
            }
          >
            <RadioGroupItem
              value={option.value}
              id={`${props.label}-${option.value}`}
              className="size-3.5"
            />
            {option.label}
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}

function SettingsPage() {
  const [settings, update] = useWfdSettings();

  return (
    <div className="min-h-dvh bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Settings2 className="size-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Configurações</span>
          </div>
          <Link
            to="/"
            search={{ tipo: "A", grupo: 1 }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/60 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-primary/30"
          >
            <ArrowLeft className="size-4" />
            Voltar às frases
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 space-y-5">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <Languages className="size-4 text-primary" />
              <CardTitle className="text-base">Tradução</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Ativa ou desativa os modos de tradução. Eles funcionam de forma independente e podem
              coexistir.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2.5">
            <ToggleRow
              id="traduzir-palavra"
              icon={<MessageSquareQuote className="size-4" />}
              title="Palavra por palavra"
              description="Ao clicar em uma palavra, mostra a tradução literal dela e o que ela significa naquela frase."
              checked={settings["traduzirPalavra"]}
              onCheckedChange={(checked) => update({ traduzirPalavra: checked })}
            />
            <ToggleRow
              id="traduzir-frase"
              icon={<Sparkles className="size-4" />}
              title="Tradução de frases"
              description="Toque proposital expande o card da frase, mostrando a tradução e como um brasileiro diria a mesma ideia."
              checked={settings["traduzirFrase"]}
              onCheckedChange={(checked) => update({ traduzirFrase: checked })}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <AudioLines className="size-4 text-primary" />
              <CardTitle className="text-base">Áudio</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Pronúncia das frases com voz gerada por IA — padrão australiano, como no exame PTE.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2.5">
            <ToggleRow
              id="audio-ativo"
              icon={<Mic className="size-4" />}
              title="Áudio das frases"
              description="Botão de play em cada frase do grupo selecionado."
              checked={settings["audio"]}
              onCheckedChange={(checked) => update({ audio: checked })}
            />
            <RadioRow
              label="Voz"
              value={settings["voz"]}
              onValueChange={(value) =>
                update({ voz: value === "masculina" ? "masculina" : "feminina" })
              }
              options={[
                { value: "feminina", label: "Feminina" },
                { value: "masculina", label: "Masculina" },
              ]}
            />
            <RadioRow
              label="Sotaque"
              value={settings["acento"]}
              onValueChange={(value) =>
                update({ acento: value === "neutro" ? "neutro" : "australiano" })
              }
              options={[
                { value: "australiano", label: "Australiano" },
                { value: "neutro", label: "Neutro (americano)" },
              ]}
            />
            <RadioRow
              label="Velocidade"
              value={String(settings["velocidade"])}
              onValueChange={(value) => update({ velocidade: Number(value) as PlaybackSpeed })}
              options={[
                { value: "0.5", label: "0,5×" },
                { value: "0.75", label: "0,75×" },
                { value: "1", label: "1×" },
                { value: "1.25", label: "1,25×" },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-muted-foreground" />
              <CardTitle className="text-base text-muted-foreground">Em breve</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Recursos futuros ficam listados aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2.5">
            <div className="rounded-lg border border-dashed border-border/40 px-4 py-3.5 opacity-60">
              <p className="text-sm font-medium text-muted-foreground">
                Tradução e análise por IA (avançada)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Estatísticas de palavras difíceis e revisão inteligente das frases já estudadas.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border/30 py-4 text-center text-xs text-muted-foreground">
        <p>
          Preferências salvas apenas neste navegador. Tradução e áudio são gerados sob demanda e
          guardados em cache para não repetir pedidos.
        </p>
      </footer>
      <Separator className="opacity-0" />
    </div>
  );
}
