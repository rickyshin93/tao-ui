// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ProductBuilderIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ProductBuilderIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 4h8v6h3v4h7v7H3ZM15 4h6v6"/>
        {children}
      </svg>
    );
  },
);
