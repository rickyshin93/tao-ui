// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InboxIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InboxIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.4 12.5 2.2-7q.4-1.4 1.9-1.4h9q1.5 0 1.9 1.4l2.2 7v5.6q0 1.8-1.8 1.8H5.2q-1.8 0-1.8-1.8Z"/><path d="M3.6 12.5h4.2l1.5 3h5.4l1.5-3h4.2"/>
        {children}
      </svg>
    );
  },
);
