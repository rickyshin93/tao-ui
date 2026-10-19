// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MaximizeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MaximizeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M9 3.8H5.6q-1.8 0-1.8 1.8V9M15 3.8h3.4q1.8 0 1.8 1.8V9M20.2 15v3.4q0 1.8-1.8 1.8H15M9 20.2H5.6q-1.8 0-1.8-1.8V15"/>
        {children}
      </svg>
    );
  },
);
