import { expect, rs, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Select } from '../../src/components/select/select';

test('mobile Select change callbacks cannot mutate the committed selection', async () => {
  const options = [{ value: 'a', label: 'Alpha' }];
  const onSelect = rs.fn();
  render(
    <Select
      mobile
      aria-label="Pick"
      mode="multiple"
      defaultOpen
      options={options}
      onSelect={onSelect}
      onChange={(values) => {
        if (Array.isArray(values)) values.length = 0;
      }}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  await userEvent.click(screen.getByRole('button', { name: 'Done' }));

  expect(onSelect).toHaveBeenCalledExactlyOnceWith('a', options[0]);
  expect(screen.getByRole('button', { name: 'Pick' })).toHaveTextContent(
    'Alpha',
  );
});

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

test.each(['multiple', 'tags'] as const)(
  'mobile %s synchronizes external replacements and resets while open',
  (mode) => {
    const onChange = rs.fn();
    const props = { mobile: true, open: true, mode, options, onChange };
    const view = render(<Select {...props} value={['a']} />);
    view.rerender(<Select {...props} value={['b']} />);
    expect(
      screen.getByRole('button', { name: 'Alpha', exact: true }),
    ).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByRole('button', { name: 'Beta', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onChange).toHaveBeenLastCalledWith(['b'], [options[1]]);
    fireEvent.click(screen.getByRole('button', { name: 'Gamma', exact: true }));
    view.rerender(<Select {...props} value={undefined} />);
    expect(
      screen.getByRole('button', { name: 'Gamma', exact: true }),
    ).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onChange).toHaveBeenLastCalledWith([], []);
  },
);

test('equal controlled arrays preserve pending edits, but a replacement supersedes them', () => {
  const onChange = rs.fn();
  const props = {
    mobile: true,
    open: true,
    mode: 'multiple' as const,
    options,
    onChange,
    showSearch: true,
  };
  const view = render(<Select {...props} value={['a']} />);
  fireEvent.click(screen.getByRole('button', { name: 'Beta', exact: true }));
  view.rerender(<Select {...props} value={['a']} />);
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(onChange).toHaveBeenLastCalledWith(
    ['a', 'b'],
    [options[0], options[1]],
  );
  const search = screen.getByRole('textbox');
  search.focus();
  view.rerender(<Select {...props} value={['c']} />);
  expect(screen.getByRole('textbox')).toBe(search);
  expect(search).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(onChange).toHaveBeenLastCalledWith(['c'], [options[2]]);
});

test.each([
  { mobile: false, showSearch: false },
  { mobile: false, showSearch: true },
  { mobile: true, showSearch: false },
])(
  'Select preserves ReactNode labels and labelRender ($mobile/$showSearch)',
  (props) => {
    const options = [{ value: 'a', label: <strong>Alpha</strong> }];
    const view = render(<Select {...props} value="a" options={options} />);
    expect(screen.getByText('Alpha').tagName).toBe('STRONG');
    expect(screen.queryByText('[object Object]')).not.toBeInTheDocument();
    view.rerender(
      <Select
        {...props}
        value="a"
        options={options}
        labelRender={() => <em>Custom</em>}
      />,
    );
    expect(screen.getByText('Custom').tagName).toBe('EM');
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  },
);

test('Select with JSX option labels does not name its search input [object Object]', () => {
  render(
    <Select
      value="a"
      showSearch
      mobile={false}
      options={[{ value: 'a', label: <strong>Alpha</strong> }]}
    />,
  );
  expect(screen.getByText('Alpha')).toBeVisible();
  expect(screen.getByRole('combobox')).toHaveAccessibleName('Alpha');
});
