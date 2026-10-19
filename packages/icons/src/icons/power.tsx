// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PowerIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PowerIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 3.1v8.65M7.1 5.95a8.1 8.1 0 1 0 9.8 0"/>
        {children}
      </svg>
    );
  },
);
