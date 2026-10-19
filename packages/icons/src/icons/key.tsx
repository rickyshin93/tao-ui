// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const KeyIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function KeyIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="16.2" cy="7.8" r="4.5"/><path d="m13 11-9.3 9.3M6.2 17.8l2 2M9 15l2 2"/>
        {children}
      </svg>
    );
  },
);
