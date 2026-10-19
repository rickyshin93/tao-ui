// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const PhoneOffIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function PhoneOffIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="m3.5 3.2 15 17.9M6.5 10.4c-2.1 1.05-3.3 2.8-3.3 5.1v2.1q0 .9.9.9h3.2q.8 0 .9-.8l.4-2.6q.9-.4 1.8-.6M12 9.4c4.9 0 8.8 2.3 8.8 6.1v2.1q0 .9-.9.9h-3.2q-.8 0-.9-.8l-.4-2.6"/>
        {children}
      </svg>
    );
  },
);
