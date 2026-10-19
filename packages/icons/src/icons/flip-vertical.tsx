// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FlipVerticalIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FlipVerticalIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.2 12h3.1m4.2 0h3m4.2 0h3.1M6.4 3.5l3.4 5.3h7.8V3.5ZM6.4 20.5l3.4-5.3h7.8v5.3Z"/>
        {children}
      </svg>
    );
  },
);
