// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimReopenIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimReopenIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 17V6q0-1.5 1.5-1.5h4l2.5 3H18q1.5 0 1.5 1.5v1.5"/><path d="M6 10.5h15l-2 9H3.5l2.5-9Z"/>
        {children}
      </svg>
    );
  },
);
