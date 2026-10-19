// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const UnlinkIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function UnlinkIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m11 6.8 1.9-1.9c1.8-1.8 4.4-1.8 6.2 0s1.8 4.4 0 6.2L17.2 13M13 17.2l-1.9 1.9c-1.8 1.8-4.4 1.8-6.2 0s-1.8-4.4 0-6.2L6.8 11M4.6 4.6l2.7 2.7m9.4 9.4 2.7 2.7"/>
        {children}
      </svg>
    );
  },
);
