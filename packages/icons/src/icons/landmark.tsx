// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const LandmarkIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function LandmarkIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.2 8.1 8.8-4.9 8.8 4.9ZM6.4 11v7.2M12 11v7.2M17.6 11v7.2M5 18.2h14M3.2 21h17.6"/>
        {children}
      </svg>
    );
  },
);
