// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const TimerIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function TimerIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="12" cy="13.4" r="7.4"/><path d="M9.4 2.95h5.2M12 3.1v2.7m5.9 1.7 1.65-1.65M12 9.2v4.2l2.8 1.65"/>
        {children}
      </svg>
    );
  },
);
