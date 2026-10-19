// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const HourglassIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function HourglassIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6 3.5h12M6 20.5h12M7 3.5v4c0 2.5 3.2 3.1 5 4.5-1.8 1.4-5 2-5 4.5v4M17 3.5v4c0 2.5-3.2 3.1-5 4.5 1.8 1.4 5 2 5 4.5v4"/>
        {children}
      </svg>
    );
  },
);
