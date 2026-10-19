// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ArrowUpRightIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ArrowUpRightIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m6.3 17.7 11.4-11.4M9.7 5.9h7.8q.6 0 .6.6v7.8"/>
        {children}
      </svg>
    );
  },
);
