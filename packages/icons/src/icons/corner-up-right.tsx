// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CornerUpRightIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CornerUpRightIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.2 19.45v-8.4q0-2 2-2h13M14.85 4.65l4.05 4q.4.4 0 .8l-4.05 4"/>
        {children}
      </svg>
    );
  },
);
