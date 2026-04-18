interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  hint?: string;
  placeholder?: string;
}

export default function NumberInput({ label, value, onChange, suffix, hint, placeholder }: Props) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <div className="mt-1 flex items-stretch overflow-hidden rounded-md border border-slate-300 focus-within:border-rose-500">
        <input
          inputMode="numeric"
          placeholder={placeholder}
          value={value === 0 ? '' : String(value)}
          onChange={(e) => {
            const n = Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, '')) || 0);
            onChange(n);
          }}
          className="min-w-0 flex-1 bg-white px-3 py-2 text-right text-sm tabular-nums text-slate-900 focus:outline-none"
        />
        <span className="flex items-center bg-slate-50 px-3 text-xs text-slate-500">{suffix}</span>
      </div>
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
