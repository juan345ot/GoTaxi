import { useState } from 'react';

export default function useForm(initial = {}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const onChange = (field, val) => setValues({ ...values, [field]: val });
  return { values, errors, setErrors, onChange, setValues };
}
