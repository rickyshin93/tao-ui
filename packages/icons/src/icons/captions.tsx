// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CaptionsIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CaptionsIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.1" y="5.1" width="17.8" height="13.8" rx="1.8"/><path d="M10.4 9.7q-.8-.8-1.9-.8-2.1 0-2.1 3.1t2.1 3.1q1.1 0 1.9-.8M17.6 9.7q-.8-.8-1.9-.8-2.1 0-2.1 3.1t2.1 3.1q1.1 0 1.9-.8"/>
        {children}
      </svg>
    );
  },
);
