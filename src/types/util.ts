// Use like WithChildren<Props> to denote that a component can also have children,
// besides its normal props.
export type WithChildren<T = {}> = T & { children?: React.ReactNode };
