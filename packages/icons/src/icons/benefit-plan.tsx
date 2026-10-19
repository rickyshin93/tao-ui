// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BenefitPlanIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BenefitPlanIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.5" y="7" width="17" height="4" rx="1"/><path d="M5 11v9h14v-9M12 7v13"/>
        {children}
      </svg>
    );
  },
);
