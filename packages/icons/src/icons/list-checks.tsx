// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ListChecksIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ListChecksIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.3 6.5 1.8 1.8 3.5-3.5M12 6.5h8.4m-17.1 11 1.8 1.8 3.5-3.5M12 17.5h8.4"/>
        {children}
      </svg>
    );
  },
);
