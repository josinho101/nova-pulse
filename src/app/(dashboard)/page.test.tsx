import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import messages from "@/messages/en.json";

vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: keyof typeof messages) => {
    const scoped = messages[namespace] as Record<string, string>;
    return (key: string) => scoped[key];
  },
}));

const { default: Home } = await import("./page");

describe("Home", () => {
  it("renders the app name", async () => {
    render(await Home());
    expect(screen.getByText("Nova Pulse")).toBeInTheDocument();
  });
});
