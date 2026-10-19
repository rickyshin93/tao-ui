// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PriorAuthorizationIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PriorAuthorizationIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M14 3.5H6q-1.5 0-1.5 1.5v14q0 1.5 1.5 1.5h12q1.5 0 1.5-1.5V9L14 3.5ZM14 3.5V9h5.5"/><path d="m8 14 2.5 2.5 5-5"/>
        {children}
      </svg>
    );
  },
);
