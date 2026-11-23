import { expect, rs, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Select } from '../../src/components/select/select';

test('multiple Select shows and removes values missing from options', async () => {
  const onChange = rs.fn();
  render(
    <Select
      mode="multiple"
      defaultValue={['ghost', 'a']}
      options={[{ label: 'A', value: 'a' }]}
      onChange={onChange}
    />,
  );
  const tags = document.querySelectorAll('[data-tao-select-tag]');
  expect([...tags].map((tag) => tag.textContent)).toEqual(['ghost', 'A']);

  await userEvent.click(
    tags[0].querySelector('[data-tao-select-tag-close]') as Element,
  );
  expect(onChange).toHaveBeenLastCalledWith(
    ['a'],
    [{ label: 'A', value: 'a' }],
  );
});

test('single Select shows a value missing from options instead of the placeholder', () => {
  render(
    <Select
      value="ghost"
      placeholder="Pick one"
      options={[{ label: 'A', value: 'a' }]}
    />,
  );
  expect(screen.queryByText('Pick one')).toBeNull();
  expect(screen.getByText('ghost')).toBeTruthy();
});

test.each([
  { name: 'desktop', mobile: false, showSearch: false },
  { name: 'searchable', mobile: false, showSearch: true },
  { name: 'mobile', mobile: true, showSearch: false },
])(
  'multiple $name Select submits every value under its name',
  ({ mobile, showSearch }) => {
    render(
      <form data-testid="form">
        <Select
          name="fruits"
          mode="multiple"
          mobile={mobile}
          showSearch={showSearch}
          defaultValue={['a', 'b']}
          options={[
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ]}
        />
      </form>,
    );
    const form = screen.getByTestId('form') as HTMLFormElement;
    expect(new FormData(form).getAll('fruits')).toEqual(['a', 'b']);
  },
);
