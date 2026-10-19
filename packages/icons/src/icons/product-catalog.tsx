// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ProductCatalogIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ProductCatalogIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4" y="7" width="14" height="14" rx="1.8"/><path d="M8 7V3h13v14"/>
        {children}
      </svg>
    );
  },
);
