// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BenefitAccumulatorIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BenefitAccumulatorIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.5" y="7" width="17" height="10" rx="1.8"/><path d="M9 7v10M15 7v10"/>
        {children}
      </svg>
    );
  },
);
