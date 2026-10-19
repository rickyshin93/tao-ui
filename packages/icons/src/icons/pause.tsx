// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PauseIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PauseIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="5.25" y="4.4" width="4.35" height="15.2" rx=".8"/><rect x="14.4" y="4.4" width="4.35" height="15.2" rx=".8"/>
        {children}
      </svg>
    );
  },
);
