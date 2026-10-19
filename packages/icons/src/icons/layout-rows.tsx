// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const LayoutRowsIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function LayoutRowsIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="1.8"/><path d="M3.8 12h16.4"/>
        {children}
      </svg>
    );
  },
);
