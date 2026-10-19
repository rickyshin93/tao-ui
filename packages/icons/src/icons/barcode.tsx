// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BarcodeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BarcodeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.4 4.8v14.4M6.6 4.8v14.4M10.4 4.8v14.4M13.6 4.8v14.4M17.4 4.8v14.4M20.6 4.8v14.4"/>
        {children}
      </svg>
    );
  },
);
