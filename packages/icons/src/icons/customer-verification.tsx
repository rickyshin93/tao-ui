// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CustomerVerificationIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CustomerVerificationIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="12" cy="9" r="3"/><path d="M7.5 17q0-3 4.5-3t4.5 3"/>
        {children}
      </svg>
    );
  },
);
