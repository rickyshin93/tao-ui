import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import {
  Card,
  type CardGridRef,
  type CardMetaRef,
} from '../../src/components/card/card';

test('renders title, extra, cover, actions and native div ref', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Card
      ref={ref}
      title="Workspace"
      extra={<a href="/settings">Settings</a>}
      cover={<img src="cover.png" alt="Cover" />}
      actions={[
        <button key="edit" type="button">
          Edit
        </button>,
      ]}
    >
      <p>Details</p>
    </Card>,
  );
  expect(ref.current).toContainElement(screen.getByText('Details'));
  expect(screen.getByRole('link', { name: 'Settings' })).toBeTruthy();
  expect(screen.getByAltText('Cover')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Edit' })).toBeTruthy();
});
test('loading substitutes content and restores it when ready', () => {
  const { rerender, container } = render(
    <Card loading title="Workspace">
      Private content
    </Card>,
  );
  expect(screen.queryByText('Private content')).toBeNull();
  expect(container.querySelector('[data-tao-skeleton]')).toBeTruthy();
  rerender(<Card title="Workspace">Private content</Card>);
  expect(screen.getByText('Private content')).toBeTruthy();
});
test('controlled tab changes call both handlers and respect disabled items', () => {
  const events: string[] = [];
  function Example() {
    const [active, setActive] = useState('one');
    return (
      <Card
        activeTabKey={active}
        onTabChange={(key) => {
          events.push(`card:${key}`);
          setActive(key);
        }}
        tabProps={{ onChange: (key) => events.push(`tabs:${key}`) }}
        tabList={[
          { key: 'one', label: 'Overview' },
          { key: 'two', tab: 'Activity' },
          { key: 'three', label: 'Locked', disabled: true },
        ]}
      >
        {active}
      </Card>
    );
  }
  render(<Example />);
  fireEvent.click(screen.getByRole('tab', { name: 'Activity' }));
  expect(events).toEqual(['tabs:two', 'card:two']);
  expect(
    screen.getByRole('tab', { name: 'Activity' }).getAttribute('aria-selected'),
  ).toBe('true');
  expect(screen.getByText('two')).toBeTruthy();
  fireEvent.click(screen.getByRole('tab', { name: 'Locked' }));
  expect(events).toHaveLength(2);
});
test('uncontrolled initial tabs and editable tab callbacks retain antd payloads', () => {
  const actions: [unknown, string][] = [];
  render(
    <Card
      defaultActiveTabKey="two"
      tabList={[
        { key: 'one', label: 'Overview' },
        { key: 'two', label: 'Activity' },
      ]}
      tabProps={{
        type: 'editable-card',
        onEdit: (key, action) => actions.push([key, action]),
        locale: { addAriaLabel: 'Add tab', removeAriaLabel: 'Remove tab' },
      }}
    />,
  );
  expect(
    screen.getByRole('tab', { name: 'Activity' }).getAttribute('aria-selected'),
  ).toBe('true');
  fireEvent.click(screen.getAllByRole('button', { name: 'Remove tab' })[0]);
  expect(actions[0]).toEqual(['one', 'remove']);
  fireEvent.click(screen.getAllByRole('button', { name: 'Add tab' })[0]);
  expect(actions[1][1]).toBe('add');
  expect(typeof actions[1][0]).toBe('object');
});
test('semantic style callbacks receive resolved size and variant; style overrides remain scoped', () => {
  render(
    <Card
      title="Workspace"
      bordered={false}
      size="small"
      headStyle={{ color: 'red' }}
      styles={({ props }) => ({
        header: { color: 'blue' },
        body: { padding: 4 },
        root: { opacity: props.variant === 'borderless' ? 0.5 : 1 },
      })}
    >
      Details
    </Card>,
  );
  expect(screen.getByText('Details').style.padding).toBe('4px');
  expect(
    screen.getByText('Workspace').closest('[data-tao-card-header]'),
  ).toHaveStyle({ color: 'blue' });
  expect(screen.getByText('Details').parentElement?.style.opacity).toBe('0.5');
});
test('Grid and Meta expose their documented refs and semantic parts', () => {
  const grid = createRef<CardGridRef>();
  const meta = createRef<CardMetaRef>();
  render(
    <Card>
      <Card.Grid ref={grid} hoverable={false} style={{ width: '50%' }}>
        <Card.Meta
          ref={meta}
          avatar={<span>AB</span>}
          title="Ada"
          description="Designer"
          classNames={{ section: 'details' }}
        />
      </Card.Grid>
    </Card>,
  );
  expect(grid.current?.nativeElement.style.width).toBe('50%');
  expect(grid.current?.nativeElement.dataset.taoHoverable).toBeUndefined();
  expect(meta.current?.nativeElement).toContainElement(screen.getByText('Ada'));
  expect(screen.getByText('Designer').parentElement?.className).toBe('details');
});
