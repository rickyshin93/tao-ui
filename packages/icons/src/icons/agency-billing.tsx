// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const AgencyBillingIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function AgencyBillingIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m4 8.5 2-4h12l2 4V20H4ZM4 8.5h16"/>
        {children}
      </svg>
    );
  },
);
