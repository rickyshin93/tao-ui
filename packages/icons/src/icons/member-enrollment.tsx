// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MemberEnrollmentIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MemberEnrollmentIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M13 3.5h6q1.5 0 1.5 1.5v14q0 1.5-1.5 1.5h-6M3.5 12H15M11 8l4 4-4 4"/>
        {children}
      </svg>
    );
  },
);
