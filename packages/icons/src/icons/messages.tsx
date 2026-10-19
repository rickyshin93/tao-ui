// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MessagesIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MessagesIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5 3.3h9.5q1.8 0 1.8 1.8v7q0 1.8-1.8 1.8H8l-4.8 3v-12q0-1.6 1.8-1.6Z"/><path d="M19.3 8.5q1.5.2 1.5 1.8v10.4l-4.6-2.8H11q-1.8 0-1.8-1.4"/>
        {children}
      </svg>
    );
  },
);
