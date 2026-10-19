// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ArchiveIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ArchiveIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.2" y="3.8" width="17.6" height="4.5" rx="1.3"/><path d="M4.7 8.5v9.8q0 1.8 1.8 1.8h11q1.8 0 1.8-1.8V8.5M9.7 12h4.6"/>
        {children}
      </svg>
    );
  },
);
