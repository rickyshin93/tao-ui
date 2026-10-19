// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FlagIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FlagIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5.45 21V3.6h6.2q.6 0 .85.55l.75 1.6q.25.55.85.55h4.45q.75 0 .75.75v6.45q0 .75-.75.75h-5.2q-.6 0-.85-.55l-.75-1.6q-.25-.55-.85-.55H5.65"/>
        {children}
      </svg>
    );
  },
);
