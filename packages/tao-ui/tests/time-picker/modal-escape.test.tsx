import { expect, rstest, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Modal } from '../../src/components/modal';
import { TimePicker } from '../../src/components/time-picker/time-picker';

test('Escape closes an open TimePicker before the Modal that contains it', async () => {
  const user = userEvent.setup();
  const onClose = rstest.fn();
  render(
    <Modal open onClose={onClose} title="Schedule">
      <TimePicker placeholder="Start" />
    </Modal>,
  );
  const input = screen.getByPlaceholderText('Start');
  await user.click(input);
  expect(input).toHaveAttribute('aria-expanded', 'true');
  await user.keyboard('{Escape}');
  expect(input).toHaveAttribute('aria-expanded', 'false');
  expect(onClose).not.toHaveBeenCalled();
  await user.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalledTimes(1);
});
