// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MoonIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MoonIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M19.95 14.05a8.45 8.45 0 1 1-10-10 6.85 6.85 0 0 0 10 10Z"/>
        {children}
      </svg>
    );
  },
);
