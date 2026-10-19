// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MaturityBenefitIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MaturityBenefitIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6 3h12v3q0 3-4.5 6Q18 15 18 18v3H6v-3q0-3 4.5-6Q6 9 6 6Z"/>
        {children}
      </svg>
    );
  },
);
