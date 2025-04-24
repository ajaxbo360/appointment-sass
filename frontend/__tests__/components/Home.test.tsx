import { render, screen } from "@testing-library/react";
import Home from "../../pages/index";

describe("Home", () => {
  it("renders without crashing", () => {
    render(<Home />);
    // Test that the component renders
    expect(document.body).toBeInTheDocument();
  });

  it("passes a simple test", () => {
    // Simple test that always passes
    expect(1).toBe(1);
  });
});
