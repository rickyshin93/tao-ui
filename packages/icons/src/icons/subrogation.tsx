// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SubrogationIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SubrogationIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 8h9a6 6 0 0 1 0 12M8 4 4 8l4 4"/>
        {children}
      </svg>
    );
  },
);
