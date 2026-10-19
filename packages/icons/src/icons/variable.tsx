// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const VariableIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function VariableIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M7 4H5q-2 8 0 16h2M17 4h2q2 8 0 16h-2M9 9l6 6M15 9l-6 6"/>
        {children}
      </svg>
    );
  },
);
