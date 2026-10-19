// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BookmarkMinusIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BookmarkMinusIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6.3 5.2q0-1.9 1.9-1.9h7.6q1.9 0 1.9 1.9v15.3L12 16.9l-5.7 3.6Z"/><path d="M9.3 10h5.4"/>
        {children}
      </svg>
    );
  },
);
