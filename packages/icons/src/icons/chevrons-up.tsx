// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ChevronsUpIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ChevronsUpIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m6 14 6-6 6 6M6 20l6-6 6 6"/>
        {children}
      </svg>
    );
  },
);
