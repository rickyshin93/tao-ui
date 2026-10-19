// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RiskQuestionnaireIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RiskQuestionnaireIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 7a4 4 0 0 1 8 0c0 3-4 3-4 6M8 18v1M17 6h4M17 13h4M17 20h4"/>
        {children}
      </svg>
    );
  },
);
