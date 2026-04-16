import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import SquareCropModal from "@/components/SquareCropModal";
import { renderWithI18n } from "../helpers";

beforeEach(() => {
  // Stub canvas APIs used by cropImageToSquare.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillStyle: "",
    fillRect: vi.fn(),
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,AAAA",
  );

  // Simulate successful image load.
  const origSrc = Object.getOwnPropertyDescriptor(
    HTMLImageElement.prototype,
    "src",
  );
  Object.defineProperty(HTMLImageElement.prototype, "src", {
    configurable: true,
    set(this: HTMLImageElement) {
      Object.defineProperty(this, "naturalWidth", { value: 200 });
      Object.defineProperty(this, "naturalHeight", { value: 100 });
      setTimeout(() => this.onload?.(new Event("load")), 0);
    },
  });
  (globalThis as unknown as { __origSrc?: PropertyDescriptor }).__origSrc = origSrc ?? undefined;
});

const file = () => new File(["x"], "x.png", { type: "image/png" });

describe("SquareCropModal", () => {
  it("renders nothing without a file", () => {
    const { container } = renderWithI18n(
      <SquareCropModal file={null} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the crop viewport once the image loads", async () => {
    renderWithI18n(
      <SquareCropModal file={file()} onConfirm={vi.fn()} onCancel={vi.fn()} />,
    );
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("calls onCancel when ESC is pressed", async () => {
    const onCancel = vi.fn();
    renderWithI18n(
      <SquareCropModal file={file()} onConfirm={vi.fn()} onCancel={onCancel} />,
    );
    await waitFor(() => screen.getByRole("dialog"));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel via the cancel button", async () => {
    const onCancel = vi.fn();
    renderWithI18n(
      <SquareCropModal file={file()} onConfirm={vi.fn()} onCancel={onCancel} />,
    );
    await waitFor(() => screen.getByRole("dialog"));
    fireEvent.click(screen.getByText(/cancel|取消/i));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onConfirm with a cropped image", async () => {
    const onConfirm = vi.fn();
    renderWithI18n(
      <SquareCropModal file={file()} onConfirm={onConfirm} onCancel={vi.fn()} />,
    );
    await waitFor(() => screen.getByRole("dialog"));
    fireEvent.click(screen.getByText(/crop|確認|确认/i));
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    const [arg] = onConfirm.mock.calls[0];
    expect(arg).toBeInstanceOf(HTMLImageElement);
  });
});
