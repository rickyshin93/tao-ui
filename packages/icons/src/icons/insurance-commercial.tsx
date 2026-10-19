// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceCommercialIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceCommercialIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 9 5 3h14l2 6ZM5 9v12h14V9M9 21v-7h6v7"/>
        {children}
      </svg>
    );
  },
);
