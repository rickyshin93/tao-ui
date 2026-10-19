// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClipboardIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClipboardIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8.5 5.1H6.65q-1.8 0-1.8 1.8V19q0 1.8 1.8 1.8h10.7q1.8 0 1.8-1.8V6.9q0-1.8-1.8-1.8H15.5"/><rect x="8.5" y="3.2" width="7" height="4" rx="1.1"/><path d="M8.6 12h6.8M8.6 16.1h4.8"/>
        {children}
      </svg>
    );
  },
);
