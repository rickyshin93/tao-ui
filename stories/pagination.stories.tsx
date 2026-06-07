import { Pagination } from '@rockshin/tao-ui';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta = {
  title: '导航 Navigation/Pagination',
};
export default meta;

export const Basic: StoryObj = {
  render: () => {
    function Demo() {
      const [page, setPage] = useState(1);
      return (
        <Pagination total={100} current={page} onChange={(p) => setPage(p)} />
      );
    }
    return <Demo />;
  },
};

export const WithTotal: StoryObj = {
  render: () => {
    function Demo() {
      const [page, setPage] = useState(1);
      return (
        <Pagination
          total={95}
          current={page}
          pageSize={10}
          onChange={(p) => setPage(p)}
          showTotal={(t, [s, e]) => `${s}-${e} of ${t}`}
        />
      );
    }
    return <Demo />;
  },
};

export const SizeChanger: StoryObj = {
  render: () => {
    function Demo() {
      const [page, setPage] = useState(1);
      const [ps, setPs] = useState(10);
      return (
        <Pagination
          total={200}
          current={page}
          pageSize={ps}
          onChange={(p, s) => {
            setPage(p);
            setPs(s);
          }}
          showSizeChanger
        />
      );
    }
    return <Demo />;
  },
};

export const Sizes: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Pagination total={50} size="small" />
      <Pagination total={50} size="medium" />
      <Pagination total={50} size="large" />
    </div>
  ),
};
