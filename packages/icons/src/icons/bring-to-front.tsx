// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BringToFrontIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BringToFrontIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4.1" y="4.1" width="11.8" height="11.8" rx="1.8"/><path d="M19.9 8.1v10q0 1.8-1.8 1.8h-10"/>
        {children}
      </svg>
    );
  },
);
