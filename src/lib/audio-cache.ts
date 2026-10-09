// Cache de áudio (Blob URL) por frase+voz+sotaque — só na sessão atual.
// Evita re-gerar o mesmo áudio dentro da mesma visita.
import { speakSentenceFn } from "@/lib/ai/tts.functions";
import type { VoiceAccent, VoiceGender } from "@/hooks/use-wfd-settings";

const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

export function clearAudioCache(): void {
  for (const url of cache.values()) URL.revokeObjectURL(url);
  cache.clear();
}

export async function getAudioUrl(
  sentence: string,
  gender: VoiceGender,
  accent: VoiceAccent,
): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("Áudio só é reproduzido no navegador");
  }
  const key = `${gender}|${accent}|${sentence}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const running = inFlight.get(key);
  if (running) return running;

  const promise = (async (): Promise<string> => {
    const result = await speakSentenceFn({
      data: { sentence, gender, accent },
    });
    const bytes = Uint8Array.from(atob(result.audioBase64), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
    cache.set(key, url);
    inFlight.delete(key);
    return url;
  })();
  inFlight.set(key, promise);
  try {
    return await promise;
  } catch (error) {
    inFlight.delete(key);
    throw error;
  }
}
