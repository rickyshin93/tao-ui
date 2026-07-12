import type { ComponentDoc } from './component-doc';
import { breadcrumbDoc } from './components/breadcrumb.doc';
import { buttonDoc } from './components/button.doc';
import { checkboxDoc } from './components/checkbox.doc';
import { collapsibleDoc } from './components/collapsible.doc';
import { contextMenuDoc } from './components/context-menu.doc';
import { datePickerDoc } from './components/date-picker.doc';
import { drawerDoc } from './components/drawer.doc';
import { dropdownDoc } from './components/dropdown.doc';
import { formActionsDoc } from './components/form-actions.doc';
import { formFieldDoc } from './components/form-field.doc';
import { formLayoutDoc } from './components/form-layout.doc';
import { formSectionDoc } from './components/form-section.doc';
import { headlessInputNumberDoc } from './components/headless-input-number.doc';
import { inputDoc } from './components/input.doc';
import { inputNumberDoc } from './components/input-number.doc';
import { modalDoc } from './components/modal.doc';
import { paginationDoc } from './components/pagination.doc';
import { radioDoc } from './components/radio.doc';
import { rangePickerDoc } from './components/range-picker.doc';
import { scrollAreaDoc } from './components/scroll-area.doc';
import { selectDoc } from './components/select.doc';
import { sonnerDoc } from './components/sonner.doc';
import { spinnerDoc } from './components/spinner.doc';
import { splitterDoc } from './components/splitter.doc';
import { stackDoc } from './components/stack.doc';
import { switchDoc } from './components/switch.doc';
import { tableDoc } from './components/table.doc';
import { tabsDoc } from './components/tabs.doc';
import { tagDoc } from './components/tag.doc';
import { taoProviderDoc } from './components/tao-provider.doc';
import { textareaDoc } from './components/textarea.doc';

export const componentDocs = [
  breadcrumbDoc,
  buttonDoc,
  checkboxDoc,
  collapsibleDoc,
  contextMenuDoc,
  datePickerDoc,
  drawerDoc,
  dropdownDoc,
  formActionsDoc,
  formFieldDoc,
  formLayoutDoc,
  formSectionDoc,
  headlessInputNumberDoc,
  inputDoc,
  inputNumberDoc,
  modalDoc,
  paginationDoc,
  radioDoc,
  rangePickerDoc,
  scrollAreaDoc,
  selectDoc,
  sonnerDoc,
  spinnerDoc,
  splitterDoc,
  stackDoc,
  switchDoc,
  tableDoc,
  tabsDoc,
  tagDoc,
  taoProviderDoc,
  textareaDoc,
] satisfies ComponentDoc[];

export function getComponentDoc(name: string): ComponentDoc | undefined {
  const normalizedName = name.toLowerCase();

  return componentDocs.find((doc) => {
    if (doc.name.toLowerCase() === normalizedName) {
      return true;
    }

    return doc.exports.some(
      (exportName) => exportName.toLowerCase() === normalizedName,
    );
  });
}
