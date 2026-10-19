// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MoveIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MoveIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12 3.5v17M3.5 12h17M9.8 5.7 12 3.5l2.2 2.2M9.8 18.3l2.2 2.2 2.2-2.2M5.7 9.8 3.5 12l2.2 2.2M18.3 9.8l2.2 2.2-2.2 2.2"/>
        {children}
      </svg>
    );
  },
);
