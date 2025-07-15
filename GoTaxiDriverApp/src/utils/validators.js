export const isEmail = email => /\S+@\S+\.\S+/.test(email);
export const minLength = (str, len) => str.length >= len;
