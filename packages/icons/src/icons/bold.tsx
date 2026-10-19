// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BoldIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BoldIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M7.1 12h5.25q4.15 0 4.15-3.8t-4.15-3.8H7.1V19.6h6.15q4.25 0 4.25-3.8T13.25 12"/>
        {children}
      </svg>
    );
  },
);
