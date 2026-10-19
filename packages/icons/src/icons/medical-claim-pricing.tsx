// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MedicalClaimPricingIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MedicalClaimPricingIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 20h16M7 16v-5M12 16V8M17 16V4"/>
        {children}
      </svg>
    );
  },
);
