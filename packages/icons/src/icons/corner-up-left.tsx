// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CornerUpLeftIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CornerUpLeftIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M19.8 19.45v-8.4q0-2-2-2H4.8M9.15 4.65l-4.05 4q-.4.4 0 .8l4.05 4"/>
        {children}
      </svg>
    );
  },
);
