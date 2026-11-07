import { expect, test } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { QRCode, type QRCodeRef } from '../../src/components/qr-code/qr-code';
import { zhCN } from '../../src/provider/locale';
import { TaoProvider } from '../../src/provider/tao-provider';

test('SVG encodes values and reacts to error level, segment, margin and icon changes', () => {
  const { container, rerender } = render(
    <QRCode
      type="svg"
      value="tao-ui"
      aria-label="Open tao-ui"
      color="#123456"
      bgColor="#ffffff"
      boostLevel={false}
    />,
  );
  const firstPath = container
    .querySelector('path:last-of-type')!
    .getAttribute('d');
  expect(
    screen.getByRole('img', { name: 'Open tao-ui' }).tagName.toLowerCase(),
  ).toBe('svg');
  expect(
    container.querySelector('path:last-of-type')!.getAttribute('fill'),
  ).toBe('#123456');
  rerender(
    <QRCode
      type="svg"
      value={['tao', 'ui']}
      errorLevel="H"
      marginSize={4}
      icon="/logo.svg"
      iconSize={{ width: 24, height: 18 }}
    />,
  );
  expect(
    container.querySelector('path:last-of-type')!.getAttribute('d'),
  ).not.toBe(firstPath);
  expect(container.querySelector('image')!.getAttribute('href')).toBe(
    '/logo.svg',
  );
});

test('ARIA references name and describe the rendered QR image', () => {
  render(
    <>
      <h2 id="qr-label">Connect your device</h2>
      <p id="qr-description">Scan with your camera</p>
      <QRCode
        type="svg"
        value="pair-device"
        aria-labelledby="qr-label"
        aria-describedby="qr-description"
      />
    </>,
  );
  expect(
    screen.getByRole('img', { name: 'Connect your device' }),
  ).toHaveAccessibleDescription('Scan with your camera');
});

test('expired, scanned and custom status renderers receive locale and refresh behavior', () => {
  let refreshes = 0;
  const onRefresh = () => {
    refreshes += 1;
  };
  const { rerender } = render(
    <TaoProvider locale={zhCN}>
      <QRCode type="svg" value="token" status="expired" onRefresh={onRefresh} />
    </TaoProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: '刷新' }));
  expect(refreshes).toBe(1);
  rerender(<QRCode type="svg" value="token" status="scanned" />);
  expect(screen.getByRole('status').textContent).toContain('Scanned');
  rerender(
    <QRCode
      type="svg"
      value="token"
      status="loading"
      onRefresh={onRefresh}
      statusRender={({ status, onRefresh: refresh }) => (
        <button type="button" onClick={refresh}>
          {status}
        </button>
      )}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'loading' }));
  expect(refreshes).toBe(2);
});
test('semantic callbacks see defaults and the ref resolves the native bordered root', () => {
  const ref = createRef<QRCodeRef>();
  const { rerender } = render(
    <QRCode
      ref={ref}
      type="svg"
      value="native"
      size={220}
      className="external"
      classNames={({ props }) => ({ root: `status-${props.status}` })}
      styles={{ root: { padding: 8 }, cover: { color: 'red' } }}
    />,
  );
  expect(ref.current!.nativeElement.className).toContain('status-active');
  expect(ref.current!.nativeElement.style.width).toBe('220px');
  expect(ref.current!.nativeElement.style.padding).toBe('8px');
  expect(ref.current!.nativeElement.getAttribute('data-bordered')).toBe('true');
  rerender(<QRCode ref={ref} type="svg" value="" />);
  expect(document.querySelector('[data-tao-qr-code]')).toBeNull();
  expect(ref.current).toBeNull();
  rerender(<QRCode ref={ref} type="svg" value="ref restored" />);
  expect(ref.current?.nativeElement).toHaveAttribute('data-tao-qr-code', '');
});
