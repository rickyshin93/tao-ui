// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const LanguageIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function LanguageIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M3.3 6.3h10.2M8.4 3.3v3M11.5 6.5q-.6 7-7.8 10.6M5.1 9.2q1.3 3.6 5 5.9M12.8 20.7l3.8-10.1q.2-.6.4 0l3.8 10.1M14.1 17.2h5.4"/>
        {children}
      </svg>
    );
  },
);
