// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PaymentAllocationIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PaymentAllocationIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 4v7M5.5 19v-8h13v8M2.5 16l3 3 3-3M15.5 16l3 3 3-3"/>
        {children}
      </svg>
    );
  },
);
