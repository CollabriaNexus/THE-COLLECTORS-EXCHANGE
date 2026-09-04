import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../Toast';

vi.useFakeTimers();

const TestConsumer = () => {
  const showToast = useToast();
  return (
    <div>
      <button onClick={() => showToast('Success!', 'success')}>add success</button>
      <button onClick={() => showToast('Error!', 'error')}>add error</button>
      <button onClick={() => showToast('Info!', 'info')}>add info</button>
      <button onClick={() => showToast('Warning!', 'warning')}>add warning</button>
      <button onClick={() => showToast('Custom!', 'success', 1000)}>add custom</button>
    </div>
  );
};

describe('Toast', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders children', () => {
    render(
      <ToastProvider>
        <div>child</div>
      </ToastProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('adds and displays a toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add success'));
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('adds error toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add error'));
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('adds info toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add info'));
    expect(screen.getByText('Info!')).toBeInTheDocument();
  });

  it('adds warning toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add warning'));
    expect(screen.getByText('Warning!')).toBeInTheDocument();
  });

  // DESIGN.md §5.3: 5 seconds for success, not the old flat 4 seconds.
  it('keeps a success toast up for 5 seconds', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add success'));
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(screen.getByText('Success!')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  // DESIGN.md §5.3: errors are persistent. A failure message that vanishes
  // before it can be read is the same as no message at all.
  it('never auto-dismisses an error toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add error'));
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('still honours an explicitly passed duration', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add custom'));
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(screen.queryByText('Custom!')).not.toBeInTheDocument();
  });

  it('closes toast on dismiss button click', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add success'));
    const dismissBtn = screen.getByRole('button', { name: /close notification/i });
    fireEvent.click(dismissBtn);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('dismisses a persistent error toast on demand', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add error'));
    fireEvent.click(screen.getByRole('button', { name: /close notification/i }));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByText('Error!')).not.toBeInTheDocument();
  });

  // The container used to carry role="alert" AND aria-live="polite", which
  // contradict each other. The announcement now lives on each toast: assertive
  // for errors, polite status for everything else.
  it('announces errors assertively and everything else politely', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('add error'));
    expect(screen.getByRole('alert')).toHaveTextContent('Error!');

    fireEvent.click(screen.getByText('add success'));
    expect(screen.getByRole('status')).toHaveTextContent('Success!');
  });

  // The dismiss control was the text glyph `&times;`, which missed the global
  // `button:has(svg:only-child)` 44px touch rule and left a ~10px target.
  it('renders the dismiss control as an svg-only button', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('add success'));
    const dismissBtn = screen.getByRole('button', { name: /close notification/i });
    expect(dismissBtn.children).toHaveLength(1);
    expect(dismissBtn.firstElementChild.tagName.toLowerCase()).toBe('svg');
    expect(dismissBtn.textContent).toBe('');
  });

  // The stack used to be `bottom-6 right-6`, sitting on top of the mobile tab
  // bar (Cart/Account) and the two floating buttons in Layout.
  it('anchors the stack to the top, clear of the mobile tab bar', () => {
    const { container } = render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    const stack = container.querySelector('.z-\\[9999\\]');
    expect(stack).toBeTruthy();
    expect(stack.className).not.toMatch(/\bbottom-/);
    expect(stack.style.top).toContain('--header-h');
  });
});

describe('useToast outside provider', () => {
  it('returns null when used outside provider', () => {
    const TestOutside = () => {
      const result = useToast();
      return <div data-testid="toast-value">{result === null ? 'null' : 'not-null'}</div>;
    };
    render(<TestOutside />);
    expect(screen.getByTestId('toast-value').textContent).toBe('null');
  });
});
