// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ArrowLeftRightIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ArrowLeftRightIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 8h16m-4-4 4 4-4 4M20 16H4m4-4-4 4 4 4"/>
        {children}
      </svg>
    );
  },
);
