import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dist = join(import.meta.dirname, "../../dist");
const read = (p: string) => readFileSync(join(dist, p), "utf8");

function pngSize(p: string): [number, number] {
  const buf = readFileSync(join(dist, p));
  expect(buf.subarray(1, 4).toString("ascii")).toBe("PNG");
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

describe("built PWA", () => {
  it("manifest is installable", () => {
    const manifest = JSON.parse(read("manifest.webmanifest"));
    expect(manifest.name).toBe("Treino Miudinha");
    expect(manifest.short_name).toBe("Miudinha");
    expect(manifest.display).toBe("standalone");

    for (const size of [192, 512]) {
      const icon = manifest.icons.find((i: { sizes: string }) => i.sizes === `${size}x${size}`);
      expect(icon, `${size} icon`).toBeDefined();
      expect(pngSize(icon.src)).toEqual([size, size]);
    }

    const html = read("index.html");
    const touch = html.match(/<link rel="apple-touch-icon" href="\/?([^"]+)"/);
    expect(touch).not.toBeNull();
    expect(existsSync(join(dist, touch![1]))).toBe(true);
    expect(html).toMatch(/<link rel="manifest" href="\/manifest\.webmanifest"/);
  });

  it("service worker precaches the app shell", () => {
    const sw = read("sw.js");
    const precached = (url: string) => sw.includes(`url:"${url}"`);
    expect(precached("index.html")).toBe(true);

    const assets = readdirSync(join(dist, "assets")).filter((f) => /\.(js|css|woff2?)$/.test(f));
    expect(assets.some((f) => f.endsWith(".js"))).toBe(true);
    expect(assets.some((f) => f.endsWith(".css"))).toBe(true);
    expect(assets.some((f) => /\.woff2?$/.test(f))).toBe(true);
    const missing = assets.filter((f) => !precached(`assets/${f}`));
    expect(missing).toEqual([]);

    expect(sw).toMatch(/NavigationRoute\([^)]*createHandlerBoundToURL\("index\.html"\)/);
  });
});
