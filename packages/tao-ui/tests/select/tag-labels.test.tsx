import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Select } from '../../src/components/select/select';

test('custom tagRender receives rich labels unchanged when limiting tag text', () => {
  render(
    <Select
      mobile={false}
      mode="multiple"
      defaultValue={['alpha']}
      maxTagTextLength={4}
      tagRender={({ label }) => <span data-testid="custom-tag">{label}</span>}
      options={[
        {
          value: 'alpha',
          label: <strong data-testid="tag-label">Alpha</strong>,
        },
      ]}
    />,
  );

  expect(screen.getByTestId('tag-label')).toHaveTextContent('Alpha');
  expect(screen.getByTestId('custom-tag')).toContainElement(
    screen.getByTestId('tag-label'),
  );
  expect(screen.queryByText('[obj…')).not.toBeInTheDocument();
});
