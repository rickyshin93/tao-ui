// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceAutoIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceAutoIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 11 6 5h12l2 6M3 11h18v7H3ZM6 18v2M18 18v2"/>
        {children}
      </svg>
    );
  },
);
