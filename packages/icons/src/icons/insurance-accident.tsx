// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const InsuranceAccidentIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function InsuranceAccidentIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M5 4h5v7l4 3h6v6H9l-4-7ZM9 12l-3 4"/>
        {children}
      </svg>
    );
  },
);
