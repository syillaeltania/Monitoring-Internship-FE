export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const passwordChecklist = (password: string) => ({
  minLength: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
});

export const validatePasswordPair = (password: string, confirmPassword: string) => {
  const rules = passwordChecklist(password);
  const errors: string[] = [];
  if (!rules.minLength) errors.push('Password minimal 8 karakter.');
  if (!rules.uppercase) errors.push('Password harus memiliki minimal satu huruf besar.');
  if (!rules.lowercase) errors.push('Password harus memiliki minimal satu huruf kecil.');
  if (!rules.number) errors.push('Password harus memiliki minimal satu angka.');
  if (password !== confirmPassword) errors.push('Konfirmasi password belum sama.');
  return errors;
};
