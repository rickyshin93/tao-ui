// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const LossEventIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function LossEventIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4" y="4" width="16" height="16" rx="1.8"/><path d="m13 4-4 6 5 4-3 6"/>
        {children}
      </svg>
    );
  },
);
