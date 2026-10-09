// Lista de frases do grupo com os 3 recursos do project8:
// tradução palavra por palavra, expansão de frase e áudio.
// Todos respeitam as preferências da aba /settings.
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Square, Volume2, X } from "lucide-react";
import type { WfdSettings } from "@/hooks/use-wfd-settings";
import { getAudioUrl } from "@/lib/audio-cache";
import { speakSentenceFn } from "@/lib/ai/tts.functions";
import {
  getSentenceTranslation,
  getWordTranslation,
  putSentenceTranslation,
  putWordTranslation,
  sentenceCacheKey,
  wordCacheKey,
} from "@/lib/translation-cache";
import { translateSentenceFn, translateWordFn } from "@/lib/ai/translate.functions";

type Token = { text: string; word: string | null };

const TOKEN_RE = /[A-Za-z][A-Za-z'’-]*/g;
const TAP_MAX_DISTANCE = 10; // px
const TAP_MAX_DURATION = 500; // ms

function tokenize(sentence: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of sentence.matchAll(TOKEN_RE)) {
    const start = match.index ?? 0;
    if (start > last) tokens.push({ text: sentence.slice(last, start), word: null });
    tokens.push({ text: match[0], word: match[0] });
    last = start + match[0].length;
  }
  if (last < sentence.length) tokens.push({ text: sentence.slice(last), word: null });
  return tokens;
}

/** Toque proposital: só dispara se o ponteiro quase não se moveu. */
function usePropositalTap(onTap: () => void) {
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  return {
    onPointerDown: (event: React.PointerEvent) => {
      startRef.current = { x: event.clientX, y: event.clientY, t: Date.now() };
    },
    onPointerUp: (event: React.PointerEvent) => {
      const start = startRef.current;
      startRef.current = null;
      if (!start) return;
      const dx = Math.abs(event.clientX - start.x);
      const dy = Math.abs(event.clientY - start.y);
      const dt = Date.now() - start.t;
      if (dx < TAP_MAX_DISTANCE && dy < TAP_MAX_DISTANCE && dt < TAP_MAX_DURATION) {
        onTap();
      }
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onTap();
      }
    },
  };
}

type WordPanelState =
  | { status: "idle"; word: string }
  | { status: "loading"; word: string }
  | { status: "error"; word: string }
  | {
      status: "ready";
      word: string;
      data: { literal: string; contextual: string };
    };

type SentencePanelState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: { literal: string; natural: string } };

function WordPanel(props: {
  sentence: string;
  word: string;
  state: WordPanelState;
  onClose: () => void;
  onRetry: () => void;
  onSwitchWord: (word: string) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && ref.current?.contains(target)) return;
      // palavras da mesma frase reabrem o painel via click do próprio token
      if (target instanceof Node && (target as HTMLElement).closest("[data-word-token]")) return;
      props.onClose();
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [props]);

  return (
    <div
      ref={ref}
      data-word-panel
      className="mt-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2.5"
      role="region"
      aria-label={`Tradução de ${props.word}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-primary">{props.word}</span>
        <button
          type="button"
          onClick={props.onClose}
          aria-label="Fechar tradução da palavra"
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
      {props.state.status === "loading" && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Gerando tradução…
        </p>
      )}
      {props.state.status === "error" && (
        <div className="mt-1.5">
          <p className="text-xs text-destructive">Não foi possível traduzir.</p>
          <button
            type="button"
            onClick={props.onRetry}
            className="mt-1 text-xs text-primary underline underline-offset-2"
          >
            Tentar de novo
          </button>
        </div>
      )}
      {props.state.status === "ready" && (
        <dl className="mt-1.5 space-y-1.5 text-xs leading-relaxed">
          <div>
            <dt className="text-muted-foreground font-medium">Literal</dt>
            <dd>{props.state.data.literal}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground font-medium">Nesta frase</dt>
            <dd>{props.state.data.contextual}</dd>
          </div>
        </dl>
      )}
      {(props.state.status === "loading" || props.state.status === "error") && (
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          Traduzindo "{props.word}" no contexto: "{props.sentence}"
        </p>
      )}
    </div>
  );
}

function SentenceItem(props: {
  sentence: string;
  index: number;
  settings: WfdSettings;
  playing: boolean;
  loadingAudio: boolean;
  audioError: boolean;
  onPlay: () => void;
}) {
  const { sentence, index, settings } = props;
  const [openWord, setOpenWord] = useState<string | null>(null);
  const [wordPanel, setWordPanel] = useState<WordPanelState>({ status: "idle", word: "" });
  const [expanded, setExpanded] = useState(false);
  const [sentencePanel, setSentencePanel] = useState<SentencePanelState>({ status: "idle" });

  const wordMode = settings["traduzirPalavra"];
  const sentenceMode = settings["traduzirFrase"];
  const audioMode = settings["audio"];

  // trocar de frase/grupo fecha painéis abertos
  useEffect(() => {
    setOpenWord(null);
    setWordPanel({ status: "idle", word: "" });
    setExpanded(false);
    setSentencePanel({ status: "idle" });
  }, [sentence]);

  const openWordPanel = (word: string) => {
    const cached = getWordTranslation(sentence, word);
    setOpenWord(word);
    if (cached) {
      setWordPanel({ status: "ready", word, data: cached });
      return;
    }
    setWordPanel({ status: "loading", word });
    translateWordFn({ data: { sentence, word } }).then(
      (data) => {
        putWordTranslation(sentence, word, data);
        setWordPanel({ status: "ready", word, data });
      },
      () => setWordPanel({ status: "error", word }),
    );
  };

  const fetchSentence = () => {
    setSentencePanel({ status: "loading" });
    translateSentenceFn({ data: { sentence } }).then(
      (data) => {
        putSentenceTranslation(sentence, data);
        setSentencePanel({ status: "ready", data });
      },
      () => setSentencePanel({ status: "error" }),
    );
  };

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (!next) return;
    const cached = getSentenceTranslation(sentence);
    if (cached) {
      setSentencePanel({ status: "ready", data: cached });
      return;
    }
    fetchSentence();
  };

  const tokens = wordMode ? tokenize(sentence) : null;
  const expandTap = usePropositalTap(toggleExpand);

  return (
    <li
      className="rounded-md border border-border/40 bg-background/40 px-3.5 py-2.5"
      aria-labelledby={`frase-${index}`}
    >
      <div className="flex items-start gap-3">
        <span
          id={`frase-${index}`}
          className="text-xs text-muted-foreground/70 tabular-nums mt-0.5 shrink-0"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          {tokens ? (
            <p className="text-sm leading-relaxed">
              {tokens.map((token, i) => {
                if (!token.word) {
                  return <span key={`sep-${i}`}>{token.text}</span>;
                }
                const word: string = token.word;
                return (
                  <button
                    key={`${wordCacheKey(sentence, word)}-${i}`}
                    type="button"
                    data-word-token
                    aria-label={`Traduzir palavra ${word}`}
                    aria-pressed={openWord === word}
                    onClick={() => {
                      if (openWord === word) {
                        setOpenWord(null);
                        setWordPanel({ status: "idle", word: "" });
                      } else {
                        openWordPanel(word);
                      }
                    }}
                    className={
                      "rounded px-0.5 -mx-0.5 transition-colors " +
                      (openWord === word
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-primary/10 hover:text-primary")
                    }
                  >
                    {token.text}
                  </button>
                );
              })}
            </p>
          ) : sentenceMode ? (
            <span
              role="button"
              tabIndex={0}
              aria-expanded={expanded}
              aria-label={`Traduzir frase: ${sentence}`}
              className="block text-sm leading-relaxed cursor-pointer"
              {...expandTap}
            >
              {sentence}
            </span>
          ) : (
            <span className="text-sm leading-relaxed">{sentence}</span>
          )}

          {openWord && (
            <WordPanel
              sentence={sentence}
              word={wordPanel.word}
              state={wordPanel}
              onClose={() => {
                setOpenWord(null);
                setWordPanel({ status: "idle", word: "" });
              }}
              onRetry={() => openWordPanel(wordPanel.word)}
              onSwitchWord={openWordPanel}
            />
          )}

          {expanded && (
            <div
              className="mt-2 rounded-md border border-primary/25 bg-primary/5 px-3 py-2.5"
              role="region"
              aria-label="Tradução da frase"
            >
              {sentencePanel.status === "loading" && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Gerando tradução…
                </p>
              )}
              {sentencePanel.status === "error" && (
                <div>
                  <p className="text-xs text-destructive">Não foi possível traduzir a frase.</p>
                  <button
                    type="button"
                    onClick={fetchSentence}
                    className="mt-1 text-xs text-primary underline underline-offset-2"
                  >
                    Tentar de novo
                  </button>
                </div>
              )}
              {sentencePanel.status === "ready" && (
                <dl className="space-y-1.5 text-xs leading-relaxed">
                  <div>
                    <dt className="text-muted-foreground font-medium">Tradução</dt>
                    <dd>{sentencePanel.data.literal}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground font-medium">Como diria em português</dt>
                    <dd>{sentencePanel.data.natural}</dd>
                  </div>
                </dl>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {sentenceMode && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? "Recolher tradução da frase" : "Traduzir frase"}
              onClick={toggleExpand}
              className={
                "rounded-md p-1.5 transition-colors " +
                (expanded
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10")
              }
            >
              <ChevronDown
                className={"size-4 transition-transform " + (expanded ? "rotate-180" : "")}
              />
            </button>
          )}
          {audioMode && (
            <button
              type="button"
              onClick={props.onPlay}
              aria-pressed={props.playing}
              aria-label={
                props.playing ? `Parar áudio da frase ${index + 1}` : `Ouvir frase ${index + 1}`
              }
              className={
                "rounded-md p-1.5 transition-colors " +
                (props.playing
                  ? "text-primary bg-primary/15"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10")
              }
            >
              {props.loadingAudio ? (
                <Loader2 className="size-4 animate-spin" />
              ) : props.playing ? (
                <Square className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {audioMode && props.audioError && (
        <p className="mt-1.5 pl-8 text-[11px] text-destructive">
          Não foi possível gerar o áudio — toque de novo.
        </p>
      )}
    </li>
  );
}

export function SentenceList(props: { sentences: string[]; settings: WfdSettings }) {
  const { sentences, settings } = props;
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [errorIndex, setErrorIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingIndex(null);
  };

  const play = async (index: number) => {
    if (playingIndex === index) {
      stop();
      return;
    }
    stop();
    setErrorIndex(null);
    setLoadingIndex(index);
    try {
      const url = await getAudioUrl(sentences[index]!, settings["voz"], settings["acento"]);
      const audio = new Audio(url);
      audio.playbackRate = settings["velocidade"];
      audio.onended = () => setPlayingIndex((prev) => (prev === index ? null : prev));
      audioRef.current = audio;
      await audio.play();
      setPlayingIndex(index);
    } catch {
      setErrorIndex(index);
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <ul className="space-y-3">
      {sentences.map((sentence, i) => (
        <SentenceItem
          key={`${sentenceCacheKey(sentence)}-${i}`}
          sentence={sentence}
          index={i}
          settings={settings}
          playing={playingIndex === i}
          loadingAudio={loadingIndex === i}
          audioError={errorIndex === i}
          onPlay={() => void play(i)}
        />
      ))}
    </ul>
  );
}
