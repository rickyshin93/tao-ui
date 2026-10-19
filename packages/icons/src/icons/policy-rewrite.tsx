// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicyRewriteIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicyRewriteIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M10 3H3v13h4M14 8h7v13h-7ZM5 21h5m-3-3 3 3"/>
        {children}
      </svg>
    );
  },
);
