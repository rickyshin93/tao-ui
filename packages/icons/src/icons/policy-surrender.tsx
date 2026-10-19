// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PolicySurrenderIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PolicySurrenderIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M11 4H4v16h7M9 12h12M17 8l4 4-4 4"/>
        {children}
      </svg>
    );
  },
);
