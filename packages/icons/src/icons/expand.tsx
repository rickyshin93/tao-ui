// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ExpandIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ExpandIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m13.8 10.2 6.2-6.2M16.4 4H20v3.6M10.2 13.8 4 20M7.6 20H4v-3.6"/>
        {children}
      </svg>
    );
  },
);
