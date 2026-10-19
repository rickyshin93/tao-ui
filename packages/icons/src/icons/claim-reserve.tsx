// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClaimReserveIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClaimReserveIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <ellipse cx="12" cy="5.5" rx="7" ry="2.5"/><path d="M5 5.5v12c0 3.3 14 3.3 14 0v-12M5 11.5c0 3.3 14 3.3 14 0"/>
        {children}
      </svg>
    );
  },
);
