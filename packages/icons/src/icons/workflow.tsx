// 由 data/icons.json 生成（原 330 批准图标 + 新通用候选）；执行 npm run generate。
'use client';

import { forwardRef } from 'react';
import type { IconProps } from '../types.js';
import { resolveIconProps } from '../icon-props.js';

export const WorkflowIcon = /* @__PURE__ */ forwardRef<SVGSVGElement, IconProps>(
  function WorkflowIcon(props, ref) {
    const { title, titleId, children, svgProps } = resolveIconProps(props);
    return (
      <svg {...svgProps} ref={ref}>
        {title ? <title id={titleId}>{title}</title> : null}
        <rect x="8.5" y="3.2" width="7" height="5.3" rx="1.3"/><rect x="3.1" y="15.2" width="7" height="5.3" rx="1.3"/><rect x="13.9" y="15.2" width="7" height="5.3" rx="1.3"/><path d="M12 8.7v3.2M6.6 15v-3.1h10.8V15"/>
        {children}
      </svg>
    );
  },
);
