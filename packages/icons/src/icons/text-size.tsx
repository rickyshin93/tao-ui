// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const TextSizeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function TextSizeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.1 20.2 4.5-16.2 4.5 16.2M4.9 13.8h5.4m4.8 6.4 3-9.2 3 9.2M16.3 16.8h3.6"/>
        {children}
      </svg>
    );
  },
);
