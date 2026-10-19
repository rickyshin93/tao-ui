// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FingerprintIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FingerprintIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M4 11.4q0-7.9 8-7.9t8 7.9v2.1M4 15v.8q0 2.8-1 4M7.3 15.3v-3.8q0-4.6 4.7-4.6t4.7 4.6v3.2q0 3.5 1.3 5.1M7.1 18.6l-.6 1.8M11 20.5q.9-2.5.9-5.4v-3.5"/>
        {children}
      </svg>
    );
  },
);
