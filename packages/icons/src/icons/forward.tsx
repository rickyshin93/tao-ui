// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ForwardIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ForwardIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m15.2 5.8 4.5 4.5-4.5 4.5M19.5 10.3h-8.2q-7 0-7 7v1.3"/>
        {children}
      </svg>
    );
  },
);
