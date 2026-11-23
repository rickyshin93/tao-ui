import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Select } from '../../src/components/select/select';

test.each([
  { name: 'desktop', mobile: false, showSearch: false },
  { name: 'searchable', mobile: false, showSearch: true },
  { name: 'mobile', mobile: true, showSearch: false },
])(
  'removing a $name tag from the keyboard keeps focus in the Select',
  async ({ mobile, showSearch }) => {
    render(
      <Select
        mode="multiple"
        mobile={mobile}
        showSearch={showSearch}
        defaultValue={['a', 'b']}
        options={[
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
      />,
    );
    const close = document.querySelector<HTMLElement>(
      '[data-tao-select-tag-close]',
    );
    close?.focus();
    await userEvent.keyboard('{Enter}');
    expect(
      document.querySelectorAll('[data-tao-select-tag-close]'),
    ).toHaveLength(1);
    expect(document.activeElement).toBe(
      screen.getByRole(mobile ? 'button' : 'combobox', { expanded: false }),
    );
  },
);
