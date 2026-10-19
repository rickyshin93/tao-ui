// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ArrowDownRightIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ArrowDownRightIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5.5 5.5 18.5 18.5M12 18.5h6.5V12"/>
        {children}
      </svg>
    );
  },
);
