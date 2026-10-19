// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const QrCodeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function QrCodeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.5" y="3.5" width="5.7" height="5.7" rx="0.5"/><rect x="14.8" y="3.5" width="5.7" height="5.7" rx="0.5"/><rect x="3.5" y="14.8" width="5.7" height="5.7" rx="0.5"/><circle cx="6.35" cy="6.35" r="0.7" fill="currentColor" stroke="none"/><circle cx="17.65" cy="6.35" r="0.7" fill="currentColor" stroke="none"/><circle cx="6.35" cy="17.65" r="0.7" fill="currentColor" stroke="none"/><path d="M14.8 14.8h5.7M14.8 18v2.5h5.7V18"/>
        {children}
      </svg>
    );
  },
);
