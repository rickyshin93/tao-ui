// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RotateLeftIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RotateLeftIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.3 9.1a8 8 0 1 1-.3 6.3M4.3 4.8v4.3h4.3"/>
        {children}
      </svg>
    );
  },
);
