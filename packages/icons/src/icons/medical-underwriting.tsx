// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MedicalUnderwritingIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MedicalUnderwritingIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <circle cx="10" cy="10" r="6"/><path d="M7 10h6M10 7v6m4.5 1.5L21 21"/>
        {children}
      </svg>
    );
  },
);
