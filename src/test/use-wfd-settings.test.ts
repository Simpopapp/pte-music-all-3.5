// Testes do hook de preferências (project8): defaults, persistência e merge.
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SETTINGS_STORAGE_KEY,
  defaultSettings,
  readStoredSettings,
  useWfdSettings,
} from "@/hooks/use-wfd-settings";

function resetStorage() {
  window.localStorage.clear();
}

beforeEach(resetStorage);
afterEach(resetStorage);

describe("useWfdSettings", () => {
  it("usa os defaults quando não há nada salvo", async () => {
    const { result } = renderHook(() => useWfdSettings());
    await waitFor(() => {
      expect(result.current[0]).toEqual(defaultSettings);
    });
  });

  it("persiste mudanças no localStorage imediatamente", async () => {
    const { result } = renderHook(() => useWfdSettings());
    await waitFor(() => {
      expect(result.current[0]).toEqual(defaultSettings);
    });
    act(() => {
      result.current[1]({ traduzirPalavra: true, voz: "masculina" });
    });
    const stored = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY)!);
    expect(stored).toMatchObject({ traduzirPalavra: true, voz: "masculina" });
    expect(stored).toMatchObject({ traduzirFrase: defaultSettings["traduzirFrase"] });
  });

  it("lê as preferências salvas (sobrevive a reload)", async () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ traduzirFrase: true, velocidade: 0.75 }),
    );
    expect(readStoredSettings()).toEqual({
      ...defaultSettings,
      traduzirFrase: true,
      velocidade: 0.75,
    });
  });

  it("merge com defaults quando o storage tem dados parciais ou inválidos", () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ voz: " Feminina ", velocidade: 42, audio: true }),
    );
    const settings = readStoredSettings();
    expect(settings["voz"]).toBe("feminina"); // valor inválido → default
    expect(settings["velocidade"]).toBe(1); // fora da lista → default
    expect(settings["audio"]).toBe(true);
  });

  it("update parcial preserva os demais campos", async () => {
    const { result } = renderHook(() => useWfdSettings());
    await waitFor(() => {
      expect(result.current[0]).toEqual(defaultSettings);
    });
    act(() => {
      result.current[1]({ traduzirPalavra: true });
    });
    act(() => {
      result.current[1]({ acento: "neutro" });
    });
    expect(result.current[0]["traduzirPalavra"]).toBe(true);
    expect(result.current[0]["acento"]).toBe("neutro");
    expect(result.current[0]["voz"]).toBe("feminina");
  });
});
