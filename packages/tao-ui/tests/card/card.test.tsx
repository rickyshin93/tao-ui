import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import {
  Card,
  type CardGridRef,
  type CardMetaRef,
} from '../../src/components/card/card';

test('an empty tab-extra map leaves no Card header but keeps zero', () => {
  const { container, rerender } = render(
    <Card tabList={[]} tabBarExtraContent={{ left: false, right: null }} />,
  );
  expect(container.querySelector('[data-tao-card-header]')).toBeNull();
  rerender(<Card tabList={[]} tabBarExtraContent={{ left: 0 }} />);
  expect(container.querySelector('[data-tao-card-header]')).toHaveTextContent(
    '0',
  );
});

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

test('Card keeps the tab name when its optional label is undefined', () => {
  render(
    <Card tabList={[{ key: 'details', tab: 'Details', label: undefined }]} />,
  );
  expect(screen.getByRole('tab', { name: 'Details' })).toBeVisible();
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

test('tab bar extras passed through tabProps render unless the Card overrides them', () => {
  const tabList = [{ key: 'one', label: 'Overview' }];
  const tabProps = { tabBarExtraContent: <span>Tab tools</span> };
  const { rerender } = render(<Card tabList={tabList} tabProps={tabProps} />);
  expect(screen.getByText('Tab tools')).toBeInTheDocument();
  rerender(
    <Card
      tabList={tabList}
      tabProps={tabProps}
      tabBarExtraContent={<span>Card tools</span>}
    />,
  );
  expect(screen.getByText('Card tools')).toBeInTheDocument();
  expect(screen.queryByText('Tab tools')).not.toBeInTheDocument();
});

test('Card renders tab bar extras supplied as a React node array', () => {
  render(
    <Card
      tabList={[]}
      tabBarExtraContent={[
        <span key="label">Review actions</span>,
        <button key="button" type="button">
          Retry
        </button>,
      ]}
    />,
  );

  expect(screen.getByText('Review actions')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
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

test('an empty tab list leaves no blank card header', () => {
  const view = render(<Card tabList={[]}>Content</Card>);
  expect(view.container.querySelector('[data-tao-card-header]')).toBeNull();
  expect(screen.getByText('Content')).toBeVisible();
});

test('conditional tab bar content does not leave a blank Card header', () => {
  const { container, rerender } = render(
    <Card tabList={[]} tabBarExtraContent={false}>
      Content
    </Card>,
  );
  expect(container.querySelector('[data-tao-card-header]')).toBeNull();

  rerender(
    <Card tabList={[]} tabBarExtraContent={0}>
      Content
    </Card>,
  );
  expect(container.querySelector('[data-tao-card-header]')).toHaveTextContent(
    '0',
  );
});

test('conditional actions leave no blank footer and numeric actions remain', () => {
  const { container, rerender } = render(
    <Card actions={[false, null]}>Content</Card>,
  );
  expect(container.querySelector('[data-tao-card-actions]')).toBeNull();

  rerender(<Card actions={[false, 0]}>Content</Card>);
  expect(screen.getByRole('list')).toHaveTextContent('0');
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
});
