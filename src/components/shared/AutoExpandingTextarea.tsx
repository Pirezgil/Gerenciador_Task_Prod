'use client';

import React, { useRef, useEffect, TextareaHTMLAttributes } from 'react';

interface AutoExpandingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

export function AutoExpandingTextarea({ value, ...props }: AutoExpandingTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      {...props}
    />
  );
}
