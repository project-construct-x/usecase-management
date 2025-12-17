import { useState } from "react";

interface Props {
    value: string[];
    onChange: (tags: string[]) => void;
}

export default function TagInput({ value, onChange }: Props) {
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
        <div className="flex flex-col gap-2">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {value.map((tag, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-1 rounded-full"
                    >
                        <span>{tag}</span>
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            className="text-gray-500 hover:text-red-500 focus:outline-none"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Input + Add Button */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={addTag}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Add
                </button>
            </div>
        </div>
    );
}
