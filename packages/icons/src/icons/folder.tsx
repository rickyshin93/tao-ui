// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FolderIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FolderIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.1 6.1q0-1.9 1.9-1.9h3.9q.7 0 1.15.5l1.3 1.5q.45.5 1.15.5H19q1.9 0 1.9 1.9v9.3q0 1.9-1.9 1.9H5q-1.9 0-1.9-1.9Z"/><path d="M3.25 9.55H20.7"/>
        {children}
      </svg>
    );
  },
);
