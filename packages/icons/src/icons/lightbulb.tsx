// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const LightbulbIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function LightbulbIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8.5 17v-2c-2-1.3-3.1-3.2-3.1-5.4a6.6 6.6 0 0 1 13.2 0c0 2.2-1.1 4.1-3.1 5.4v2ZM9 20.5h6"/>
        {children}
      </svg>
    );
  },
);
