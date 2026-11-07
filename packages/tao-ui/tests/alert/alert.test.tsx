import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { Alert, type AlertType } from '../../src/components/alert/alert';

test('renders title and description with role alert', () => {
  render(<Alert title="Saved" description="Your changes have been saved." />);
  const alert = screen.getByRole('alert');
  expect(alert).toBeTruthy();
  expect(screen.getByText('Saved')).toBeTruthy();
  expect(screen.getByText('Your changes have been saved.')).toBeTruthy();
});

test('each type sets data-tao-type', () => {
  const types: AlertType[] = ['success', 'info', 'warning', 'error'];
  for (const type of types) {
    const { container, unmount } = render(<Alert type={type} title={type} />);
    const alert = container.querySelector('[data-tao-alert]') as HTMLElement;
    expect(alert.dataset.taoType).toBe(type);
    unmount();
  }
});

test('defaults to info type', () => {
  const { container } = render(<Alert title="Default" />);
  const alert = container.querySelector('[data-tao-alert]') as HTMLElement;
  expect(alert.dataset.taoType).toBe('info');
});

test('showIcon renders per-type status icon', () => {
  const { container } = render(<Alert type="success" title="Done" showIcon />);
  const icon = container.querySelector('[data-tao-alert-icon]') as HTMLElement;
  expect(icon).toBeTruthy();
  expect(icon.querySelector('svg')).toBeTruthy();
});

test('does not render icon by default', () => {
  const { container } = render(<Alert title="Plain" />);
  expect(container.querySelector('[data-tao-alert-icon]')).toBeNull();
});

test('boolean conditional content leaves no empty alert slots', () => {
  const { rerender } = render(
    <Alert
      title="Saved"
      description={false}
      action={false}
      icon={false}
      showIcon
    />,
  );
  const alert = screen.getByRole('alert');
  expect(alert).not.toHaveAttribute('data-tao-with-description');
  for (const part of ['description', 'action', 'icon']) {
    expect(alert.querySelector(`[data-tao-alert-${part}]`)).toBeNull();
  }

  rerender(<Alert title={0} description={0} action={0} icon={0} />);
  for (const part of ['title', 'description', 'action', 'icon']) {
    expect(alert.querySelector(`[data-tao-alert-${part}]`)).toHaveTextContent(
      '0',
    );
  }
});

test('custom icon overrides the per-type default', () => {
  const { container } = render(
    <Alert
      type="warning"
      title="Custom"
      icon={<span data-testid="custom-icon">★</span>}
    />,
  );
  expect(screen.getByTestId('custom-icon')).toBeTruthy();
  const icon = container.querySelector('[data-tao-alert-icon]') as HTMLElement;
  expect(icon.querySelector('svg')).toBeNull();
});

test('closable renders close button, click calls onClose and unmounts', () => {
  const onClose = rstest.fn();
  render(<Alert title="Closable" closable onClose={onClose} />);
  const closeBtn = screen.getByLabelText('Close');
  expect(closeBtn).toBeTruthy();
  fireEvent.click(closeBtn);
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('alert')).toBeNull();
});

test('does not render close button by default', () => {
  render(<Alert title="Static" />);
  expect(screen.queryByLabelText('Close')).toBeNull();
});

test('a canceled close leaves the alert visible', () => {
  render(
    <Alert
      title="Unsaved changes"
      closable
      onClose={(event) => event.preventDefault()}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Unsaved changes');
});

test('action slot renders', () => {
  render(
    <Alert title="With action" action={<button type="button">Undo</button>} />,
  );
  expect(screen.getByText('Undo')).toBeTruthy();
});

test('semantic classNames apply', () => {
  const { container } = render(
    <Alert
      title="Styled"
      description="With description"
      showIcon
      closable
      action={<span>act</span>}
      classNames={{
        root: 'my-root',
        icon: 'my-icon',
        title: 'my-title',
        description: 'my-description',
        action: 'my-action',
        close: 'my-close',
      }}
    />,
  );
  expect(
    (container.querySelector('[data-tao-alert]') as HTMLElement).className,
  ).toContain('my-root');
  expect(
    (container.querySelector('[data-tao-alert-icon]') as HTMLElement).className,
  ).toContain('my-icon');
  expect(
    (container.querySelector('[data-tao-alert-title]') as HTMLElement)
      .className,
  ).toContain('my-title');
  expect(
    (container.querySelector('[data-tao-alert-description]') as HTMLElement)
      .className,
  ).toContain('my-description');
  expect(
    (container.querySelector('[data-tao-alert-action]') as HTMLElement)
      .className,
  ).toContain('my-action');
  expect(
    (container.querySelector('[data-tao-alert-close]') as HTMLElement)
      .className,
  ).toContain('my-close');
});

test('semantic styles apply', () => {
  const { container } = render(
    <Alert
      title="Styled"
      styles={{ root: { marginTop: 8 }, title: { letterSpacing: '1px' } }}
    />,
  );
  const alert = container.querySelector('[data-tao-alert]') as HTMLElement;
  expect(alert.style.marginTop).toBe('8px');
  const title = container.querySelector(
    '[data-tao-alert-title]',
  ) as HTMLElement;
  expect(title.style.letterSpacing).toBe('1px');
});

test('className and style merge onto root', () => {
  const { container } = render(
    <Alert title="Merged" className="outer" style={{ opacity: 0.5 }} />,
  );
  const alert = container.querySelector('[data-tao-alert]') as HTMLElement;
  expect(alert.className).toContain('outer');
  expect(alert.style.opacity).toBe('0.5');
});
