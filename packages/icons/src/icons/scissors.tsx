// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ScissorsIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ScissorsIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="6.5" cy="6.5" r="3.1"/><circle cx="6.5" cy="17.5" r="3.1"/><path d="m8.7 8.7 11.8 11.8M8.7 15.3 20.5 3.5"/>
        {children}
      </svg>
    );
  },
);
