// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RiderBenefitIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RiderBenefitIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 11a8 8 0 0 1 16 0H4ZM12 11v7q0 3 3 3t3-3"/>
        {children}
      </svg>
    );
  },
);
