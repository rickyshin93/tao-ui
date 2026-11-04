import { createRef } from 'react';
import {
  QRCode,
  type QRCodeProps,
  type QRCodeRef,
  type StatusRenderInfo,
} from '../../src/components/qr-code/qr-code';

const props: QRCodeProps = {
  value: ['https://', 'tao-ui.dev'],
  type: 'svg',
  errorLevel: 'H',
  boostLevel: false,
  iconSize: { width: 24, height: 24 },
  statusRender: (info: StatusRenderInfo) => info.locale.expired,
  styles: ({ props }) => ({ root: { width: props.size } }),
};
export const code = <QRCode {...props} ref={createRef<QRCodeRef>()} />;
// @ts-expect-error Upstream exposes only four error correction levels.
export const invalid = <QRCode value="test" errorLevel="X" />;
