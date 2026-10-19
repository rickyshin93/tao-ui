// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const FileIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function FileIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <path d="M12.95 3.25H5.8q-2.05 0-2.05 2.05v13.4q0 2.05 2.05 2.05h12.4q2.05 0 2.05-2.05v-7.85q0-.65-.45-1.1L14.05 3.7q-.45-.45-1.1-.45Z"/><path d="M12.95 3.4v5.9q0 1.2 1.2 1.2H20"/>
        {children}
      </svg>
    );
  },
);
