import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ImagePreview from "@/components/ImagePreview";
import { renderWithI18n } from "../helpers";

describe("ImagePreview", () => {
  it("shows the empty-state message when no image is provided", () => {
    renderWithI18n(
      <ImagePreview imageUrl={null} canCompare={false} onOpenCompare={vi.fn()} />,
    );
    expect(screen.getByText(/upload|上传|上傳/i)).toBeInTheDocument();
  });

  it("renders the image and a disabled button when no pattern yet", () => {
    renderWithI18n(
      <ImagePreview
        imageUrl="blob:http://localhost/abc"
        canCompare={false}
        onOpenCompare={vi.fn()}
      />,
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("fires onOpenCompare when the thumbnail is clicked (after pattern is available)", () => {
    const onOpen = vi.fn();
    renderWithI18n(
      <ImagePreview
        imageUrl="blob:x"
        canCompare
        onOpenCompare={onOpen}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
