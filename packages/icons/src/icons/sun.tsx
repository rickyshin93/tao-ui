// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SunIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SunIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="12" r="4.1"/><path d="M12 3v1.9m0 14.2V21M3 12h1.9m14.2 0H21M5.65 5.65 7 7m10 10 1.35 1.35M5.65 18.35 7 17M17 7l1.35-1.35"/>
        {children}
      </svg>
    );
  },
);
