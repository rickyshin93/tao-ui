// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const HeadingIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function HeadingIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M6.6 4.5v15M17.4 4.5v15M6.8 12h10.4"/>
        {children}
      </svg>
    );
  },
);
