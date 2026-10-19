// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PaymentReconciliationIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PaymentReconciliationIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M7 4H4v16h3M17 4h3v16h-3M8 9.5h8M8 14.5h8"/>
        {children}
      </svg>
    );
  },
);
