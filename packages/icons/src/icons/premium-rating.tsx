// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PremiumRatingIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PremiumRatingIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 8h4M11 8h10M3 16h10M17 16h4"/><circle cx="9" cy="8" r="2"/><circle cx="15" cy="16" r="2"/>
        {children}
      </svg>
    );
  },
);
