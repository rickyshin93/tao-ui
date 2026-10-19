// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const UnderlineIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function UnderlineIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6.7 3.8v7q0 5.3 5.3 5.3t5.3-5.3v-7M4.5 20.2h15"/>
        {children}
      </svg>
    );
  },
);
