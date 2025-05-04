import React from "react";

// Re-exporting the types might be necessary if the original component uses them in props
// export * from "@/components/ui/select"; // Or define needed types manually

export const MockSelect = ({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
}) => (
  <div>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        if (
          typeof child.type !== "string" &&
          (child.type as any).displayName === "SelectContent"
        ) {
          return React.cloneElement(child as React.ReactElement<any>, {
            onValueChange,
          });
        }
      }
      return child;
    })}
  </div>
);
MockSelect.displayName = "Select";

export const MockSelectTrigger = ({
  children,
  ...props
}: { children: React.ReactNode } & any) => (
  <button {...props} role="combobox">
    {React.Children.toArray(children).find(
      (child: any) =>
        typeof child.type !== "string" &&
        (child.type as any).displayName === "SelectValue"
    ) ?? children}
  </button>
);
MockSelectTrigger.displayName = "SelectTrigger";

export const MockSelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span>{placeholder ?? "Select..."}</span>
);
MockSelectValue.displayName = "SelectValue";

export const MockSelectContent = ({
  children,
  onValueChange,
}: {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}) => (
  <div>
    {React.Children.map(children, (child) => {
      if (
        React.isValidElement(child) &&
        typeof child.type !== "string" &&
        (child.type as any).displayName === "SelectItem"
      ) {
        return React.cloneElement(child as React.ReactElement<any>, {
          onClick: () => {
            if (onValueChange && child.props.value) {
              onValueChange(child.props.value);
            }
          },
        });
      }
      return child;
    })}
  </div>
);
MockSelectContent.displayName = "SelectContent";

export const MockSelectItem = ({
  children,
  value,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  value: string;
  onClick?: () => void;
} & any) => (
  <div role="option" data-value={value} onClick={onClick} {...props}>
    {children}
  </div>
);
MockSelectItem.displayName = "SelectItem";

// Export the mocks with the original names
export const Select = MockSelect;
export const SelectTrigger = MockSelectTrigger;
export const SelectValue = MockSelectValue;
export const SelectContent = MockSelectContent;
export const SelectItem = MockSelectItem;
