// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BracketsIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BracketsIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8 3.5H4.5v17H8M16 3.5h3.5v17H16"/>
        {children}
      </svg>
    );
  },
);
