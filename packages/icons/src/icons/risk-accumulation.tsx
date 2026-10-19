// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RiskAccumulationIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RiskAccumulationIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5 21v-6M12 21V9M19 21V3"/>
        {children}
      </svg>
    );
  },
);
