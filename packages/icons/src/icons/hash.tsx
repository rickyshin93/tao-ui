// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const HashIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function HashIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M9.6 3.6 7 20.4M17 3.6l-2.6 16.8M4.4 8.5h15.8M3.8 15.5h15.8"/>
        {children}
      </svg>
    );
  },
);
