// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const GridIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function GridIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.6" y="3.6" width="6.5" height="6.5" rx="1.25"/><rect x="13.9" y="3.6" width="6.5" height="6.5" rx="1.25"/><rect x="3.6" y="13.9" width="6.5" height="6.5" rx="1.25"/><rect x="13.9" y="13.9" width="6.5" height="6.5" rx="1.25"/>
        {children}
      </svg>
    );
  },
);
