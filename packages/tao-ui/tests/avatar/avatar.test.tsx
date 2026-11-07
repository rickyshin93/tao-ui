import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, Fragment } from 'react';
import {
  Avatar,
  type AvatarGroupRef,
} from '../../src/components/avatar/avatar';
import { TaoProvider } from '../../src/provider/tao-provider';

test('failed images fall back to the icon before children and new sources retry', () => {
  const { rerender } = render(
    <Avatar src="broken.png" alt="Profile" icon={<span>Icon</span>}>
      AB
    </Avatar>,
  );
  fireEvent.error(screen.getByAltText('Profile'));
  expect(screen.getByText('Icon')).toBeTruthy();
  expect(screen.queryByText('AB')).toBeNull();
  rerender(
    <Avatar src="new.png" alt="Profile">
      AB
    </Avatar>,
  );
  expect(screen.getByAltText('Profile').getAttribute('src')).toBe('new.png');
});
test('returning false prevents automatic image fallback', () => {
  render(
    <Avatar src="broken.png" alt="Profile" onError={() => false}>
      AB
    </Avatar>,
  );
  fireEvent.error(screen.getByAltText('Profile'));
  expect(screen.getByAltText('Profile')).toBeTruthy();
  expect(screen.queryByText('AB')).toBeNull();
});

test('retries an earlier failed image after changing to another source', () => {
  const { rerender } = render(
    <Avatar src="first.png" alt="Profile">
      AB
    </Avatar>,
  );
  fireEvent.error(screen.getByAltText('Profile'));
  expect(screen.getByText('AB')).toBeInTheDocument();
  rerender(
    <Avatar src="second.png" alt="Profile">
      AB
    </Avatar>,
  );
  expect(screen.getByAltText('Profile')).toHaveAttribute('src', 'second.png');
  rerender(
    <Avatar src="first.png" alt="Profile">
      AB
    </Avatar>,
  );
  expect(screen.getByAltText('Profile')).toHaveAttribute('src', 'first.png');
});

test('renders a native image when only srcSet supplies a source', () => {
  render(
    <Avatar srcSet="small.png 1x, large.png 2x" alt="Profile">
      AB
    </Avatar>,
  );
  const image = screen.getByAltText('Profile');
  expect(image).toHaveAttribute('srcset', 'small.png 1x, large.png 2x');
  fireEvent.error(image);
  expect(screen.getByText('AB')).toBeInTheDocument();
});

test('retries a failed avatar when the image request mode changes', () => {
  const { rerender } = render(
    <Avatar src="profile.png" crossOrigin="anonymous" alt="Profile">
      AB
    </Avatar>,
  );
  fireEvent.error(screen.getByAltText('Profile'));
  expect(screen.getByText('AB')).toBeVisible();

  rerender(
    <Avatar src="profile.png" alt="Profile">
      AB
    </Avatar>,
  );
  expect(screen.getByAltText('Profile')).not.toHaveAttribute('crossorigin');
});
test('forwards span refs, numeric sizes and native image attributes', () => {
  const ref = createRef<HTMLSpanElement>();
  render(
    <Avatar
      ref={ref}
      size={48}
      shape="square"
      src="one.png"
      srcSet="two.png 2x"
      crossOrigin="anonymous"
      draggable={false}
      alt="Profile"
    />,
  );
  expect(ref.current?.style.width).toBe('48px');
  expect(ref.current?.dataset.taoShape).toBe('square');
  expect(screen.getByAltText('Profile').getAttribute('crossorigin')).toBe(
    'anonymous',
  );
  expect(screen.getByAltText('Profile').getAttribute('srcset')).toBe(
    'two.png 2x',
  );
});
test('group sizes override provider defaults and child sizes override the group', () => {
  const group = createRef<AvatarGroupRef>();
  render(
    <TaoProvider size="large">
      <Avatar.Group ref={group} size="small" shape="square">
        <Avatar>A</Avatar>
        <Avatar size={50}>B</Avatar>
      </Avatar.Group>
    </TaoProvider>,
  );
  expect(screen.getByText('A').parentElement?.dataset.taoSize).toBe('small');
  expect(screen.getByText('A').parentElement?.dataset.taoShape).toBe('square');
  expect(screen.getByText('B').parentElement?.style.width).toBe('50px');
  expect(group.current?.nativeElement).toContainElement(screen.getByText('A'));
});
test('group overflow reveals hidden avatars using the configured trigger', async () => {
  render(
    <Avatar.Group max={{ count: 1, popover: { trigger: 'click' } }}>
      <Avatar>A</Avatar>
      <Fragment key="overflow">
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
      </Fragment>
    </Avatar.Group>,
  );
  expect(screen.queryByText('B')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '2 more users' }));
  expect(await screen.findByText('B')).toBeTruthy();
  expect(screen.getByText('C')).toBeTruthy();
});
test('semantic slots style text and root independently', () => {
  render(
    <Avatar
      classNames={{ root: 'person', content: 'initials' }}
      styles={{ root: { color: 'red' }, content: { fontWeight: 600 } }}
    >
      AB
    </Avatar>,
  );
  expect(screen.getByText('AB').className).toBe('initials');
  expect(screen.getByText('AB').style.fontWeight).toBe('600');
  expect(screen.getByText('AB').parentElement?.style.color).toBe('red');
});

test('default group overflow can be revealed by keyboard focus', async () => {
  render(
    <Avatar.Group max={{ count: 1 }}>
      <Avatar>Visible</Avatar>
      <Avatar>Overflow user</Avatar>
    </Avatar.Group>,
  );
  const overflow = screen.getByRole('button');
  fireEvent.focus(overflow);
  expect(await screen.findByRole('dialog')).toHaveTextContent('Overflow user');
});

test('Avatar.Group keeps distinct state for local keys in keyed fragments', () => {
  const view = (labels: string[]) => (
    <Avatar.Group>
      {labels.map((label) => (
        <Fragment key={label}>
          <Avatar key="avatar" src={<input aria-label={label} />} />
        </Fragment>
      ))}
    </Avatar.Group>
  );
  const { rerender } = render(view(['First', 'Second']));
  const first = screen.getByRole('textbox', { name: 'First' });
  fireEvent.change(first, { target: { value: 'Edited' } });

  rerender(view(['Second', 'First']));

  expect(screen.getByRole('textbox', { name: 'First' })).toBe(first);
  expect(first).toHaveValue('Edited');
});
