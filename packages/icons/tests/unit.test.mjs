import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import React, { createRef, act } from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import * as icons from '../dist/index.js';

const canonical = JSON.parse(await readFile(new URL('../data/icons.json', import.meta.url), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('../data/manifest.json', import.meta.url), 'utf8'));
const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function svg(markup) { const d = document.createElement('div'); d.innerHTML = markup; return d.querySelector('svg'); }
function geometry(el) { return [...el.children].filter(x => x.tagName !== 'title').map(x => [x.tagName, [...x.attributes].map(a => [a.name, a.value]).sort()]); }

test('all root and subpath exports; all recorded SVG geometry is unchanged', async () => {
  assert.equal(Object.keys(icons).length, manifest.count);
  assert.equal((await readdir(new URL('../dist/icons/', import.meta.url))).filter(x => x.endsWith('.js')).length, manifest.count);
  for (const item of manifest.icons) {
    const Component = icons[item.component];
    const direct = await import(`../dist/icons/${item.name}.js`);
    assert.equal(direct[item.component], Component);
    const actual = svg(renderToStaticMarkup(React.createElement(Component)));
    const expected = svg(`<svg>${canonical.icons[item.name]}</svg>`);
    assert.deepEqual(geometry(actual), geometry(expected), item.name);
    for (const [key, value] of Object.entries({ width: '24', height: '24', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '1.8', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' })) {
      assert.equal(actual.getAttribute(key), value, `${item.name}: ${key}`);
    }
    assert.equal(actual.getAttribute('role'), null);
  }
});

test('title names, caller-owned title IDs, external ARIA labels and explicit overrides', () => {
  const render = props => svg(renderToStaticMarkup(React.createElement(icons.SearchIcon, props)));
  const titled = render({ title: '搜索' });
  assert.equal(titled.getAttribute('aria-label'), '搜索');
  assert.equal(titled.getAttribute('role'), 'img');
  assert.equal(titled.getAttribute('aria-hidden'), null);
  assert.equal(titled.querySelector('title').textContent, '搜索');
  assert.equal(titled.querySelector('title').id, '');
  const linked = render({ title: '搜索', titleId: 'search-title-1' });
  assert.equal(linked.getAttribute('aria-labelledby'), 'search-title-1');
  assert.equal(linked.querySelector('title').id, 'search-title-1');
  assert.equal(linked.getAttribute('aria-label'), null);
  const external = render({ title: 'Tooltip', titleId: 'tip', 'aria-labelledby': 'visible-label' });
  assert.equal(external.getAttribute('aria-labelledby'), 'visible-label');
  assert.equal(external.getAttribute('aria-label'), null);
  const label = render({ title: 'Tooltip', titleId: 'tip', 'aria-label': 'Open search' });
  assert.equal(label.getAttribute('aria-label'), 'Open search');
  assert.equal(label.getAttribute('aria-labelledby'), null);
  const hidden = render({ title: 'Tooltip', 'aria-hidden': true });
  assert.equal(hidden.getAttribute('aria-hidden'), 'true');
  assert.equal(hidden.getAttribute('role'), null);
  const overrides = render({ size: '1em', width: 32, height: 28, strokeWidth: 2, color: 'red', className: 'my-icon', style: { display: 'block' }, 'data-test': 'svg', role: 'presentation', 'aria-hidden': false });
  assert.equal(overrides.getAttribute('width'), '32');
  assert.equal(overrides.getAttribute('height'), '28');
  assert.equal(overrides.getAttribute('stroke-width'), '2');
  assert.equal(overrides.getAttribute('color'), 'red');
  assert.equal(overrides.getAttribute('class'), 'my-icon');
  assert.equal(overrides.getAttribute('data-test'), 'svg');
  assert.equal(overrides.getAttribute('role'), 'presentation');
  assert.equal(overrides.getAttribute('aria-hidden'), 'false');
  assert.equal(overrides.style.display, 'block');
  const repeated = renderToStaticMarkup(React.createElement('div', null, React.createElement(icons.SearchIcon, { title: 'One' }), React.createElement(icons.SearchIcon, { title: 'Two' })));
  assert.doesNotMatch(repeated, /\sid=/);
});

test('forwarded SVG ref, native handlers and children work in a mounted client', async () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  const ref = createRef();
  let clicks = 0;
  await act(() => root.render(React.createElement(icons.SearchIcon, { ref, onClick: () => clicks++, 'aria-label': 'Search' }, React.createElement('desc', null, 'Extra description'))));
  assert.ok(ref.current instanceof window.SVGElement);
  assert.equal(ref.current.tagName, 'svg');
  assert.equal(ref.current.querySelector('desc').textContent, 'Extra description');
  await act(() => ref.current.dispatchEvent(new window.MouseEvent('click', { bubbles: true })));
  assert.equal(clicks, 1);
  await act(() => root.unmount());
  assert.equal(ref.current, null);
});

test('SSR/hydration has stable markup and no duplicate automatic IDs', async () => {
  const element = React.createElement('div', null, React.createElement(icons.SearchIcon, { title: 'Search' }), React.createElement(icons.SearchIcon, { title: 'Find', titleId: 'find-title' }));
  const container = document.createElement('div');
  container.innerHTML = renderToString(element);
  const before = container.innerHTML;
  const errors = [];
  let root;
  await act(() => { root = hydrateRoot(container, element, { onRecoverableError: e => errors.push(e.message) }); });
  assert.deepEqual(errors, []);
  assert.equal(container.innerHTML, before);
  await act(() => root.unmount());
});

test('root and every component retain client boundaries; React stays external', async () => {
  assert.match(await readFile(new URL('../dist/index.js', import.meta.url), 'utf8'), /^['"]use client['"];/);
  for (const item of manifest.icons) {
    const file = await readFile(new URL(`../dist/icons/${item.name}.js`, import.meta.url), 'utf8');
    assert.match(file, /^['"]use client['"];/);
    assert.match(file, /from ['"]react['"]/);
    assert.doesNotMatch(file, /useId|__SECRET_INTERNALS/);
    assert.match(file, /(?:@|#)__PURE__/);
  }
});
