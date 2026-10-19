// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SignalOffIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SignalOffIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.5 3.5 17 17M4 17v3M9 13.2V20M14 7v3M14 18v2M19 3v11.8"/>
        {children}
      </svg>
    );
  },
);
