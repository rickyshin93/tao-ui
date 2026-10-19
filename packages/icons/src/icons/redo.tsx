// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RedoIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RedoIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M19.55 9.25c-2.1-2.6-4.25-3.7-7.55-3.7-4.75 0-7.95 2.85-7.95 6.9 0 3.5 2.45 6 6.1 6h4.35M19.7 4.7v4.05q0 .6-.6.6H15.05"/>
        {children}
      </svg>
    );
  },
);
