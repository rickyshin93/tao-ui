// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceAgentIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceAgentIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="7" r="3.5"/><path d="M5 20v-1.2q0-5 7-5t7 5V20M9.5 14.1 12 17l2.5-2.9"/>
        {children}
      </svg>
    );
  },
);
