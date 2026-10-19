// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const AlignLeftIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function AlignLeftIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.2 5.4h15.6M4.2 9.8H14M4.2 14.2h15.6M4.2 18.6H14"/>
        {children}
      </svg>
    );
  },
);
