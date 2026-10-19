// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const UserIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function UserIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M16.1 7.65C16.1 10.35 14.6 11.85 12 11.85S7.9 10.35 7.9 7.65 9.4 3.45 12 3.45 16.1 4.95 16.1 7.65Z"/><path d="M4.25 20.2v-1.05c0-3.25 2.8-4.9 7.75-4.9s7.75 1.65 7.75 4.9v1.05"/>
        {children}
      </svg>
    );
  },
);
