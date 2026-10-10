import packageJson from "../../../package.json";

export function GET() {
  return Response.json({ ok: true, version: packageJson.version });
}
