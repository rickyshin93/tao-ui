// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimDenialIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimDenialIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 7V5q0-1.5 1.5-1.5h4l2.5 3H19q1.5 0 1.5 1.5v11q0 1.5-1.5 1.5H5q-1.5 0-1.5-1.5V7Z"/><path d="m9 11 6 6m0-6-6 6"/>
        {children}
      </svg>
    );
  },
);
