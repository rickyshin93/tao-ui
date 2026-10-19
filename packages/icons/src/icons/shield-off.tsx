// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ShieldOffIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ShieldOffIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8 4.5 12 3l8 3v5.2c0 1.7-.4 3.2-1.3 4.6M15.8 19.1A26 26 0 0 1 12 21.2c-5.1-2.5-8-5.6-8-10V8M3 3l18 18"/>
        {children}
      </svg>
    );
  },
);
