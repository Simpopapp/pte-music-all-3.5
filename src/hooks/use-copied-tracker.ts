import { useCallback, useEffect, useState } from "react";
import type { GroupVersionId } from "@/data/wfd-group-versions";

export type CopyCategory = "letra" | "ritmos";

/** Chave versionada do registro local dos botões já usados (project7). */
export const COPIED_STORAGE_KEY = "wfd-copiados-v1";

/** Chave composta de um botão de cópia, ex.: "A-3-letra". */
export function buildCopyKey(tipo: GroupVersionId, grupo: number, categoria: CopyCategory): string {
  return `${tipo}-${grupo}-${categoria}`;
}

/** Parse tolerante do registro persistido; entradas inválidas são descartadas. */
export function parseCopied(raw: string | null): Record<string, boolean> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "boolean") out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

/** Próximo grupo (menor número) ainda não copiado; null quando tudo foi usado. */
export function findNextGroup(
  copied: Record<string, boolean>,
  tipo: GroupVersionId,
  categoria: CopyCategory,
  groupCount: number,
): number | null {
  for (let grupo = 1; grupo <= groupCount; grupo += 1) {
    if (!copied[buildCopyKey(tipo, grupo, categoria)]) return grupo;
  }
  return null;
}

/** Quantos grupos de um tipo/categoria já foram copiados. */
export function countCopied(
  copied: Record<string, boolean>,
  tipo: GroupVersionId,
  categoria: CopyCategory,
  groupCount: number,
): number {
  let total = 0;
  for (let grupo = 1; grupo <= groupCount; grupo += 1) {
    if (copied[buildCopyKey(tipo, grupo, categoria)]) total += 1;
  }
  return total;
}

/**
 * Registro de cópias somente no navegador (localStorage), conforme project7.
 * SSR-safe: a leitura acontece em useEffect, nunca durante o render.
 */
export function useCopiedTracker() {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCopied(parseCopied(window.localStorage.getItem(COPIED_STORAGE_KEY)));
    } catch {
      // localStorage indisponível: segue sem persistência
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(COPIED_STORAGE_KEY, JSON.stringify(copied));
    } catch {
      // gravação falhou (ex.: modo privado): estado da sessão permanece
    }
  }, [copied, hydrated]);

  const markCopied = useCallback((tipo: GroupVersionId, grupo: number, categoria: CopyCategory) => {
    setCopied((prev) => ({
      ...prev,
      [buildCopyKey(tipo, grupo, categoria)]: true,
    }));
  }, []);

  const isCopied = useCallback(
    (tipo: GroupVersionId, grupo: number, categoria: CopyCategory) =>
      Boolean(copied[buildCopyKey(tipo, grupo, categoria)]),
    [copied],
  );

  return { copied, hydrated, isCopied, markCopied };
}
