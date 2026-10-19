// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CornerDownLeftIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CornerDownLeftIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M19 4v9a3 3 0 0 1-3 3H5m5-5-5 5 5 5"/>
        {children}
      </svg>
    );
  },
);
