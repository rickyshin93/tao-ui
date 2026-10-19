// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const MedicalProviderIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function MedicalProviderIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="4" y="3.5" width="16" height="17" rx="1.8"/><path d="M12 7.5v9M7.5 12h9"/>
        {children}
      </svg>
    );
  },
);
