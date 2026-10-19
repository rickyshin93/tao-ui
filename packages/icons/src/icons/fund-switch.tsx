// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FundSwitchIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FundSwitchIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 7h18M17 3l4 4-4 4M21 17H3M7 13l-4 4 4 4"/>
        {children}
      </svg>
    );
  },
);
