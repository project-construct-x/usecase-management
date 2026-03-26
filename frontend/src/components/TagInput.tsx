import { useState } from "react";

interface Props {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export default function TagInput({ value, onChange, placeholder = "Tag eingeben ..." }: Props) {
    const [text, setText] = useState("");

    function addTag() {
        if (!text.trim()) return;
        onChange([...value, text.trim()]);
        setText("");
    }

    function remove(index: number) {
        onChange(value.filter((_, i) => i !== index));
    }

    return (
        <div className="tag-input-wrapper">
            {/* Tag-Chips */}
            {value.length > 0 && (
                <div className="tag-list">
                    {value.map((tag, i) => (
                        <span key={i} className="tag-chip">
                            {tag}
                            <button
                                type="button"
                                className="tag-chip-remove"
                                onClick={() => remove(i)}
                                aria-label={`„${tag}" entfernen`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Input + Button */}
            <div className="tag-input-row">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addTag(); }
                    }}
                    placeholder={placeholder}
                    className="form-input"
                />
                <button
                    type="button"
                    onClick={addTag}
                    className="btn btn-primary"
                >
                    Add
                </button>
            </div>
        </div>
    );
}
