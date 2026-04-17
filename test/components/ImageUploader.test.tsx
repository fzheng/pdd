import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageUploader from "@/components/ImageUploader";
import { renderWithI18n } from "../helpers";

describe("ImageUploader", () => {
  it("renders the drop-zone prompt when idle", () => {
    renderWithI18n(<ImageUploader onImageSelected={vi.fn()} />);
    // The drop-zone's prompt appears in multiple places (the big target
    // and the inner call-to-action button); at least one must be visible.
    expect(screen.getAllByText(/drop|拖/i).length).toBeGreaterThan(0);
  });

  it("calls onImageSelected with a PNG file when picked via input", async () => {
    const onImageSelected = vi.fn();
    const { container } = renderWithI18n(
      <ImageUploader onImageSelected={onImageSelected} />,
    );
    const input = container.querySelector("input[type='file']") as HTMLInputElement;
    const file = new File(["x"], "cat.png", { type: "image/png" });
    await userEvent.upload(input, file);
    expect(onImageSelected).toHaveBeenCalledOnce();
    expect(onImageSelected.mock.calls[0][0].name).toBe("cat.png");
  });

  it("ignores non-image file types", async () => {
    const onImageSelected = vi.fn();
    const { container } = renderWithI18n(
      <ImageUploader onImageSelected={onImageSelected} />,
    );
    const input = container.querySelector("input[type='file']") as HTMLInputElement;
    const bad = new File(["x"], "doc.pdf", { type: "application/pdf" });
    await userEvent.upload(input, bad);
    expect(onImageSelected).not.toHaveBeenCalled();
  });

  it("handles drag + drop", () => {
    const onImageSelected = vi.fn();
    const { container } = renderWithI18n(
      <ImageUploader onImageSelected={onImageSelected} />,
    );
    // The interactive drop target is the role=button element in the layout.
    const zone = container.querySelector('[role="button"]') as HTMLElement;
    const file = new File(["x"], "dog.jpg", { type: "image/jpeg" });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(onImageSelected).toHaveBeenCalledOnce();
  });
});
