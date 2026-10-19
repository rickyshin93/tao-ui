// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CircleDashedIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CircleDashedIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M9.8 4a8.3 8.3 0 0 1 4.4 0M17.9 6.1a8.3 8.3 0 0 1 2.1 3.7M20 14.2a8.3 8.3 0 0 1-2.1 3.7M14.2 20a8.3 8.3 0 0 1-4.4 0M6.1 17.9A8.3 8.3 0 0 1 4 14.2M4 9.8a8.3 8.3 0 0 1 2.1-3.7"/>
        {children}
      </svg>
    );
  },
);
