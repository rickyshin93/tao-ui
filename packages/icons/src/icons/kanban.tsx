// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const KanbanIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function KanbanIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="3.3" y="4.5" width="3.6" height="11.5" rx=".85"/><rect x="10.2" y="4.5" width="3.6" height="15.7" rx=".85"/><rect x="17.1" y="4.5" width="3.6" height="8.7" rx=".85"/>
        {children}
      </svg>
    );
  },
);
