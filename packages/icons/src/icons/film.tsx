// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FilmIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FilmIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.2" y="3.8" width="17.6" height="16.4" rx="1.85"/><path d="M7.2 4v16M16.8 4v16M3.4 9.2H7m-3.6 5.6H7m10-5.6h3.6M17 14.8h3.6"/>
        {children}
      </svg>
    );
  },
);
