const LANGUAGES = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "Englisch" },
];

interface MultiLangInputProps {
  label: string;
  value: Record<string, string>;
  onChange: (val: Record<string, string>) => void;
  required?: boolean
  multiline?: boolean
}

export function MultiLangInput({ label, value, onChange, required, multiline }: MultiLangInputProps) {
  const handleChange = (lang: string, text: string) => {
    onChange({ ...value, [lang]: text });
  };

  return (
  <fieldset className="form-i18n">
    <legend className="form-label form-i18n-legend">{label}</legend>

    <div className="form-i18n-grid">
      {LANGUAGES.map(({ code, label: langLabel }) => (
        <div key={code} className="form-i18n-item">
          <label
            className={`form-label ${required && code === "en" ? "form-label-required" : ""}`}
            htmlFor={`i18n-${code}`}
          >
            {langLabel}
          </label>

          {multiline ? (
            <textarea
              id={`i18n-${code}`}
              value={value?.[code] ?? ""}
              onChange={(e) => handleChange(code, e.target.value)}
              required={required && code === "en"}
              className="form-textarea"
              rows={3}
              placeholder={`${langLabel} eingeben`}
            />
          ) : (
            <input
              id={`i18n-${code}`}
              type="text"
              value={value?.[code] ?? ""}
              onChange={(e) => handleChange(code, e.target.value)}
              required={required && code === "en"}
              className="form-input"
              placeholder={`${langLabel} eingeben`}
            />
          )}
        </div>
      ))}
    </div>
  </fieldset>
);
}