import React from "react";

interface Props {
  label: string;
  value: any;
  onChange: (val: any) => void;
  type?: string;
}

const FormField: React.FC<Props> = ({ label, value, onChange, type = "text" }) => {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ display: "block", padding: "6px", width: "100%" }}
      />
    </div>
  );
};

export default FormField;
