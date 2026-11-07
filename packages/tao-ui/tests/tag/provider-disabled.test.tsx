import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { CheckableTag, Tag } from '../../src/components/tag/tag';
import { TaoProvider } from '../../src/provider/tao-provider';

test('Tag and CheckableTag inherit provider disabled state for pointer and keyboard actions', () => {
  const onClose = rs.fn();
  const onChange = rs.fn();
  const view = render(
    <TaoProvider disabled>
      <Tag onClose={onClose}>Closable</Tag>
      <CheckableTag onChange={onChange}>Choice</CheckableTag>
    </TaoProvider>,
  );
  const close = screen.getByRole('button', { name: 'Close' });
  const choice = screen.getByRole('checkbox', { name: 'Choice' });
  expect(close).toBeDisabled();
  expect(choice).toHaveAttribute('aria-disabled', 'true');
  expect(choice).not.toHaveAttribute('tabindex', '0');
  fireEvent.click(close);
  fireEvent.click(choice);
  fireEvent.keyDown(choice, { key: ' ' });
  expect(onClose).not.toHaveBeenCalled();
  expect(onChange).not.toHaveBeenCalled();
  view.rerender(
    <TaoProvider disabled={false}>
      <Tag onClose={onClose}>Closable</Tag>
      <CheckableTag onChange={onChange}>Choice</CheckableTag>
    </TaoProvider>,
  );
  fireEvent.click(close);
  fireEvent.keyDown(choice, { key: 'Enter' });
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
});

test('local disabled=false enables tags under a disabled provider', () => {
  const onClose = rs.fn();
  const onChange = rs.fn();
  render(
    <TaoProvider disabled>
      <Tag disabled={false} onClose={onClose}>
        Closable
      </Tag>
      <CheckableTag disabled={false} onChange={onChange}>
        Choice
      </CheckableTag>
    </TaoProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Choice' }));
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
});
