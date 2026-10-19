// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RiskScoreIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RiskScoreIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 18a9 9 0 1 1 16 0M12 14l5-7"/>
        {children}
      </svg>
    );
  },
);
