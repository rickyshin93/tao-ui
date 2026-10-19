// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ZapIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ZapIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m13.5 2.8-9 10h6L9.8 21l9.7-11h-6.8Z"/>
        {children}
      </svg>
    );
  },
);
