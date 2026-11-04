import {
  Cascader,
  type CascaderProps,
} from '../../src/components/cascader/cascader';

interface Place {
  value: string;
  label: string;
  population: number;
  children?: Place[];
}
const options: Place[] = [{ value: 'a', label: 'A', population: 10 }];
<Cascader
  options={options}
  onChange={(value, selected) => {
    const path: string[] = value;
    const pop: number = selected[0].population;
    void path;
    void pop;
  }}
/>;
<Cascader
  options={options}
  multiple
  onChange={(value, selected) => {
    const paths: string[][] = value;
    const pop: number = selected[0][0].population;
    void paths;
    void pop;
  }}
/>;
<Cascader.Panel
  options={options}
  multiple
  defaultValue={[['a']]}
  onChange={(values) => {
    const paths: string[][] = values;
    void paths;
  }}
/>;
const props: CascaderProps<Place, 'value', true> = {
  options,
  multiple: true,
  defaultValue: [['a']],
  styles: { popup: { listItem: { color: 'red' } } },
};
<Cascader {...props} multiple />;
// @ts-expect-error Multiple paths must use nested arrays.
<Cascader options={options} multiple value={['a']} />;
// @ts-expect-error Invalid expansion trigger.
<Cascader expandTrigger="doubleClick" />;

<Cascader size="middle" />;
<Cascader size="medium" />;
// @ts-expect-error Invalid public size.
<Cascader size="normal" />;
