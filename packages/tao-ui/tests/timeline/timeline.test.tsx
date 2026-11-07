import { expect, test } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { Fragment } from 'react';
import { Timeline } from '../../src/components/timeline/timeline';

test('renders ordered titles and content, modern fields take precedence over aliases', () => {
  render(
    <Timeline
      items={[
        {
          title: 'Today',
          label: 'Old title',
          content: 'Created',
          children: 'Old content',
          icon: <span>✓</span>,
          dot: <span>Old icon</span>,
        },
      ]}
    />,
  );
  expect(screen.getByRole('list').tagName).toBe('OL');
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(screen.getByText('Today')).toBeTruthy();
  expect(screen.getByText('Created')).toBeTruthy();
  expect(screen.getByText('✓')).toBeTruthy();
  expect(screen.queryByText('Old title')).toBeNull();
});
test('reverses visible order after assigning alternating placement and pending item', () => {
  render(
    <Timeline
      mode="alternate"
      reverse
      pending="Waiting"
      pendingDot={<span>…</span>}
      items={[{ content: 'First' }, { content: 'Second' }]}
    />,
  );
  const nodes = screen.getAllByRole('listitem');
  expect(nodes.map((node) => node.textContent)).toEqual([
    '…Waiting',
    'Second',
    'First',
  ]);
  expect(nodes[1]).toHaveAttribute('data-tao-placement', 'end');
  expect(nodes[2]).toHaveAttribute('data-tao-placement', 'start');
});
test('legacy child fragments, mode aliases and explicit item placement work', () => {
  render(
    <Timeline mode="right">
      <Fragment key="legacy-items">
        <Timeline.Item label="Date" position="left">
          A
        </Timeline.Item>
        <Timeline.Item>B</Timeline.Item>
      </Fragment>
    </Timeline>,
  );
  const nodes = screen.getAllByRole('listitem');
  expect(nodes[0]).toHaveAttribute('data-tao-placement', 'start');
  expect(nodes[1]).toHaveAttribute('data-tao-placement', 'end');
  expect(screen.getByRole('list')).toHaveAttribute('data-tao-mode', 'end');
});
test('semantic item styles override global slots and title spans use a 24-column ratio', () => {
  render(
    <Timeline
      titleSpan={6}
      styles={{ itemContent: { color: 'red' } }}
      classNames={({ props }) => ({ root: `mode-${props.mode}` })}
      items={[
        {
          title: 'Now',
          content: 'Event',
          color: 'purple',
          styles: { content: { color: 'blue' } },
          classNames: { content: 'event-content' },
        },
      ]}
    />,
  );
  expect(screen.getByText('Event')).toHaveStyle({ color: 'blue' });
  expect(screen.getByText('Event')).toHaveClass('event-content');
  expect(
    screen
      .getByRole('list')
      .style.getPropertyValue('--tao-timeline-title-span'),
  ).toBe('25%');
  expect(screen.getByRole('list')).toHaveClass('mode-start');
  expect(
    screen.getByRole('listitem').style.getPropertyValue('--tao-timeline-color'),
  ).toBe('purple');
});
test('horizontal loading states render real status indicators and honor a custom icon', () => {
  const { rerender } = render(
    <Timeline
      orientation="horizontal"
      variant="filled"
      items={[{ content: 'Saving', loading: true }]}
    />,
  );
  expect(screen.getByRole('list')).toHaveAttribute(
    'data-tao-orientation',
    'horizontal',
  );
  expect(screen.getByRole('status')).toBeTruthy();
  rerender(
    <Timeline
      items={[
        { content: 'Saving', loading: true, icon: <span>Custom loading</span> },
      ]}
    />,
  );
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.getByText('Custom loading')).toBeTruthy();
});

test('keeps nested fragment items distinct when sibling fragments change', () => {
  const { rerender } = render(
    <Timeline>
      <Fragment key="a">
        <Timeline.Item key="same">A</Timeline.Item>
      </Fragment>
      <Fragment key="b">
        <Timeline.Item key="same">B</Timeline.Item>
      </Fragment>
    </Timeline>,
  );
  const second = screen.getByText('B').closest('li');
  rerender(
    <Timeline>
      <Fragment key="b">
        <Timeline.Item key="same">B</Timeline.Item>
      </Fragment>
    </Timeline>,
  );
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(screen.getByText('B').closest('li')).toBe(second);
});

test('keeps unkeyed item content mounted when reverse changes', () => {
  const items = [
    { content: <input aria-label="First" defaultValue="First" /> },
    { content: <input aria-label="Second" defaultValue="Second" /> },
  ];
  const { rerender } = render(<Timeline items={items} />);
  const first = screen.getByRole<HTMLInputElement>('textbox', {
    name: 'First',
  });
  first.value = 'Edited';
  rerender(<Timeline items={items} reverse />);
  expect(screen.getAllByRole('textbox')).toEqual([
    screen.getByRole('textbox', { name: 'Second' }),
    first,
  ]);
  expect(first).toHaveValue('Edited');
});

test('includes numeric zero as a title and as pending content on the end rail', () => {
  render(
    <Timeline
      mode="end"
      pending={0}
      items={[{ title: 0, content: 'Event' }]}
    />,
  );
  expect(screen.getByRole('list')).toHaveAttribute('data-tao-split');
  const entries = screen.getAllByRole('listitem');
  expect(entries).toHaveLength(2);
  expect(entries[1]).toHaveAttribute('data-tao-placement', 'end');
  expect(entries[1].textContent).toBe('0');
});

test('aligns a pending item with the configured end rail', () => {
  render(
    <Timeline
      mode="end"
      pending="Waiting"
      items={[{ title: 'Today', content: 'Event' }]}
    />,
  );
  expect(screen.getByText('Waiting').closest('li')).toHaveAttribute(
    'data-tao-placement',
    'end',
  );
});
