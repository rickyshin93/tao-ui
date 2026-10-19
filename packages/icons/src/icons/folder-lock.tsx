// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FolderLockIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FolderLockIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.2 6.1q0-1.8 1.8-1.8h3.6q.7 0 1.2.55l1.35 1.5q.45.5 1.15.5H19q1.8 0 1.8 1.8V18q0 1.8-1.8 1.8H5q-1.8 0-1.8-1.8Z"/><rect x="8.1" y="12.9" width="7.8" height="4.8" rx="1"/><path d="M9.7 12.8v-2a2.3 2.3 0 0 1 4.6 0v2"/>
        {children}
      </svg>
    );
  },
);
