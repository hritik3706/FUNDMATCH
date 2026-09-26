import { z } from "zod";
import { HttpError } from "../middleware/httpError";
import {
  countSchemes,
  findSchemeById,
  listSchemes,
} from "../repositories/scheme.repository";
import { Scheme, SchemeSummary } from "../types/scheme.types";

export async function getSchemes(): Promise<{
  schemes: SchemeSummary[];
  totalCount: number;
}> {
  const [schemes, totalCount] = await Promise.all([
    listSchemes(),
    countSchemes(),
  ]);
  return { schemes, totalCount };
}

export async function getScheme(schemeId: string): Promise<Scheme> {
  if (!z.string().uuid().safeParse(schemeId).success) {
    throw new HttpError(404, "Scheme not found");
  }

  const scheme = await findSchemeById(schemeId);
  if (!scheme) {
    throw new HttpError(404, "Scheme not found");
  }
  return scheme;
}
