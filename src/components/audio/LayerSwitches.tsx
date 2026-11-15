"use client";

export interface LayerSwitchOption<T extends string> {
  id: T;
  label: string;
  detail?: string;
}

interface LayerSwitchesProps<T extends string> {
  legend: string;
  options: LayerSwitchOption<T>[];
  values: Record<T, boolean>;
  onChange: (values: Record<T, boolean>) => void;
  disabled?: boolean;
}

/** Keyboard-native, independently switchable sonification layers. */
export function LayerSwitches<T extends string>({
  legend,
  options,
  values,
  onChange,
  disabled = false,
}: LayerSwitchesProps<T>) {
  return (
    <fieldset className="control-set layer-set" disabled={disabled}>
      <legend>{legend}</legend>
      <div className="layer-options layer-options--stacked">
        {options.map((option, index) => (
          <label className="layer-option layer-option--wide" key={option.id}>
            <input
              checked={values[option.id]}
              data-ep-layers={index === 0 ? "" : undefined}
              onChange={(event) =>
                onChange({ ...values, [option.id]: event.currentTarget.checked })
              }
              type="checkbox"
            />
            <span>
              <span className="layer-option-label">{option.label}</span>
              {option.detail ? (
                <span className="layer-option-detail">{option.detail}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
