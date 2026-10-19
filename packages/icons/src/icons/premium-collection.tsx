// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PremiumCollectionIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PremiumCollectionIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 13v5q0 2 2 2h12q2 0 2-2v-5M12 3v11M8 10l4 4 4-4"/>
        {children}
      </svg>
    );
  },
);
