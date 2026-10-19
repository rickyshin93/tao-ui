// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const BookIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function BookIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5 18.7V5.3q0-1.9 1.9-1.9H19v17.2H6.9q-1.9 0-1.9-1.9t1.9-1.9H19M8.5 3.6v13M12 7.4h3.7"/>
        {children}
      </svg>
    );
  },
);
