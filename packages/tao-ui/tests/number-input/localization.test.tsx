import { expect, rstest, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { InputNumber } from '../../src/components/input-number/input-number';
import { Statistic } from '../../src/components/statistic/statistic';
import { HeadlessInputNumber } from '../../src/number-input/number-input';
import { TaoProvider } from '../../src/provider/tao-provider';

test.each([
  ['fr-FR', '1 234 567,89'],
  ['hi-IN', '12,34,567.89'],
  ['ar-EG', '١٬٢٣٤٬٥٦٧٫٨٩'],
] as const)('numeric controls inherit %s formatting', (locale, formatted) => {
  const { container } = render(
    <TaoProvider locale={{ numberLocale: locale }}>
      <InputNumber value="1234567.89" />
      <Statistic value="1234567.89" />
    </TaoProvider>,
  );
  expect(screen.getByRole('textbox')).toHaveValue(formatted);
  expect(
    container.querySelector('[data-tao-statistic-value]')?.textContent,
  ).toBe(formatted);
});

test('Arabic input emits exact canonical strings and accepts ASCII decimal input', () => {
  const onChange = rstest.fn();
  render(
    <InputNumber
      locale="ar-EG"
      allowNegative
      decimalPlaces={4}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: '؜-٩٠٠٧١٩٩٢٥٤٧٤٠٩٩٣٫١٢٣٤' } });
  expect(onChange).toHaveBeenLastCalledWith('-9007199254740993.1234');
  expect(input).toHaveValue('-٩٬٠٠٧٬١٩٩٬٢٥٤٬٧٤٠٬٩٩٣٫١٢٣٤');
  fireEvent.change(input, { target: { value: '123.45' } });
  expect(onChange).toHaveBeenLastCalledWith('123.45');
  expect(input).toHaveValue('١٢٣٫٤٥');
});

test('changing locale preserves editing value, selection and callback silence', () => {
  const onChange = rstest.fn();
  const { rerender } = render(
    <InputNumber
      locale="en-US"
      defaultValue="1234567.89"
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('textbox') as HTMLInputElement;
  fireEvent.focus(input);
  input.setSelectionRange(2, 5);
  rerender(
    <InputNumber
      locale="hi-IN"
      defaultValue="1234567.89"
      onChange={onChange}
    />,
  );
  expect(input).toHaveValue('12,34,567.89');
  expect(input.selectionStart).toBe(1);
  expect(input.selectionEnd).toBe(5);
  rerender(
    <InputNumber
      locale="ar-EG"
      defaultValue="1234567.89"
      onChange={onChange}
    />,
  );
  expect(input).toHaveValue('١٬٢٣٤٬٥٦٧٫٨٩');
  expect(onChange).not.toHaveBeenCalled();
});

test('local locale and explicit separators override provider without precision loss', () => {
  const { container } = render(
    <TaoProvider locale={{ numberLocale: 'fr-FR' }}>
      <InputNumber
        locale="hi-IN"
        value="12345678901234567890.9876"
        decimalSeparator=","
        thousandsSeparator=" "
      />
      <Statistic
        locale="hi-IN"
        value="12345678901234567890.9876"
        precision={2}
        decimalSeparator=","
        groupSeparator=" "
      />
    </TaoProvider>,
  );
  expect(screen.getByRole('textbox')).toHaveValue(
    '1 23 45 67 89 01 23 45 67 890,9876',
  );
  expect(
    container.querySelector('[data-tao-statistic-value]')?.textContent,
  ).toBe('1 23 45 67 89 01 23 45 67 890,98');
});

test('headless input keeps locale off the DOM and percentage callbacks canonical', () => {
  const onChange = rstest.fn();
  render(
    <HeadlessInputNumber
      locale="ar-EG"
      isPercentage
      defaultValue="0.125"
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('textbox');
  expect(input).toHaveValue('١٢٫٥');
  expect(input).not.toHaveAttribute('locale');
  fireEvent.change(input, { target: { value: '٢٥٫٥' } });
  expect(onChange).toHaveBeenLastCalledWith('0.255');
});

test('locale grouping threshold and arbitrary precision are retained by Statistic', () => {
  const { rerender, container } = render(
    <Statistic locale="es-ES" value="1234.5" />,
  );
  expect(container.textContent).toBe('1234,5');
  rerender(
    <Statistic
      locale="ar-EG"
      value="9007199254740993123456789.0001"
      precision={3}
    />,
  );
  expect(container.textContent).toBe('٩٬٠٠٧٬١٩٩٬٢٥٤٬٧٤٠٬٩٩٣٬١٢٣٬٤٥٦٬٧٨٩٫٠٠٠');
});
