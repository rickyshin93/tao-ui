// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BellOffIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BellOffIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.5 3.5 17 17M9.2 4.45q1.25-.55 2.8-.55c4.05 0 6.35 2.55 6.35 6.6v1.45M5.85 8.35q-.2 1-.2 2.15v1.9c0 1.4-.35 2.4-1.15 3.6-.65 1-.05 2.2 1.15 2.2h8.7M9.6 20.6q2.4 1.55 4.8 0"/>
        {children}
      </svg>
    );
  },
);
