// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SignpostIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SignpostIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4.2 4.8h13.5l3.1 2.6-3.1 2.6H4.2ZM19.8 13.3H6.3l-3.1 2.6 3.1 2.6h13.5ZM12 3.1v1.5M12 10.2v2.9M12 18.7v2.6"/>
        {children}
      </svg>
    );
  },
);
