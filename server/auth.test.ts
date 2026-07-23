import { describe, expect, it } from "vitest";
import {
  authorizePreflight,
  authorizeRequest,
  originFromReferer,
  parseAllowlist,
  safeEqualString,
} from "./auth.mjs";

function req(headers: Record<string, string>) {
  return { headers } as import("node:http").IncomingMessage;
}

const cfg = {
  siteMarker: "test-marker-secret",
  allowedOrigins: ["https://dioptra.dataknife.net", "http://127.0.0.1:5173"],
  requireOrigin: false,
};

describe("parseAllowlist / originFromReferer", () => {
  it("parses origins", () => {
    expect(parseAllowlist("https://a.example/, http://b.example")).toEqual([
      "https://a.example",
      "http://b.example",
    ]);
  });

  it("extracts origin from referer", () => {
    expect(originFromReferer("https://dioptra.dataknife.net/path?x=1")).toBe(
      "https://dioptra.dataknife.net",
    );
  });
});

describe("authorizeRequest", () => {
  it("rejects bad marker", () => {
    const r = authorizeRequest(
      req({ "x-dioptra-site": "nope", origin: "http://127.0.0.1:5173" }),
      cfg,
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(401);
  });

  it("accepts marker + allowlisted origin", () => {
    const r = authorizeRequest(
      req({
        "x-dioptra-site": "test-marker-secret",
        origin: "https://dioptra.dataknife.net",
      }),
      cfg,
    );
    expect(r).toMatchObject({ ok: true, origin: "https://dioptra.dataknife.net" });
  });

  it("rejects disallowed origin", () => {
    const r = authorizeRequest(
      req({
        "x-dioptra-site": "test-marker-secret",
        origin: "https://evil.example",
      }),
      cfg,
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(403);
  });

  it("accepts marker without origin (same-origin GET)", () => {
    const r = authorizeRequest(req({ "x-dioptra-site": "test-marker-secret" }), cfg);
    expect(r.ok).toBe(true);
  });

  it("uses referer when origin missing", () => {
    const r = authorizeRequest(
      req({
        "x-dioptra-site": "test-marker-secret",
        referer: "http://127.0.0.1:5173/dashboard",
      }),
      cfg,
    );
    expect(r).toMatchObject({ ok: true, origin: "http://127.0.0.1:5173" });
  });
});

describe("authorizePreflight", () => {
  it("allows allowlisted origin", () => {
    expect(
      authorizePreflight(req({ origin: "http://127.0.0.1:5173" }), cfg).ok,
    ).toBe(true);
  });

  it("blocks unknown origin", () => {
    expect(authorizePreflight(req({ origin: "https://evil.example" }), cfg).ok).toBe(
      false,
    );
  });
});

describe("safeEqualString", () => {
  it("compares", () => {
    expect(safeEqualString("abc", "abc")).toBe(true);
    expect(safeEqualString("abc", "abd")).toBe(false);
  });
});
