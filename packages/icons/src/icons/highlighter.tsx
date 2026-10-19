// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const HighlighterIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function HighlighterIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m6.9 13.2 8.6-8.6q.8-.8 1.6 0l2.3 2.3q.8.8 0 1.6l-8.6 8.6-3.9-3.9Zm0 0-1.1 4.9 5-1M3.4 21h11.8"/>
        {children}
      </svg>
    );
  },
);
