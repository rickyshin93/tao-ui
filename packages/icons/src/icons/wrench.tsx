// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const WrenchIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function WrenchIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M14.5 3.5a6 6 0 0 0-7.2 7.8l-4 6.2a2.5 2.5 0 0 0 3.2 3.2l6.2-4a6 6 0 0 0 7.8-7.2L17 13l-5-1-1-5Z"/>
        {children}
      </svg>
    );
  },
);
