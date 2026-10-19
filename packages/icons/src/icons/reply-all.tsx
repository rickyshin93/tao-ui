// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ReplyAllIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ReplyAllIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m6.8 6.1-4.2 4.2 4.2 4.2m4.7-8.4-4.2 4.2 4.2 4.2M7.5 10.3H14q7 0 7 7v1.3"/>
        {children}
      </svg>
    );
  },
);
