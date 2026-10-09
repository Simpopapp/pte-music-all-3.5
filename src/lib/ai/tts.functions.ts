// Cliente-importável: função server de TTS (áudio volta como WAV base64).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const voiceGenderSchema = z.enum(["feminina", "masculina"]);
const voiceAccentSchema = z.enum(["australiano", "neutro"]);

export type SpeakInput = {
  sentence: string;
  gender: z.infer<typeof voiceGenderSchema>;
  accent: z.infer<typeof voiceAccentSchema>;
};

export type SpeakResult = {
  audioBase64: string;
  gender: z.infer<typeof voiceGenderSchema>;
  accent: z.infer<typeof voiceAccentSchema>;
};

export const speakSentenceFn = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        sentence: z.string().min(1).max(400),
        gender: voiceGenderSchema,
        accent: voiceAccentSchema,
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<SpeakResult> => {
    const { synthesizeSpeech, arrayBufferToBase64 } = await import("./tts.server");
    const buffer = await synthesizeSpeech(data.sentence, data.gender, data.accent);
    return {
      audioBase64: arrayBufferToBase64(buffer),
      gender: data.gender,
      accent: data.accent,
    };
  });
