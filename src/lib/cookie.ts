'use client';

export function getCookie(name: string) {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    let val = parts.pop()?.split(';').shift();

    try {
      val = JSON.parse(val as string);
    } catch (e) {}

    return val;
  }
  return null;
}

export function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}
