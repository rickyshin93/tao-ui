// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ApplicationSubmitIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ApplicationSubmitIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 14v7h16v-7M12 16V3M7 8l5-5 5 5"/>
        {children}
      </svg>
    );
  },
);
