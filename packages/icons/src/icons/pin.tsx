// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PinIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PinIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M9 3.5h6M10 3.5v5l-3.5 5v2h11v-2l-3.5-5v-5M12 15.5v5"/>
        {children}
      </svg>
    );
  },
);
