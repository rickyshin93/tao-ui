// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const DocumentScanIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function DocumentScanIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.5 7.5V4.7q0-1.2 1.2-1.2h2.8m9 0h2.8q1.2 0 1.2 1.2v2.8m0 9v2.8q0 1.2-1.2 1.2h-2.8m-9 0H4.7q-1.2 0-1.2-1.2v-2.8M8 9.5h8M8 14.5h6"/>
        {children}
      </svg>
    );
  },
);
