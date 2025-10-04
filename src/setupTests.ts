import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import 'jest-environment-jsdom';

const customMatchers = {
  toHaveStyle(received: HTMLElement, style: Record<string, string>) {
    const hasStyle = Object.entries(style).every(([prop, value]) => {
      const computedStyle = window.getComputedStyle(received);
      return computedStyle[prop as any] === value;
    });
    return {
      pass: hasStyle,
      message: () => `expected element to have style ${JSON.stringify(style)}`
    };
  },

  toBeDisabled(received: HTMLElement) {
    const isDisabled = received.hasAttribute('disabled') || received.getAttribute('aria-disabled') === 'true';
    return {
      pass: isDisabled,
      message: () => `expected element to ${isDisabled ? 'not ' : ''}be disabled`
    };
  },

  toBeInTheDocument(received: HTMLElement | null) {
    const isInDocument = received && document.contains(received);
    return {
      pass: isInDocument,
      message: () => `expected element to ${isInDocument ? 'not ' : ''}be in the document`
    };
  }
};

expect.extend(customMatchers);

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveStyle(style: Record<string, string>): R;
      toBeDisabled(): R;
      toBeInTheDocument(): R;
    }
  }
}