// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceDeductibleIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceDeductibleIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 8h4v8H3ZM11 8h10v8H11Z"/>
        {children}
      </svg>
    );
  },
);
