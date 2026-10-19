// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const HeartIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function HeartIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 6.1c-2.7-3.3-8.6-2.45-8.6 2.6 0 4.15 5.15 8.55 8.05 10.85q.55.45 1.1 0c2.9-2.3 8.05-6.7 8.05-10.85 0-5.05-5.9-5.9-8.6-2.6Z"/>
        {children}
      </svg>
    );
  },
);
