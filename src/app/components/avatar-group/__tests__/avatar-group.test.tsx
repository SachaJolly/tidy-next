import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AvatarGroup from "@/app/components/avatar-group/avatar-group";

describe("AvatarGroup", () => {
  const mockAvatars = [
    { src: "", alt: "John Doe", initials: "JD" },
    { src: "", alt: "Alice Brown", initials: "AB" },
    { src: "", alt: "Charlie Davis", initials: "CD" },
  ];

  it("renders all avatars", () => {
    render(<AvatarGroup avatars={mockAvatars} />);

    mockAvatars.forEach((avatar) => {
      expect(screen.getByText(avatar.initials)).toBeInTheDocument();
    });
  });

  it("applies custom className", () => {
    const customClass = "custom-class";
    const { container } = render(
      <AvatarGroup avatars={mockAvatars} className={customClass} />,
    );

    expect(container.firstChild).toHaveClass(customClass);
  });

  it("renders with different sizes", () => {
    const sizes = ["24", "32", "56", "96"] as const;

    sizes.forEach((size) => {
      const { container } = render(
        <AvatarGroup avatars={mockAvatars} size={size} />,
      );

      const avatarElements = container.querySelectorAll(
        `[class*='is-${size}']`,
      );
      expect(avatarElements.length).toBe(mockAvatars.length);
    });
  });
});
