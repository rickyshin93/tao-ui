// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceLifeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceLifeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="7.5" r="3.5"/><path d="M5 21v-2q0-5 7-5t7 5v2"/>
        {children}
      </svg>
    );
  },
);
