import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import ColorTile from "@/components/ColorTile";
import { WHITE } from "../fixtures";
import { renderWithI18n } from "../helpers";

describe("ColorTile", () => {
  it("renders the swatch, localized name, SKU, and count", () => {
    renderWithI18n(
      <ColorTile color={WHITE} count={42} variant="row" />,
    );
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("fires onSelect when clickable and clicked", () => {
    const onSelect = vi.fn();
    renderWithI18n(
      <ColorTile
        color={WHITE}
        count={10}
        variant="row"
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledWith(WHITE);
  });

  it("does not fire onSelect when not clickable", () => {
    const onSelect = vi.fn();
    renderWithI18n(
      <ColorTile color={WHITE} count={10} variant="row" />,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders the 'grid' variant as a tile (swatch above SKU)", () => {
    const onSelect = vi.fn();
    const { container } = renderWithI18n(
      <ColorTile
        color={WHITE}
        count={10}
        variant="grid"
        onSelect={onSelect}
      />,
    );
    expect(container.querySelector('[data-variant="grid"]')).not.toBeNull();
  });

  it("marks the active tile visually", () => {
    const { container } = renderWithI18n(
      <ColorTile
        color={WHITE}
        count={10}
        variant="grid"
        active
        onSelect={vi.fn()}
      />,
    );
    expect(container.querySelector('[data-active="true"]')).not.toBeNull();
  });
});
