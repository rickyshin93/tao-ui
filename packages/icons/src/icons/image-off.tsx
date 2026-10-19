// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ImageOffIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ImageOffIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.5 3.5 17 17M9 3.5h9.7q1.9 0 1.9 1.9v9.8M3.4 9.1v9.5q0 1.9 1.9 1.9h9.1m-10.75-2.3 4.65-3.7q.4-.3.8.1l2.7 2.8 1.1-1.4"/>
        {children}
      </svg>
    );
  },
);
