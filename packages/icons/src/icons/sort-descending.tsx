// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const SortDescendingIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function SortDescendingIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6.2 4.6v14.8M3.3 16.55l2.5 2.5q.4.4.8 0l2.5-2.5M12 5.8h8M12 12h5.6M12 18.2h3.2"/>
        {children}
      </svg>
    );
  },
);
