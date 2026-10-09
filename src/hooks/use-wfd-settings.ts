// Preferências do app (aba Settings) — persistência no navegador, SSR-safe.
// Leitura só em useEffect (nunca typeof window no render — regra do AGENTS.md).
import { useCallback, useEffect, useState } from "react";

export type VoiceGender = "feminina" | "masculina";
export type VoiceAccent = "australiano" | "neutro";
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25;

export interface WfdSettings {
  /** Tradução individual: clicar em uma palavra mostra literal + contextual. */
  traduzirPalavra: boolean;
  /** Tradução de frases: toque proposital expande o card com literal + natural. */
  traduzirFrase: boolean;
  /** Áudio das frases (play por frase). */
  audio: boolean;
  /** Voz masculina ou feminina. */
  voz: VoiceGender;
  /** Sotaque de pronúncia. */
  acento: VoiceAccent;
  /** Velocidade de reprodução. */
  velocidade: PlaybackSpeed;
}

export const SETTINGS_STORAGE_KEY = "wfd-settings-v1";

export const defaultSettings: WfdSettings = {
  traduzirPalavra: false,
  traduzirFrase: false,
  audio: true,
  voz: "feminina",
  acento: "australiano",
  velocidade: 1,
};

const SPEED_VALUES: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25];

function parseSettings(raw: unknown): WfdSettings {
  if (typeof raw !== "object" || raw === null) return defaultSettings;
  const obj = raw as Record<string, unknown>;
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
  const voz = obj["voz"] === "masculina" ? "masculina" : "feminina";
  const acento = obj["acento"] === "neutro" ? "neutro" : "australiano";
  const rawSpeed = Number(obj["velocidade"]);
  const velocidade = SPEED_VALUES.includes(rawSpeed as PlaybackSpeed)
    ? (rawSpeed as PlaybackSpeed)
    : defaultSettings["velocidade"];
  return {
    traduzirPalavra: bool(obj["traduzirPalavra"], defaultSettings["traduzirPalavra"]),
    traduzirFrase: bool(obj["traduzirFrase"], defaultSettings["traduzirFrase"]),
    audio: bool(obj["audio"], defaultSettings["audio"]),
    voz,
    acento,
    velocidade,
  };
}

export function readStoredSettings(): WfdSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return parseSettings(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultSettings;
  }
}

export function persistSettings(settings: WfdSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage indisponível (modo privado/quota) — preferências ficam só em memória
  }
}

export type WfdSettingsState = [WfdSettings, (patch: Partial<WfdSettings>) => void];

export function useWfdSettings(): WfdSettingsState {
  const [settings, setSettings] = useState<WfdSettings>(defaultSettings);

  useEffect(() => {
    setSettings(readStoredSettings());
  }, []);

  const update = useCallback((patch: Partial<WfdSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persistSettings(next);
      return next;
    });
  }, []);

  return [settings, update];
}
