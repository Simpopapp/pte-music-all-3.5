// Server-only: TTS (voz australiana, masculina/feminina) via Lovable AI Gateway.
// Formato padrão "gemini" (default-model-knowledge): corpo contents/generationConfig,
// sem stream_format → resposta WAV completa.
export type VoiceGender = "feminina" | "masculina";
export type VoiceAccent = "australiano" | "neutro";

const TTS_MODEL = "google/gemini-3.1-flash-tts-preview";
const TTS_BASE_URL = "https://ai.gateway.lovable.dev";

const VOICES: Record<VoiceGender, string> = {
  feminina: "Aoede",
  masculina: "Puck",
};

export class TtsError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function synthesizeSpeech(
  text: string,
  gender: VoiceGender,
  accent: VoiceAccent,
): Promise<ArrayBuffer> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new TtsError("Chave de áudio indisponível", 500);

  // Gemini TTS controla sotaque via instrução no texto falado.
  const spoken = accent === "australiano" ? `Say with an Australian accent: ${text}` : text;

  const response = await fetch(`${TTS_BASE_URL}/v1/audio/speech`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TTS_MODEL,
      contents: [{ role: "user", parts: [{ text: spoken }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICES[gender] } },
        },
      },
    }),
  });

  if (!response.ok) {
    let message = `Falha ao gerar áudio (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string; error?: { message?: string } };
      message = body.message ?? body.error?.message ?? message;
    } catch {
      // mantém mensagem padrão
    }
    throw new TtsError(message, response.status);
  }
  return response.arrayBuffer();
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
