// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const UnderwritingDeclineIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function UnderwritingDeclineIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3 11a9 8 0 0 1 18 0H3M8 15l8 6M16 15l-8 6"/>
        {children}
      </svg>
    );
  },
);
