// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SendIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SendIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.4 10.4 20.6 3.4l-7 17.2-2.9-7.3Z"/><path d="m10.7 13.3 9.7-9.7"/>
        {children}
      </svg>
    );
  },
);
