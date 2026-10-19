// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const CodeBlockIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function CodeBlockIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3" y="4" width="18" height="16" rx="1.8"/><path d="m9 9-3 3 3 3M15 9l3 3-3 3"/>
        {children}
      </svg>
    );
  },
);
