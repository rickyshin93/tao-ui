// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ArrowUpIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ArrowUpIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 19.75V5.35M6.65 11l5-5.45q.35-.4.7 0L17.35 11"/>
        {children}
      </svg>
    );
  },
);
