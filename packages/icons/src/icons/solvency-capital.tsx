// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SolvencyCapitalIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SolvencyCapitalIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5 10h5v10.5H5V10ZM14 3.5h5v17h-5v-17Z"/>
        {children}
      </svg>
    );
  },
);
