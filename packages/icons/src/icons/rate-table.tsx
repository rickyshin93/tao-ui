// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RateTableIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RateTableIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 4v16h16M4 12h8M12 4v16M15 9l5-5"/>
        {children}
      </svg>
    );
  },
);
