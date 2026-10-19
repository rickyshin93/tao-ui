// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const TypeIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function TypeIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.1 7V4h15.8v3M12 4.2v16M8.2 20.2h7.6"/>
        {children}
      </svg>
    );
  },
);
