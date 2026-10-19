// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PenToolIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PenToolIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.6 20.4 4-13.5L18.1 4l1.9 1.9-2.9 10.5-13.5 4ZM14.9 4.9l4.2 4.2M3.9 20.1l6.5-6.5"/><circle cx="12" cy="12" r="2.2"/>
        {children}
      </svg>
    );
  },
);
