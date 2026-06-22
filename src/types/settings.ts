export interface Option {
  label: string
  value: string
  children?: Option[]
  [key: string]: any
}
export interface Result {
  item: Option | null
  parItem?: Option
}
