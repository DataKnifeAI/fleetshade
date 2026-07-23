import { describe, expect, it } from "vitest";
import {
  parsePriorityFromLabels,
  sortBacklog,
  topByPriority,
} from "./priority";
import type { BacklogIssue } from "../types";

function issue(
  number: number,
  priority: BacklogIssue["priority"],
  title = "x",
): BacklogIssue {
  return {
    id: `gh-${number}`,
    number,
    title,
    repo: "demo",
    priority,
  };
}

describe("parsePriorityFromLabels", () => {
  it("reads P0–P3 labels", () => {
    expect(parsePriorityFromLabels(["bug", "P0"])).toBe("P0");
    expect(parsePriorityFromLabels(["priority: p2"])).toBe("P2");
    expect(parsePriorityFromLabels(["p3"])).toBe("P3");
  });

  it("returns null when missing", () => {
    expect(parsePriorityFromLabels(["bug"])).toBeNull();
  });
});

describe("sortBacklog / topByPriority", () => {
  const sample = [
    issue(10, "P2"),
    issue(11, "P0"),
    issue(12, "P1"),
    issue(13, "P0"),
    issue(14, "P3"),
  ];

  it("orders P0 before P1 and higher numbers first within priority", () => {
    const sorted = sortBacklog(sample);
    expect(sorted.map((i) => i.number)).toEqual([13, 11, 12, 10, 14]);
  });

  it("returns top N", () => {
    expect(topByPriority(sample, 2).map((i) => i.number)).toEqual([13, 11]);
  });
});
