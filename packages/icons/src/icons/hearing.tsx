// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const HearingIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function HearingIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8 10V8.6a5.5 5.5 0 0 1 11 0c0 4.1-3.8 5.6-3.8 8.6q0 3.5-3.6 3.5-3 0-3.7-2.8M11.5 8.8a2.1 2.1 0 0 1 4.2 0q0 1.6-2 3-1.4 1.1-1.4 2.5M4.2 7.8q-2.4 4.1 0 8.2"/>
        {children}
      </svg>
    );
  },
);
