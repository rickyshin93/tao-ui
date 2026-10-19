// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ItalicIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ItalicIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M10.2 4.4h8M5.8 19.6h8M14.8 4.6l-5.6 14.8"/>
        {children}
      </svg>
    );
  },
);
