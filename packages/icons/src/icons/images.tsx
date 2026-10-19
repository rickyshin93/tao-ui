// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ImagesIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ImagesIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="6.9" y="3.5" width="14" height="14" rx="1.8"/><path d="M3.1 7.3V19q0 1.8 1.8 1.8h11.7"/><circle cx="11.1" cy="7.9" r="1.8"/><path d="m7.1 15.6 6.3-4.4 7.2 5.2"/>
        {children}
      </svg>
    );
  },
);
