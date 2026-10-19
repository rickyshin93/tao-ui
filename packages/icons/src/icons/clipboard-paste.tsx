// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const ClipboardPasteIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function ClipboardPasteIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M8 20H5.5q-1.5 0-1.5-1.5V6q0-1.5 1.5-1.5H8M16 4.5h2.5Q20 4.5 20 6v2"/><rect x="8" y="2.5" width="8" height="4" rx="1.2"/><rect x="11" y="10" width="9" height="11" rx="1.4"/>
        {children}
      </svg>
    );
  },
);
