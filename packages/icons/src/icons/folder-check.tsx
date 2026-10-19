// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FolderCheckIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FolderCheckIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.2 6.1q0-1.8 1.8-1.8h3.6q.7 0 1.2.55l1.35 1.5q.45.5 1.15.5H19q1.8 0 1.8 1.8V18q0 1.8-1.8 1.8H5q-1.8 0-1.8-1.8Z"/><path d="M3.4 10h17.2m-11.9 4.7 2.4 2.4 4.6-4.6"/>
        {children}
      </svg>
    );
  },
);
