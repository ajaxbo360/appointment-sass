import "@testing-library/jest-dom";

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock Browser Notification API if not already mocked elsewhere
if (typeof window.Notification === "undefined") {
  Object.defineProperty(window, "Notification", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      requestPermission: jest.fn().mockResolvedValue("granted"),
      permission: "granted",
      // Add other methods/properties if needed by your tests
      onclick: jest.fn(),
    })),
  });
}
