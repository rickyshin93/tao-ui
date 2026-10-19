// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ArrowDownLeftIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ArrowDownLeftIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M18.5 5.5 5.5 18.5M5.5 12v6.5H12"/>
        {children}
      </svg>
    );
  },
);
