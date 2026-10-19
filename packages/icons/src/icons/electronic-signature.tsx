// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ElectronicSignatureIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ElectronicSignatureIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m9 16 1-5 8-8 3 3-8 8-4 2ZM3 21q3-5 5-1t5 0h8"/>
        {children}
      </svg>
    );
  },
);
