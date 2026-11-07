import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, Fragment } from 'react';
import {
  Descriptions,
  type DescriptionsRef,
} from '../../src/components/descriptions/descriptions';

test('bordered horizontal spans split labels from content and fill the final row', () => {
  render(
    <Descriptions
      column={3}
      bordered
      items={[
        { label: 'Name', children: 'Ada' },
        { label: 'Plan', children: 'Team', span: 2 },
        { label: 'Address', children: 'London' },
      ]}
    />,
  );
  expect(screen.getByText('Name').closest('th')).toHaveAttribute(
    'colspan',
    '1',
  );
  expect(screen.getByText('Team').closest('td')).toHaveAttribute(
    'colspan',
    '3',
  );
  expect(screen.getByText('London').closest('td')).toHaveAttribute(
    'colspan',
    '5',
  );
  expect(screen.getAllByRole('row')).toHaveLength(2);
});
test('filled spans terminate the row and oversize spans clip to remaining columns', () => {
  render(
    <Descriptions
      column={3}
      items={[
        { key: 'a', label: 'One', children: '1' },
        { key: 'b', children: 'Filled', span: 'filled' },
        { key: 'c', children: 'Wide', span: 8 },
      ]}
    />,
  );
  expect(screen.getByText('Filled').closest('td')).toHaveAttribute(
    'colspan',
    '2',
  );
  expect(screen.getByText('Wide').closest('td')).toHaveAttribute(
    'colspan',
    '3',
  );
});
test('vertical layout makes a label row and content row with equal spans', () => {
  render(
    <Descriptions
      layout="vertical"
      column={2}
      items={[
        { label: 'Name', children: 'Ada' },
        { label: 'Plan', children: 'Team' },
      ]}
    />,
  );
  expect(screen.getAllByRole('row')).toHaveLength(2);
  expect(screen.getByText('Name').closest('th')).toHaveAttribute(
    'scope',
    'col',
  );
  expect(screen.getByText('Ada').closest('td')).toBeTruthy();
});
test('legacy children flatten fragments and items take precedence', () => {
  const { rerender } = render(
    <Descriptions>
      <Fragment key="legacy-items">
        <Descriptions.Item label="Legacy">Old</Descriptions.Item>
      </Fragment>
    </Descriptions>,
  );
  expect(screen.getByText('Old')).toBeTruthy();
  rerender(
    <Descriptions items={[{ children: 'Current' }]}>
      <Descriptions.Item>Old</Descriptions.Item>
    </Descriptions>,
  );
  expect(screen.queryByText('Old')).toBeNull();
  expect(screen.getByText('Current')).toBeTruthy();
});

test('fragment-local keys preserve the remaining field when a fragment is removed', () => {
  const view = (includeFirst: boolean) => (
    <Descriptions column={3}>
      <Descriptions.Item key="context">Context</Descriptions.Item>
      {includeFirst && (
        <Fragment key="first">
          <Descriptions.Item key="status">
            <input aria-label="First status" defaultValue="First" />
          </Descriptions.Item>
        </Fragment>
      )}
      <Fragment key="second">
        <Descriptions.Item key="status">
          <input aria-label="Second status" defaultValue="Second" />
        </Descriptions.Item>
      </Fragment>
    </Descriptions>
  );
  const { rerender } = render(view(true));
  fireEvent.change(screen.getByRole('textbox', { name: 'Second status' }), {
    target: { value: 'Draft status' },
  });
  rerender(view(false));
  expect(screen.getByRole('textbox', { name: 'Second status' })).toHaveValue(
    'Draft status',
  );
});

test('semantic item styles override root slots on bordered cells and expose the ref', () => {
  const ref = createRef<DescriptionsRef>();
  render(
    <Descriptions
      ref={ref}
      title={0}
      extra="Edit"
      bordered
      column={1}
      labelStyle={{ color: 'red' }}
      styles={({ props }) => ({
        label: { color: props.column === 1 ? 'blue' : 'black' },
      })}
      items={[
        {
          label: 'Name',
          children: 'Ada',
          styles: { label: { color: 'green' } },
          classNames: { label: 'custom-label' },
        },
      ]}
    />,
  );
  expect(screen.getByText('Name').closest('th')).toHaveStyle({
    color: 'green',
  });
  expect(screen.getByText('Name').closest('th')).toHaveClass('custom-label');
  expect(ref.current?.nativeElement).toContainElement(screen.getByText('Edit'));
  expect(screen.getByText('0')).toBeTruthy();
});

test('responsive columns and spans resolve active breakpoint values including xxxl', async () => {
  const { setViewportWidth, restoreViewport } = await import(
    '../utils/mock-viewport'
  );
  setViewportWidth(1920);
  try {
    const { unmount } = render(
      <Descriptions
        items={[
          { children: 'Wide display', span: { md: 2, xxxl: 3 } },
          { children: 'Last' },
        ]}
      />,
    );
    expect(screen.getByText('Wide display').closest('td')).toHaveAttribute(
      'colspan',
      '3',
    );
    expect(screen.getAllByRole('row')).toHaveLength(1);
    unmount();
    setViewportWidth(390);
    render(
      <Descriptions
        column={{ md: 3 }}
        items={[{ children: 'Mobile A' }, { children: 'Mobile B' }]}
      />,
    );
    expect(screen.getAllByRole('row')).toHaveLength(2);
  } finally {
    restoreViewport();
  }
});
