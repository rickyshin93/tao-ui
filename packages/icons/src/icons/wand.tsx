// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const WandIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function WandIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m4 18 12-12 2 2L6 20ZM12.5 9.5l2 2M5 3v4M3 5h4M19 14v4M17 16h4"/>
        {children}
      </svg>
    );
  },
);
