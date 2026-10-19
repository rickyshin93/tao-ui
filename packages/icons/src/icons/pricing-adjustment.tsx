// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PricingAdjustmentIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PricingAdjustmentIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="10" cy="12" r="6"/><path d="M18 4v5M15.5 6.5h5M17 19h4"/>
        {children}
      </svg>
    );
  },
);
