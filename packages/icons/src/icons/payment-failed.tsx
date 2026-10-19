// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PaymentFailedIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PaymentFailedIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m9 9 6 6M15 9l-6 6"/>
        {children}
      </svg>
    );
  },
);
