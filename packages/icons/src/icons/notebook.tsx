// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const NotebookIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function NotebookIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="5.5" y="3.4" width="14.1" height="17.2" rx="1.8"/><path d="M3.4 7.2h4.1M3.4 12h4.1M3.4 16.8h4.1M11 7.8h5M11 11.3h3.4"/>
        {children}
      </svg>
    );
  },
);
