import { describe, expect, rstest, test } from '@rstest/core';
import { act, fireEvent, render, renderHook } from '@testing-library/react';
import { useState } from 'react';
import {
  type UseNumberInputOptions,
  useNumberInput,
} from '../../src/number-input/use-number-input';

function Harness({ opts }: { opts: UseNumberInputOptions }) {
  const { inputProps } = useNumberInput(opts);
  return <input {...inputProps} data-testid="input" />;
}

function ControlledHarness(props: {
  initialValue: string;
  opts?: Omit<UseNumberInputOptions, 'value' | 'onChange'>;
  onChange?: (v: string) => void;
}) {
  const [value, setValue] = useState(props.initialValue);
  const { inputProps } = useNumberInput({
    ...props.opts,
    value,
    onChange: (v) => {
      setValue(v);
      props.onChange?.(v);
    },
  });
  return <input {...inputProps} data-testid="input" />;
}

describe('init', () => {
  test('5.1 — value="" produces empty displayBuffer', () => {
    const { result } = renderHook(() => useNumberInput({ value: '' }));
    expect(result.current.displayValue).toBe('');
    expect(result.current.inputProps.value).toBe('');
  });

  test('5.2 — value="1234.5" with default opts → "1,234.5"', () => {
    const { result } = renderHook(() => useNumberInput({ value: '1234.5' }));
    expect(result.current.displayValue).toBe('1,234.5');
  });

  test('5.3 — value="0.5" with isPercentage → "50"', () => {
    const { result } = renderHook(() =>
      useNumberInput({ value: '0.5', isPercentage: true }),
    );
    expect(result.current.displayValue).toBe('50');
  });
});

describe('typing', () => {
  test('5.4 — typing "5" emits onChange("5") and displays "5"', () => {
    const onChange = rstest.fn();
    const { getByTestId } = render(<Harness opts={{ value: '', onChange }} />);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith('5');
    expect(input.value).toBe('5');
  });

  test('5.5 — typing "1234" displays "1,234"', () => {
    const { getByTestId } = render(<ControlledHarness initialValue="" />);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1234' } });
    expect(input.value).toBe('1,234');
  });

  test('5.6 — pasting "1.2.3" → display="1.23" (first dot + truncate 2)', () => {
    const { getByTestId } = render(<ControlledHarness initialValue="" />);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1.2.3' } });
    expect(input.value).toBe('1.23');
  });

  test('5.7 — percentage mode: typing "50" → onChange("0.5")', () => {
    const onChange = rstest.fn();
    const { getByTestId } = render(
      <Harness opts={{ value: '', isPercentage: true, onChange }} />,
    );
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '50' } });
    expect(onChange).toHaveBeenCalledWith('0.5');
  });

  test('5.8 — allowNegative=false: typing "-" → rejected, display unchanged', () => {
    const onChange = rstest.fn();
    const { getByTestId } = render(<Harness opts={{ value: '', onChange }} />);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '-' } });
    // stripDisallowedSign("-", false) → "" so onChange fires with ""
    // display stays empty
    expect(input.value).toBe('');
    expect(onChange).toHaveBeenCalledWith('');
  });

  test('5.9 — allowNegative=true: typing "-" → display="-", onChange("-")', () => {
    const onChange = rstest.fn();
    const { getByTestId } = render(
      <Harness opts={{ value: '', allowNegative: true, onChange }} />,
    );
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '-' } });
    expect(input.value).toBe('-');
    expect(onChange).toHaveBeenCalledWith('-');
  });
});

describe('backspace over thousand separator', () => {
  test('5.10 — display="1,234" cursor=2, BS → display="234"', () => {
    const { getByTestId } = render(<ControlledHarness initialValue="1234" />);
    const input = getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('1,234');
    // simulate cursor at position 2 (between , and 2), then backspace
    input.setSelectionRange(2, 2);
    fireEvent.keyDown(input, { key: 'Backspace' });
    // cursor should jump to 1 (between 1 and ,)
    expect(input.selectionStart).toBe(1);
    // Now simulate the actual deletion the browser would do:
    // delete char at cursor-1 (= '1') → raw="2,34" minus the 1 → ",234"
    // Actually browser BS at cursor=1 deletes char at index 0 ('1') → raw=",234"
    fireEvent.change(input, { target: { value: ',234' } });
    expect(input.value).toBe('234');
  });
});

describe('external value sync', () => {
  test('5.11 — focus locks external value sync', () => {
    function Wrapper() {
      const [value, setValue] = useState('5');
      const { inputProps } = useNumberInput({ value });
      return (
        <>
          <input {...inputProps} data-testid="input" />
          <button
            type="button"
            data-testid="set999"
            onClick={() => setValue('999')}
          >
            set
          </button>
        </>
      );
    }
    const { getByTestId } = render(<Wrapper />);
    const input = getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('5');
    fireEvent.focus(input);
    act(() => {
      getByTestId('set999').click();
    });
    expect(input.value).toBe('5'); // locked
  });

  test('5.12 — blur unlocks external value sync', () => {
    function Wrapper() {
      const [value, setValue] = useState('5');
      const { inputProps } = useNumberInput({ value });
      return (
        <>
          <input {...inputProps} data-testid="input" />
          <button
            type="button"
            data-testid="set999"
            onClick={() => setValue('999')}
          >
            set
          </button>
        </>
      );
    }
    const { getByTestId } = render(<Wrapper />);
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    act(() => {
      getByTestId('set999').click();
    });
    expect(input.value).toBe('999');
  });
});

describe('blur normalization', () => {
  test('5.13 — padDecimalsOnBlur="always" + "5" → display="5.00", emit "5.00" (padded canonical)', () => {
    // Padded canonical is what we emit so re-rendering with the same value keeps the display stable.
    const onChange = rstest.fn();
    const onBlur = rstest.fn();
    const { getByTestId } = render(
      <Harness
        opts={{
          value: '5',
          padDecimalsOnBlur: 'always',
          decimalPlaces: 2,
          onChange,
          onBlur,
        }}
      />,
    );
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input.value).toBe('5.00');
    expect(onChange).toHaveBeenLastCalledWith('5.00');
    expect(onBlur).toHaveBeenCalledWith('5.00');
  });

  test('5.14 — min=0 max=10 + value="20" → blur clamps to "10"', () => {
    const onChange = rstest.fn();
    const onBlur = rstest.fn();
    const { getByTestId } = render(
      <Harness opts={{ value: '20', min: 0, max: 10, onChange, onBlur }} />,
    );
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input.value).toBe('10');
    expect(onChange).toHaveBeenLastCalledWith('10');
    expect(onBlur).toHaveBeenCalledWith('10');
  });

  test('5.15 — isPercentage + min=0 max=1 + actual=2 → clamp to "1", display "100"', () => {
    const onChange = rstest.fn();
    const { getByTestId } = render(
      <Harness
        opts={{
          value: '2',
          isPercentage: true,
          min: 0,
          max: 1,
          onChange,
        }}
      />,
    );
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(input.value).toBe('100');
    expect(onChange).toHaveBeenLastCalledWith('1');
  });

  test('5.16 — onBlur also calls onChange (form-lib friendly)', () => {
    const onChange = rstest.fn();
    const onBlur = rstest.fn();
    const { getByTestId } = render(
      <Harness opts={{ value: '5', onChange, onBlur }} />,
    );
    const input = getByTestId('input') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });
});

describe('uncontrolled', () => {
  test('5.17 — defaultValue="5" + no value → initial display="5", external sync inactive', () => {
    function Wrapper() {
      // No value prop => uncontrolled
      const { inputProps } = useNumberInput({ defaultValue: '5' });
      return <input {...inputProps} data-testid="input" />;
    }
    const { getByTestId } = render(<Wrapper />);
    const input = getByTestId('input') as HTMLInputElement;
    expect(input.value).toBe('5');
  });
});

test.each([
  { next: '20', display: '20', isPercentage: false },
  { next: undefined, display: '', isPercentage: false },
  { next: '0.25', display: '25', isPercentage: true },
])('blur uses the latest external value after a focused update (%#)', ({
  next,
  display,
  isPercentage,
}) => {
  const onChange = rstest.fn();
  const onBlur = rstest.fn();
  const { getByTestId, rerender } = render(
    <Harness opts={{ value: '10', isPercentage, onChange, onBlur }} />,
  );
  const input = getByTestId('input');
  fireEvent.focus(input);
  rerender(<Harness opts={{ value: next, isPercentage, onChange, onBlur }} />);
  fireEvent.blur(input);
  expect(input).toHaveValue(display);
  expect(onChange).toHaveBeenLastCalledWith(next ?? '');
  expect(onBlur).toHaveBeenLastCalledWith(next ?? '');
});

test('blur restores a controlled value when its typed change is rejected', () => {
  const onChange = rstest.fn();
  const { getByTestId } = render(<Harness opts={{ value: '10', onChange }} />);
  const input = getByTestId('input');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: '20' } });
  expect(onChange).toHaveBeenLastCalledWith('20');
  fireEvent.blur(input);
  expect(input).toHaveValue('10');
  expect(onChange).toHaveBeenLastCalledWith('10');
});

test('accepted percentage edits retain their canonical value on blur', () => {
  const onChange = rstest.fn();
  const { getByTestId } = render(
    <ControlledHarness
      initialValue="0.1"
      onChange={onChange}
      opts={{
        isPercentage: true,
        decimalPlaces: 2,
        padDecimalsOnBlur: 'always',
      }}
    />,
  );
  const input = getByTestId('input');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: '25.5' } });
  expect(onChange).toHaveBeenLastCalledWith('0.255');
  fireEvent.blur(input);
  expect(input).toHaveValue('25.5');
  expect(onChange).toHaveBeenLastCalledWith('0.255');
});

test('uncontrolled edits retain their buffer for blur normalization', () => {
  const onChange = rstest.fn();
  const { getByTestId } = render(
    <Harness
      opts={{
        defaultValue: '10',
        decimalPlaces: 2,
        padDecimalsOnBlur: 'always',
        onChange,
      }}
    />,
  );
  const input = getByTestId('input');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: '20' } });
  fireEvent.blur(input);
  expect(input).toHaveValue('20.00');
  expect(onChange).toHaveBeenLastCalledWith('20.00');
});

test('accepted numeric edits still normalize on blur', () => {
  const onChange = rstest.fn();
  const { getByTestId } = render(
    <ControlledHarness
      initialValue="10"
      onChange={onChange}
      opts={{ decimalPlaces: 2, padDecimalsOnBlur: 'always' }}
    />,
  );
  const input = getByTestId('input');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: '20' } });
  fireEvent.blur(input);
  expect(input).toHaveValue('20.00');
  expect(onChange).toHaveBeenLastCalledWith('20.00');
});

test.each([
  false,
  true,
])('small boundaries remain stable over repeated blur (percentage=%s)', (isPercentage) => {
  const onChange = rstest.fn();
  const { getByTestId } = render(
    <Harness
      opts={{
        defaultValue: '0',
        min: 0.0000001,
        decimalPlaces: 8,
        isPercentage,
        onChange,
      }}
    />,
  );
  const input = getByTestId('input');
  for (let index = 0; index < 2; index++) {
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith('0.0000001');
    expect(input).toHaveValue(isPercentage ? '0.00001' : '0.0000001');
  }
});

test.each([
  false,
  true,
])('separator changes preserve values and repeated blur (controlled=%s)', (controlled) => {
  const onChange = rstest.fn();
  const opts = {
    ...(controlled ? { value: '1234.5' } : { defaultValue: '1234.5' }),
    onChange,
  };
  const { getByTestId, rerender } = render(<Harness opts={opts} />);
  const input = getByTestId('input');
  rerender(
    <Harness
      opts={{ ...opts, decimalSeparator: ',', thousandsSeparator: '.' }}
    />,
  );
  expect(input).toHaveValue('1.234,5');
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.blur(input);
  fireEvent.blur(input);
  expect(onChange).toHaveBeenLastCalledWith('1234.5');
});

test.each([
  false,
  true,
])('percentage toggles preserve actual values in both directions (controlled=%s)', (controlled) => {
  const onChange = rstest.fn();
  const opts = {
    ...(controlled ? { value: '0.5' } : { defaultValue: '0.5' }),
    onChange,
  };
  const { getByTestId, rerender } = render(<Harness opts={opts} />);
  const input = getByTestId('input');
  rerender(<Harness opts={{ ...opts, isPercentage: true }} />);
  expect(input).toHaveValue('50');
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.blur(input);
  expect(onChange).toHaveBeenLastCalledWith('0.5');
  rerender(<Harness opts={opts} />);
  expect(input).toHaveValue('0.5');
  fireEvent.blur(input);
  expect(onChange).toHaveBeenLastCalledWith('0.5');
});

test('focused separator changes preserve the current edit, trailing decimal and caret', () => {
  const onChange = rstest.fn();
  const opts = { value: '10', onChange };
  const { getByTestId, rerender } = render(<Harness opts={opts} />);
  const input = getByTestId('input') as HTMLInputElement;
  act(() => input.focus());
  fireEvent.change(input, { target: { value: '1234.' } });
  input.setSelectionRange(3, 3);
  rerender(
    <Harness
      opts={{ ...opts, decimalSeparator: ',', thousandsSeparator: ' ' }}
    />,
  );
  expect(input).toHaveValue('1 234,');
  expect(input.selectionStart).toBe(3);
  expect(document.activeElement).toBe(input);
  fireEvent.blur(input);
  expect(input).toHaveValue('10');
  expect(onChange).toHaveBeenLastCalledWith('10');
});

test.each([
  '',
  '-',
  '12.',
])('format mode changes preserve the intermediate edit %s', (text) => {
  const opts = { allowNegative: true, thousandsSeparator: '' as const };
  const { getByTestId, rerender } = render(<Harness opts={opts} />);
  const input = getByTestId('input');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
  rerender(<Harness opts={{ ...opts, isPercentage: true }} />);
  expect(input).toHaveValue(text === '12.' ? '1200.' : text);
  rerender(<Harness opts={opts} />);
  expect(input).toHaveValue(text);
});

test('format changes keep the hook canonical value stable before blur', () => {
  const { result, rerender } = renderHook(
    (opts: UseNumberInputOptions) => useNumberInput(opts),
    { initialProps: { defaultValue: '1234.5' } },
  );
  rerender({
    defaultValue: '1234.5',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  });
  expect(result.current.value).toBe('1234.5');
  expect(result.current.displayValue).toBe('1.234,5');
});

test('separator changes preserve a selected digit range', () => {
  const { getByTestId, rerender } = render(
    <Harness opts={{ defaultValue: '1234.5', thousandsSeparator: '' }} />,
  );
  const input = getByTestId('input') as HTMLInputElement;
  act(() => input.focus());
  input.setSelectionRange(2, 4);
  rerender(
    <Harness
      opts={{
        defaultValue: '1234.5',
        decimalSeparator: ',',
        thousandsSeparator: '.',
      }}
    />,
  );
  expect(input).toHaveValue('1.234,5');
  expect(input.selectionStart).toBe(3);
  expect(input.selectionEnd).toBe(5);
  expect(input.value.slice(input.selectionStart!, input.selectionEnd!)).toBe(
    '34',
  );
  expect(document.activeElement).toBe(input);
});
