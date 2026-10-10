/** Fallback when ANTHROPIC_MODEL and --model are unset. Matches the non-deprecated default from the pipeline fix. */
export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-5-5";

export function resolveAnthropicModel(flag?: string): string {
  const fromFlag = flag && flag !== "true" ? flag.trim() : "";
  const fromEnv = process.env.ANTHROPIC_MODEL?.trim() ?? "";
  return fromFlag || fromEnv || DEFAULT_ANTHROPIC_MODEL;
}
