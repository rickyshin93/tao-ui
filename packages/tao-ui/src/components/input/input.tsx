import { Textarea } from '../textarea/textarea';
import { BaseInput } from './base-input';
import { OTP } from './otp';
import { Password } from './password';
import { Search } from './search';

export type {
  TextareaProps as TextAreaProps,
  TextareaRef as TextAreaRef,
} from '../textarea/textarea';
export type { InputProps, InputRef, InputSemanticPart } from './base-input';
export type {
  AllowClearConfig,
  CountConfig,
  CountInfo,
  InputFocusOptions,
  InputVariant,
} from './input-shared';
export type { OTPProps, OTPRef, OTPSemanticPart } from './otp';
export type { PasswordProps, VisibilityToggle } from './password';
export type { SearchProps, SearchSemanticPart } from './search';

export const Input = Object.assign(BaseInput, {
  Password,
  Search,
  TextArea: Textarea,
  OTP,
});
