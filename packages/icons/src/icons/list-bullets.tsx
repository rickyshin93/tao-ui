// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ListBulletsIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ListBulletsIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="4.8" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.8" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.8" cy="18" r="1.2" fill="currentColor" stroke="none"/><path d="M10 6h10M10 12h7M10 18h10"/>
        {children}
      </svg>
    );
  },
);
