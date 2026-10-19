// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ArrowRightIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ArrowRightIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.25 12h14.4M13 6.65l5.45 5q.4.35 0 .7L13 17.35"/>
        {children}
      </svg>
    );
  },
);
