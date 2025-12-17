interface Option {
    id: number;
    name: string;
}

interface Props {
    options: Option[];
    value: number[];
    onChange: (ids: number[]) => void;
}

export default function MultiSelect({ options, value, onChange }: Props) {
    function toggle(id: number) {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {options.map((o) => (
                <label
                    key={o.id}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                    <input
                        type="checkbox"
                        checked={value.includes(o.id)}
                        onChange={() => toggle(o.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{o.name}</span>
                </label>
            ))}
        </div>
    );
}