// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ProviderContractIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ProviderContractIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6 3.5h12q1.5 0 1.5 1.5v15.5H6q-1.5 0-1.5-1.5V5q0-1.5 1.5-1.5Z"/><path d="m8 15 3.5-5 1 5 3.5-3"/>
        {children}
      </svg>
    );
  },
);
