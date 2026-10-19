// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceQuoteIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceQuoteIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 4h12l6 8-6 8H3ZM7 12h7"/>
        {children}
      </svg>
    );
  },
);
