// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RocketIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RocketIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8 15c0-6 4.7-10.5 12.5-11.5C19.5 11.3 15 16 9 16M8 9H5l-2 6 5-1M15 16v3l-6 2 1-5M6 18l-2 2"/><circle cx="15" cy="9" r="2"/>
        {children}
      </svg>
    );
  },
);
