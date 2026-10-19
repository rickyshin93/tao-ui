// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RiskSurveyIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RiskSurveyIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="5" y="4" width="14" height="17" rx="1.8"/><path d="M9 3h6v4H9ZM9 13l2 2 4-4"/>
        {children}
      </svg>
    );
  },
);
