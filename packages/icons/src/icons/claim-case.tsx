// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimCaseIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimCaseIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 7V5.5q0-1.5 1.5-1.5h4l2.5 3H19q1.5 0 1.5 1.5v10q0 1.5-1.5 1.5H5q-1.5 0-1.5-1.5V7Z"/>
        {children}
      </svg>
    );
  },
);
