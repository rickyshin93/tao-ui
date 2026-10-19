// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CommissionPaymentIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CommissionPaymentIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="8" cy="12" r="5"/><path d="M13 12h8M17 8l4 4-4 4"/>
        {children}
      </svg>
    );
  },
);
