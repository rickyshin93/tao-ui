import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Radio, RadioGroup } from '../../src/components/radio/radio';

test('arrow keys wrap within an unnamed RadioGroup instead of entering the next group', async () => {
  render(
    <>
      <RadioGroup options={['Alpha', 'Beta']} defaultValue="Alpha" />
      <RadioGroup options={['Gamma', 'Delta']} defaultValue="Gamma" />
    </>,
  );
  const user = userEvent.setup();
  const alpha = screen.getByRole('radio', { name: 'Alpha' });
  const beta = screen.getByRole('radio', { name: 'Beta' });
  const gamma = screen.getByRole('radio', { name: 'Gamma' });
  await user.click(alpha);
  await user.keyboard('{ArrowRight}');
  expect(beta).toHaveFocus();
  expect(beta).toBeChecked();
  await user.keyboard('{ArrowRight}');
  expect(alpha).toHaveFocus();
  expect(alpha).toBeChecked();
  expect(gamma).toBeChecked();
  await user.keyboard('{ArrowLeft}');
  expect(beta).toHaveFocus();
  expect(beta).toBeChecked();
});

test('generated radio names remain stable across rerenders and explicit names win', () => {
  const view = render(
    <RadioGroup>
      <Radio value="a">Alpha</Radio>
      <Radio value="b">Beta</Radio>
    </RadioGroup>,
  );
  const alpha = screen.getByRole('radio', { name: 'Alpha' });
  const beta = screen.getByRole('radio', { name: 'Beta' });
  const name = alpha.getAttribute('name');
  expect(name).toBeTruthy();
  expect(beta).toHaveAttribute('name', name);
  view.rerender(
    <RadioGroup value="b">
      <Radio value="a">Alpha</Radio>
      <Radio value="b">Beta</Radio>
    </RadioGroup>,
  );
  expect(alpha).toHaveAttribute('name', name);
  view.rerender(
    <RadioGroup name="plan">
      <Radio value="a">Alpha</Radio>
      <Radio value="b">Beta</Radio>
    </RadioGroup>,
  );
  expect(alpha).toHaveAttribute('name', 'plan');
  expect(beta).toHaveAttribute('name', 'plan');
});
