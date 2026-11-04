import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Result, type ResultRef } from '../../src/components/result/result';

test('renders status, title, subtitle, actions and detailed content', () => {
  let clicks = 0;
  const { container } = render(
    <Result
      status="success"
      title="Saved"
      subTitle="Changes are live"
      extra={
        <button
          type="button"
          onClick={() => {
            clicks += 1;
          }}
        >
          Continue
        </button>
      }
    >
      Reference 824
    </Result>,
  );
  expect(container.querySelector('[data-tao-status="success"]')).toBeTruthy();
  expect(screen.getByText('Changes are live')).toBeTruthy();
  expect(screen.getByText('Reference 824')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(clicks).toBe(1);
});

test('custom status icon is rendered and null/false suppress normal icons', () => {
  const { container, rerender } = render(
    <Result icon={<span>Custom icon</span>} />,
  );
  expect(screen.getByText('Custom icon')).toBeTruthy();
  rerender(<Result icon={null} />);
  expect(container.querySelector('[data-tao-result-icon]')).toBeNull();
  rerender(<Result icon={false} />);
  expect(container.querySelector('[data-tao-result-icon]')).toBeNull();
});

test('exception statuses use their dedicated image even when icon is customized', () => {
  const { rerender } = render(<Result status={403} icon={null} />);
  expect(screen.getByText('403')).toBeTruthy();
  rerender(<Result status="404" icon={<span>Ignored for exception</span>} />);
  expect(screen.getByText('404')).toBeTruthy();
  expect(screen.queryByText('Ignored for exception')).toBeNull();
  rerender(<Result status={500} />);
  expect(screen.getByText('500')).toBeTruthy();
});

test('exports independently renderable exception images', () => {
  render(
    <>
      <Result.PRESENTED_IMAGE_403 />
      <Result.PRESENTED_IMAGE_404 />
      <Result.PRESENTED_IMAGE_500 />
    </>,
  );
  expect(screen.getByText('403')).toBeTruthy();
  expect(screen.getByText('404')).toBeTruthy();
  expect(screen.getByText('500')).toBeTruthy();
});

test('passes aria/data attributes and exposes nativeElement ref', () => {
  const ref = createRef<ResultRef>();
  const { container } = render(
    <Result ref={ref} aria-label="Save result" data-testid="result" />,
  );
  expect(screen.getByTestId('result').getAttribute('aria-label')).toBe(
    'Save result',
  );
  expect(ref.current?.nativeElement).toBe(container.firstElementChild);
});

test('semantic callbacks see resolved defaults and support all content slots', () => {
  const { container } = render(
    <Result
      title={0}
      subTitle="Subtitle"
      extra="Actions"
      rootClassName="host-result"
      classNames={({ props }) => ({
        root: `status-${props.status}`,
        subTitle: 'custom-subtitle',
        body: 'custom-body',
      })}
      styles={{ title: { color: 'red' }, root: { margin: 8 } }}
      style={{ margin: 12 }}
    >
      Details
    </Result>,
  );
  expect((container.firstElementChild as HTMLElement).className).toContain(
    'status-info',
  );
  expect((container.firstElementChild as HTMLElement).style.margin).toBe(
    '12px',
  );
  expect(screen.getByText('Subtitle').className).toContain('custom-subtitle');
  expect(screen.getByText('0').style.color).toBe('red');
});
