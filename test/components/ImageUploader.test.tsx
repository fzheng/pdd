import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageUploader from "@/components/ImageUploader";
import { renderWithI18n } from "../helpers";

describe("ImageUploader", () => {
  it("renders the drop-zone prompt when idle", () => {
    renderWithI18n(<ImageUploader onImageSelected={vi.fn()} />);
    expect(screen.getByText(/drop|拖/i)).toBeInTheDocument();
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
    const zone = container.firstChild as HTMLElement;
    const file = new File(["x"], "dog.jpg", { type: "image/jpeg" });
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(onImageSelected).toHaveBeenCalledOnce();
  });
});
