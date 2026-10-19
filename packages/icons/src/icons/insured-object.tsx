// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuredObjectIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuredObjectIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m12 3 8 5v9l-8 4-8-4V8ZM4 8l8 5 8-5M12 13v8"/>
        {children}
      </svg>
    );
  },
);
