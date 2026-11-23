import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Form } from '../../src/components/form';
import { Slider } from '../../src/components/slider/slider';

test('Slider handles take the Form.Item label and description', () => {
  render(
    <Form>
      <Form.Item label="Volume" extra="Applies to all speakers">
        <Slider tooltip={{ open: false }} />
      </Form.Item>
      <Form.Item label="Range">
        <Slider range defaultValue={[10, 20]} tooltip={{ open: false }} />
      </Form.Item>
    </Form>,
  );
  const handle = screen.getByRole('slider', { name: 'Volume' });
  expect(
    document.getElementById(handle.getAttribute('aria-describedby') ?? '')
      ?.textContent,
  ).toBe('Applies to all speakers');
  expect(screen.getAllByRole('slider', { name: 'Range' })).toHaveLength(2);
});

test('explicit handle labels win over the Slider aria-label', () => {
  render(
    <Slider
      aria-label="Volume"
      ariaLabelForHandle="Left speaker"
      tooltip={{ open: false }}
    />,
  );
  expect(screen.getByRole('slider', { name: 'Left speaker' })).toBeTruthy();
});
