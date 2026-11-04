import assert from 'node:assert/strict';
import { renderToString } from 'react-dom/server';
import * as ui from '../../dist/index.js';

// Import the built ESM directly so tsconfig source aliases cannot hide interop bugs.
const cases = {
  Tree: <ui.Tree treeData={[{ key: 'a', title: 'Root' }]} />,
  TreeSelect: <ui.TreeSelect treeData={[{ value: 'a', title: 'Alpha' }]} />,
  Cascader: <ui.Cascader options={[{ value: 'a', label: 'Alpha' }]} />,
  AutoComplete: <ui.AutoComplete options={[{ value: 'Alpha' }]} />,
  Mentions: <ui.Mentions options={[{ value: 'alice' }]} />,
  Image: <ui.Image src="pixel.png" alt="Pixel" />,
  Carousel: (
    <ui.Carousel>
      <div>First slide</div>
      <div>Second slide</div>
    </ui.Carousel>
  ),
  Tour: <ui.Tour open={false} steps={[{ title: 'Welcome' }]} />,
  Rate: <ui.Rate defaultValue={3} />,
  Slider: <ui.Slider defaultValue={20} />,
  Form: (
    <ui.Form>
      <ui.Form.Item name="field">
        <ui.Input />
      </ui.Form.Item>
    </ui.Form>
  ),
  Tabs: <ui.Card tabList={[{ key: 'a', tab: 'Alpha' }]} />,
  Listy: (
    <ui.Listy
      items={[{ id: 'a', name: 'Alpha' }]}
      rowKey="id"
      itemRender={(item) => item.name}
    />
  ),
  ColorPicker: <ui.ColorPicker value="#1677ff" />,
  Upload: (
    <ui.Upload>
      <ui.Button>Upload</ui.Button>
    </ui.Upload>
  ),
};

for (const [name, element] of Object.entries(cases)) {
  assert.doesNotThrow(
    () => renderToString(<ui.TaoProvider>{element}</ui.TaoProvider>),
    `${name}: built ESM must render with Node's default package resolution`,
  );
}
assert.equal(ui.Cascader.SHOW_PARENT, 'SHOW_PARENT');
assert.equal(ui.Cascader.SHOW_CHILD, 'SHOW_CHILD');
assert.equal(ui.TreeSelect.SHOW_ALL, 'SHOW_ALL');
assert.equal(ui.TreeSelect.SHOW_PARENT, 'SHOW_PARENT');
assert.equal(ui.TreeSelect.SHOW_CHILD, 'SHOW_CHILD');
for (const member of [
  ui.Tree.DirectoryTree,
  ui.Tree.TreeNode,
  ui.Tree.useTree,
  ui.TreeSelect.TreeNode,
  ui.Cascader.Panel,
  ui.AutoComplete.Option,
  ui.Mentions.Option,
  ui.Mentions.getMentions,
  ui.Image.PreviewGroup,
  ui.Upload.Dragger,
  ui.Upload.LIST_IGNORE,
  ui.Form.Item,
  ui.Form.List,
  ui.Form.Provider,
  ui.Form.useForm,
  ui.Form.useWatch,
  ui.Form.useFormInstance,
]) {
  assert.notEqual(member, undefined, 'Engine compound export is available');
}
console.log(
  `Node SSR passed for ${Object.keys(cases).length} built component engines.`,
);
