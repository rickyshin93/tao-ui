import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { FormActions } from '../../src/components/form-actions/form-actions';

test('renders children buttons', () => {
  render(
    <FormActions>
      <button type="button">Cancel</button>
      <button type="submit">Save</button>
    </FormActions>,
  );
  expect(screen.getByText('Cancel')).toBeTruthy();
  expect(screen.getByText('Save')).toBeTruthy();
});
