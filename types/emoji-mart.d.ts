declare module 'emoji-mart' {
  // Minimal typings for emoji-mart Picker we use
  export interface EmojiData { id?: string; native?: string; colons?: string }
  export interface PickerProps {
    onSelect: (emoji: EmojiData) => void
    [key: string]: any
  }
  export const Picker: (props: PickerProps) => any
}


