// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FolderOpenIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FolderOpenIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.3 16.9V6.1q0-1.8 1.8-1.8h3.5q.7 0 1.2.55l1.35 1.5q.45.5 1.15.5h5.8q1.8 0 1.8 1.8v1.1"/><path d="M5.4 10.6h14.1q1.9 0 1.4 1.85l-1.5 5.7q-.4 1.55-2 1.55H5.2q-1.9 0-1.4-1.85l1.6-7.25Z"/>
        {children}
      </svg>
    );
  },
);
