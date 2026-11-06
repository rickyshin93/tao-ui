import { expect, test } from '@rstest/core';
import dayjs from 'dayjs';
import * as locales from '../../src/locales';
import type { BuiltinTaoLocale } from '../../src/locales/types';

const packs: BuiltinTaoLocale[] = Object.values(locales);

const leafValues = (value: unknown, path = ''): Record<string, string> => {
  if (typeof value === 'string') return { [path]: value };
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      Object.entries(leafValues(child, path ? `${path}.${key}` : key)),
    ),
  );
};

test('all 17 packs provide the full component dictionary and calendar metadata', () => {
  expect(packs).toHaveLength(17);
  expect(new Set(packs.map((pack) => pack.locale)).size).toBe(17);
  for (const pack of packs) {
    expect(Object.keys(pack).sort()).toEqual(Object.keys(locales.enUS).sort());
    expect(Object.keys(pack.messages).sort()).toEqual(
      Object.keys(locales.enUS.messages).sort(),
    );
    expect(pack.weekdays).toHaveLength(7);
    expect(pack.months).toHaveLength(12);
    expect(pack.pickerLocale.locale).toBe(pack.locale);
    expect(pack.weekStartsOn).toBeGreaterThanOrEqual(0);
    expect(pack.weekStartsOn).toBeLessThanOrEqual(6);
    expect(dayjs('2026-11-06').locale(pack.dayjsLocale).locale()).toBe(
      pack.dayjsLocale,
    );
    expect(
      Intl.NumberFormat.supportedLocalesOf([pack.numberLocale]),
    ).toHaveLength(1);
    for (const value of [
      ...Object.values(pack),
      ...Object.values(pack.messages),
    ]) {
      if (typeof value === 'string')
        expect(value.trim().length).toBeGreaterThan(0);
    }
    expect(pack.remove('FILE')).toContain('FILE');
    expect(pack.otpLabel(2, 6)).toContain('2');
    expect(pack.otpLabel(2, 6)).toContain('6');
    expect(pack.messages.selectRow('ROW')).toContain('ROW');
    expect(pack.messages.resizePanels(1, 2)).toContain('1');
    expect(pack.messages.resizePanels(1, 2)).toContain('2');
    expect(pack.monthTitle(0, 2026)).not.toContain('undefined');
    expect(pack.calendarTitle(10, 2026)).not.toContain('undefined');
  }
});

test('all form messages keep interpolation variables and translate type names', () => {
  const english = leafValues(locales.enUS.form);
  const placeholders = (message: string) =>
    [...message.matchAll(/\$\{([^}]+)\}/g)].map((match) => match[1]).sort();
  for (const pack of packs) {
    const form = leafValues(pack.form);
    expect(Object.keys(form).sort()).toEqual(Object.keys(english).sort());
    for (const [path, text] of Object.entries(form)) {
      expect(text.trim().length).toBeGreaterThan(0);
      expect(placeholders(text)).toEqual(placeholders(english[path]));
      expect(text).not.toContain(`\${type}`);
    }
  }
  expect(locales.frFR.form.required).toBe(`« \${name} » est obligatoire`);
  expect(locales.zhTW.form.types?.number).toBe(`「\${name}」不是有效的數字`);
  expect(locales.deDE.form.types?.date).toContain('Datum');
  expect(locales.arEG.form.required).toContain('مطلوب');
});

test('third-language component labels and picker controls do not inherit English defaults', () => {
  expect(locales.frFR.messages.uploadFile).toBe('Importer des fichiers');
  expect(locales.deDE.messages.calendarMonth).toBe('Monat');
  expect(locales.jaJP.messages.closeNotification).toBe('通知を閉じる');
  expect(locales.zhTW.messages.downloadFile).toBe('下載檔案');
  expect(locales.enUS.pickerLocale.hourSelect).toBe('Select an hour');
  expect(locales.zhCN.pickerLocale.hourSelect).toBe('选择时');
  for (const pack of packs.filter((locale) => locale !== locales.enUS)) {
    expect(pack.pickerLocale.hourSelect).not.toBe('Select an hour');
    expect(pack.pickerLocale.minuteSelect).not.toBe('Select a minute');
    expect(pack.pickerLocale.secondSelect).not.toBe('Select a second');
    expect(pack.pickerLocale.millisecondSelect).not.toBe(
      'Select a millisecond',
    );
    expect(pack.pickerLocale.meridiemSelect).not.toBe('Select a meridiem');
    expect(pack.pickerLocale.hourSelect).toBeTruthy();
    expect(pack.pickerLocale.millisecondSelect).toBeTruthy();
  }
});

test('quantity messages use locale plural categories and digits', () => {
  expect([0, 1, 2].map(locales.enUS.messages.itemCount)).toEqual([
    '0 items',
    '1 item',
    '2 items',
  ]);
  expect([1, 2, 5, 21].map(locales.ruRU.messages.itemCount)).toEqual([
    '1 элемент',
    '2 элемента',
    '5 элементов',
    '21 элемент',
  ]);
  expect([0, 1, 2, 3, 11].map(locales.arEG.messages.itemCount)).toEqual([
    'لا عناصر',
    'عنصر واحد',
    'عنصران',
    '٣ عناصر',
    '١١ عنصرًا',
  ]);
  expect(locales.frFR.messages.itemCount(2)).toBe('2 éléments');
});

test('date names preserve Monday-first arrays and Gregorian years without changing Day.js globally', () => {
  expect(locales.enUS.weekdays).toEqual([
    'Mo',
    'Tu',
    'We',
    'Th',
    'Fr',
    'Sa',
    'Su',
  ]);
  expect(locales.zhCN.weekdays).toEqual([
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '日',
  ]);
  expect(locales.enUS.weekStartsOn).toBe(0);
  expect(locales.frFR.weekStartsOn).toBe(1);
  expect(locales.arEG.weekStartsOn).toBe(6);
  expect(locales.enUS.monthTitle(0, 42)).toBe('Jan 42');
  expect(locales.enUS.calendarTitle(0, 42)).toBe('January 42');
  expect(locales.thTH.calendarTitle(0, 2026)).toContain('2026');
  const before = dayjs.locale();
  try {
    dayjs.locale('de');
    expect(locales.frFR.calendarTitle(10, 2026)).toContain('novembre');
    expect(dayjs.locale()).toBe('de');
  } finally {
    dayjs.locale(before);
  }
});
