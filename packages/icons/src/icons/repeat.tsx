// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const RepeatIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function RepeatIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.1 12V8.4q0-2.2 2.2-2.2h13.6m-2.8-2.8 2.8 2.8-2.8 2.8M19.9 12v3.6q0 2.2-2.2 2.2H4.1m2.8-2.8-2.8 2.8 2.8 2.8"/>
        {children}
      </svg>
    );
  },
);
