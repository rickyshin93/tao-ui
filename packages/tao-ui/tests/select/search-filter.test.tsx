import { expect, rs, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Select } from '../../src/components/select/select';

test('default search does not match JSX labels by their "[object Object]" string', async () => {
  const user = userEvent.setup();
  render(
    <Select
      showSearch
      options={[
        { label: <b>Apple</b>, value: 'apple' },
        { label: <b>Banana</b>, value: 'banana' },
      ]}
    />,
  );
  await user.click(screen.getByRole('combobox'));
  await user.keyboard('object');
  expect(screen.queryAllByRole('option')).toHaveLength(0);

  await user.clear(screen.getByRole('combobox'));
  await user.keyboard('ban');
  expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
    'Banana',
  ]);
});

test('tags Enter creates typed text that prefixes an option; ArrowDown picks the suggestion', async () => {
  const onChange = rs.fn();
  render(
    <Select
      mobile={false}
      mode="tags"
      showSearch
      options={[{ value: 'food', label: 'Food' }]}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole('combobox');
  await userEvent.type(input, 'foo{Enter}');
  expect(onChange).toHaveBeenLastCalledWith(['foo'], []);

  await userEvent.type(input, 'foo{ArrowDown}{Enter}');
  expect(onChange).toHaveBeenLastCalledWith(
    ['foo', 'food'],
    [{ value: 'food', label: 'Food' }],
  );
});
